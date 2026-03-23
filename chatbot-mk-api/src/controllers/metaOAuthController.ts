import { Response } from "express";
import { MetaConnection } from "../models/MetaConnection";
import { Chatbot } from "../models/Chatbot";
import { MetaService } from "../services/MetaService";
import { encrypt, decrypt } from "../utils/encryption";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";
import { env } from "../config/env";

const OAUTH_SCOPES = [
  "pages_messaging",
  "pages_read_engagement",
  "pages_manage_metadata",
  "instagram_basic",
  "instagram_manage_messages",
].join(",");

/**
 * Step 2a — Initiate OAuth.
 * Frontend calls this, gets a redirect URL back.
 */
export async function initiateOAuth(req: AuthRequest, res: Response): Promise<void> {
  const { chatbotId } = req.query;
  if (!chatbotId) throw new AppError(400, "chatbotId query param is required");

  // Verify chatbot belongs to user's team
  const chatbot = await Chatbot.findOne({ _id: chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const redirectUri = `${env.appUrl}/api/auth/facebook/callback`;

  // State encodes teamId + chatbotId so we can look it up on callback
  const state = Buffer.from(
    JSON.stringify({ teamId: req.user!.teamId, chatbotId: chatbot._id.toString() })
  ).toString("base64url");

  const oauthUrl =
    `https://www.facebook.com/${env.metaApiVersion}/dialog/oauth` +
    `?client_id=${env.metaAppId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${OAUTH_SCOPES}` +
    `&response_type=code` +
    `&state=${state}`;

  res.json({ url: oauthUrl });
}

/**
 * Step 2b — OAuth callback from Meta.
 * Exchanges code for tokens, fetches pages, redirects to page-selection UI.
 */
export async function oauthCallback(req: AuthRequest, res: Response): Promise<void> {
  const { code, state } = req.query;

  if (!code || !state) {
    res.redirect(`${env.corsOrigin}/dashboard?meta_error=missing_params`);
    return;
  }

  let stateData: { teamId: string; chatbotId: string };
  try {
    stateData = JSON.parse(Buffer.from(state as string, "base64url").toString());
  } catch {
    res.redirect(`${env.corsOrigin}/dashboard?meta_error=invalid_state`);
    return;
  }

  try {
    const redirectUri = `${env.appUrl}/api/auth/facebook/callback`;

    // Exchange code → short-lived token → long-lived token
    const shortToken = await MetaService.exchangeCodeForToken(code as string, redirectUri);
    const longToken = await MetaService.getLongLivedToken(shortToken);

    // Get pages
    const pages = await MetaService.getUserPages(longToken);

    if (pages.length === 0) {
      res.redirect(`${env.corsOrigin}/dashboard?meta_error=no_pages`);
      return;
    }

    // Store pages temporarily so the frontend can show a picker.
    // We encode them in the redirect URL. For a single page, auto-connect.
    const pagesParam = Buffer.from(JSON.stringify(
      pages.map((p) => ({ id: p.id, name: p.name, token: p.access_token }))
    )).toString("base64url");

    res.redirect(
      `${env.corsOrigin}/dashboard?meta_pages=${pagesParam}` +
      `&meta_chatbot=${stateData.chatbotId}` +
      `&meta_team=${stateData.teamId}`
    );
  } catch (err) {
    console.error("Meta OAuth error:", err);
    res.redirect(`${env.corsOrigin}/dashboard?meta_error=oauth_failed`);
  }
}

/**
 * Step 2c — Confirm page selection.
 * Called by frontend after user picks a page from the list.
 */
export async function connectPage(req: AuthRequest, res: Response): Promise<void> {
  const { pageId, pageName, pageAccessToken, chatbotId } = req.body;

  if (!pageId || !pageAccessToken || !chatbotId) {
    throw new AppError(400, "pageId, pageAccessToken, and chatbotId are required");
  }

  // Verify chatbot belongs to team
  const chatbot = await Chatbot.findOne({ _id: chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  // Check if page is already connected
  const existing = await MetaConnection.findOne({ pageId });
  if (existing && existing.status === "active") {
    throw new AppError(409, "This page is already connected");
  }

  // Step 2d — Check for linked Instagram account
  let instagramAccountId: string | null = null;
  try {
    instagramAccountId = await MetaService.getInstagramAccount(pageId, pageAccessToken);
  } catch {
    // Non-fatal — page might not have Instagram linked
  }

  // Step 3 — Subscribe webhook
  await MetaService.subscribePageWebhook(pageId, pageAccessToken);

  // Store connection with encrypted token
  const connection = await MetaConnection.findOneAndUpdate(
    { pageId },
    {
      teamId: req.user!.teamId,
      chatbotId: chatbot._id,
      pageId,
      pageName: pageName || pageId,
      pageAccessTokenEncrypted: encrypt(pageAccessToken),
      instagramAccountId,
      webhookSubscribed: true,
      status: "active",
      connectedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  res.status(201).json({
    id: connection._id,
    pageId: connection.pageId,
    pageName: connection.pageName,
    instagramAccountId: connection.instagramAccountId,
    status: connection.status,
  });
}

/**
 * Step 8 — Disconnect a page.
 */
export async function disconnectPage(req: AuthRequest, res: Response): Promise<void> {
  const { pageId } = req.body;
  if (!pageId) throw new AppError(400, "pageId is required");

  const connection = await MetaConnection.findOne({ pageId, teamId: req.user!.teamId });
  if (!connection) throw new AppError(404, "Connection not found");

  // Unsubscribe from webhook
  try {
    const token = decrypt(connection.pageAccessTokenEncrypted);
    await MetaService.unsubscribePageWebhook(pageId, token);
  } catch (err) {
    console.error("Failed to unsubscribe webhook:", err);
    // Continue with disconnect even if unsub fails
  }

  // Mark as disconnected and clear token
  connection.status = "disconnected";
  connection.webhookSubscribed = false;
  connection.pageAccessTokenEncrypted = "";
  await connection.save();

  res.json({ message: "Page disconnected" });
}

/**
 * Get connection status for dashboard UI.
 */
export async function getConnectionStatus(req: AuthRequest, res: Response): Promise<void> {
  const connections = await MetaConnection.find({ teamId: req.user!.teamId })
    .select("pageId pageName instagramAccountId status webhookSubscribed chatbotId connectedAt")
    .sort({ connectedAt: -1 });

  res.json(connections);
}
