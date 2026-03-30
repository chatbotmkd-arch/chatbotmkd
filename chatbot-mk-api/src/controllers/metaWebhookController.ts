import { Request, Response } from "express";
import crypto from "crypto";
import { MetaConnection } from "../models/MetaConnection";
import { MessageLog } from "../models/MessageLog";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { AIService } from "../services/AIService";
import { EmbeddingService } from "../services/EmbeddingService";
import { MetaService, MetaTokenError } from "../services/MetaService";
import { decrypt } from "../utils/encryption";
import { env } from "../config/env";

/**
 * Step 4a — Webhook verification (GET).
 * Meta calls this once to verify our endpoint.
 */
export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.metaWebhookVerifyToken) {
    // Meta expects the challenge echoed back as plain text
    res.set("Content-Type", "text/plain").status(200).send(String(challenge));
  } else {
    res.sendStatus(403);
  }
}

/**
 * Verify X-Hub-Signature-256 header to ensure payload is from Meta.
 */
function verifySignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature || !env.metaAppSecret) return false;

  const expected = "sha256=" + crypto
    .createHmac("sha256", env.metaAppSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Step 4b — Incoming message handler (POST).
 * All DMs from all connected pages hit this single endpoint.
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  // Always respond 200 immediately — Meta retries on timeout
  res.sendStatus(200);

  // Verify signature — always require it when META_APP_SECRET is configured
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!env.metaAppSecret) {
    console.error("META_APP_SECRET not configured — rejecting webhook payload");
    return;
  }
  if (!verifySignature((req as any).rawBody, signature)) {
    console.error("Meta webhook signature verification failed");
    return;
  }

  const body = req.body;
  const objectType = body.object; // "page" or "instagram"

  if (objectType !== "page" && objectType !== "instagram") return;

  const entries = body.entry || [];

  for (const entry of entries) {
    const pageOrAccountId = entry.id;
    const messagingEvents = entry.messaging || [];

    for (const event of messagingEvents) {
      if (!event.message?.text) continue; // Skip non-text messages

      const senderPsid = event.sender.id;
      const messageText = event.message.text;
      const channel: "facebook" | "instagram" = objectType === "instagram" ? "instagram" : "facebook";

      // Process asynchronously so we don't block
      processIncomingMessage(pageOrAccountId, senderPsid, messageText, channel).catch((err) => {
        console.error(`Error processing ${channel} message for page ${pageOrAccountId}:`, err);
      });
    }
  }
}

/**
 * Core message processing pipeline:
 * 1. Look up connection → 2. Log inbound → 3. RAG + LLM → 4. Send reply → 5. Log outbound
 */
async function processIncomingMessage(
  pageId: string,
  senderPsid: string,
  messageText: string,
  channel: "facebook" | "instagram"
): Promise<void> {
  // 1. Look up which customer owns this page
  const connection = await MetaConnection.findOne({ pageId, status: "active" });
  if (!connection) {
    // Also check by instagramAccountId for Instagram DMs
    const igConnection = await MetaConnection.findOne({ instagramAccountId: pageId, status: "active" });
    if (!igConnection) {
      console.warn(`No active connection found for page/account: ${pageId}`);
      return;
    }
    return processIncomingMessage(igConnection.pageId, senderPsid, messageText, channel);
  }

  let pageAccessToken: string;
  try {
    pageAccessToken = decrypt(connection.pageAccessTokenEncrypted);
  } catch {
    console.error(`Failed to decrypt token for page ${pageId}`);
    return;
  }

  // 2. Log inbound message
  await MessageLog.create({
    teamId: connection.teamId,
    pageId,
    senderPsid,
    direction: "inbound",
    messageText,
    channel,
  });

  // 3. Load chatbot and generate AI response
  const { Chatbot } = await import("../models/Chatbot");
  const chatbot = await Chatbot.findOne({ _id: connection.chatbotId, status: "active" });
  if (!chatbot) {
    console.warn(`Chatbot ${connection.chatbotId} not found or inactive for page ${pageId}`);
    return;
  }

  // Find or create conversation for this sender
  const sessionId = `meta:${channel}:${senderPsid}`;
  let conversation = await Conversation.findOne({
    chatbotId: chatbot._id,
    sessionId,
    status: "active",
  });
  if (!conversation) {
    conversation = await Conversation.create({
      chatbotId: chatbot._id,
      sessionId,
      channel,
    });
  }

  // Save user message to conversation
  await Message.create({
    conversationId: conversation._id,
    role: "user",
    content: messageText,
  });

  // RAG retrieval
  const relevantChunks = await EmbeddingService.searchSimilar(chatbot._id, messageText);
  const ragContext = relevantChunks.join("\n\n---\n\n");

  // Get recent conversation history
  const history = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(10);

  const chatMessages = history
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Generate reply
  const { content: replyText, tokens } = await AIService.chat(
    chatbot.config.model,
    chatbot.config.systemPrompt,
    ragContext,
    chatMessages,
    chatbot.config.temperature
  );

  // Save assistant message
  await Message.create({
    conversationId: conversation._id,
    role: "assistant",
    content: replyText,
    tokens,
  });

  // 4. Send reply back via Meta API
  try {
    if (channel === "instagram" && connection.instagramAccountId) {
      await MetaService.sendInstagramMessage(
        connection.instagramAccountId,
        senderPsid,
        replyText,
        pageAccessToken
      );
    } else {
      await MetaService.sendFacebookMessage(senderPsid, replyText, pageAccessToken);
    }
  } catch (err) {
    if (err instanceof MetaTokenError) {
      // Token is invalid — mark connection as error
      console.error(`Token error for page ${pageId}, marking as error`);
      connection.status = "error";
      await connection.save();
      // TODO: send customer notification email
      return;
    }
    throw err;
  }

  // 5. Log outbound message
  await MessageLog.create({
    teamId: connection.teamId,
    pageId,
    senderPsid,
    direction: "outbound",
    messageText: replyText,
    tokensUsed: tokens,
    channel,
  });
}
