import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Chatbot } from "../models/Chatbot";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { Team } from "../models/Team";
import { AppError } from "../middleware/errorHandler";
import { AIService } from "../services/AIService";
import { EmbeddingService } from "../services/EmbeddingService";
import { AuthRequest } from "../types";
import { parsePagination } from "../utils/pagination";
import { checkMessageLimit } from "../utils/planLimits";

// Public endpoint — used by widget
export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { chatbotId, sessionId, message } = req.body;

  if (!chatbotId || !message) {
    throw new AppError(400, "chatbotId and message are required");
  }

  const chatbot = await Chatbot.findOne({ _id: chatbotId, status: "active" });
  if (!chatbot) throw new AppError(404, "Chatbot not found or inactive");

  // Check message limit for the team that owns this chatbot
  const team = await Team.findById(chatbot.teamId);
  if (!team) throw new AppError(404, "Team not found");

  const limitCheck = await checkMessageLimit(team._id, team.plan);
  if (!limitCheck.allowed) {
    throw new AppError(403, `Достигнат е лимитот на пораки (${limitCheck.used}/${limitCheck.limit}). Надградете го вашиот план.`);
  }

  // Find or create conversation
  const sid = sessionId || uuidv4();
  let conversation = await Conversation.findOne({ chatbotId, sessionId: sid, status: "active" });
  if (!conversation) {
    conversation = await Conversation.create({
      chatbotId,
      sessionId: sid,
      channel: "web",
    });
  }

  // Save user message
  await Message.create({
    conversationId: conversation._id,
    role: "user",
    content: message,
  });

  // RAG: retrieve relevant context
  const relevantChunks = await EmbeddingService.searchSimilar(chatbot._id, message);
  const ragContext = relevantChunks.join("\n\n---\n\n");

  // Get conversation history (last 10 messages)
  const history = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(10);

  const chatMessages = history
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Generate AI response
  const { content, tokens } = await AIService.chat(
    chatbot.config.model,
    chatbot.config.systemPrompt,
    ragContext,
    chatMessages,
    chatbot.config.temperature
  );

  // Save assistant message
  const assistantMsg = await Message.create({
    conversationId: conversation._id,
    role: "assistant",
    content,
    tokens,
  });

  res.json({
    sessionId: sid,
    message: {
      id: assistantMsg._id,
      role: "assistant",
      content,
    },
  });
}

// Authenticated playground — works on any chatbot status (draft/active/paused)
export async function playgroundMessage(req: AuthRequest, res: Response): Promise<void> {
  const chatbotId = req.params.chatbotId as string;
  const { message, sessionId } = req.body;

  if (!message) {
    throw new AppError(400, "message is required");
  }

  const chatbot = await Chatbot.findOne({ _id: chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  // Check message limit
  const team = await Team.findById(req.user!.teamId);
  if (!team) throw new AppError(404, "Team not found");

  const limitCheck = await checkMessageLimit(team._id, team.plan);
  if (!limitCheck.allowed) {
    throw new AppError(403, `Достигнат е лимитот на пораки (${limitCheck.used}/${limitCheck.limit}). Надградете го вашиот план.`);
  }

  const sid = sessionId || `playground:${uuidv4()}`;
  let conversation = await Conversation.findOne({ chatbotId, sessionId: sid, status: "active" });
  if (!conversation) {
    conversation = await Conversation.create({
      chatbotId,
      sessionId: sid,
      channel: "web",
    });
  }

  await Message.create({
    conversationId: conversation._id,
    role: "user",
    content: message,
  });

  const relevantChunks = await EmbeddingService.searchSimilar(chatbot._id, message);
  const ragContext = relevantChunks.join("\n\n---\n\n");

  const history = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(10);

  const chatMessages = history
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const { content, tokens } = await AIService.chat(
    chatbot.config.model,
    chatbot.config.systemPrompt,
    ragContext,
    chatMessages,
    chatbot.config.temperature
  );

  const assistantMsg = await Message.create({
    conversationId: conversation._id,
    role: "assistant",
    content,
    tokens,
  });

  res.json({
    sessionId: sid,
    message: {
      id: assistantMsg._id,
      role: "assistant",
      content,
    },
  });
}

// Authenticated endpoint — get message usage for a team
export async function getUsage(req: AuthRequest, res: Response): Promise<void> {
  const team = await Team.findById(req.user!.teamId);
  if (!team) throw new AppError(404, "Team not found");

  const limitCheck = await checkMessageLimit(team._id, team.plan);
  res.json(limitCheck);
}

// Public endpoint — submit feedback on a message
export async function submitFeedback(req: Request, res: Response): Promise<void> {
  const { messageId, feedback } = req.body;

  if (!messageId || !["positive", "negative"].includes(feedback)) {
    throw new AppError(400, "messageId and feedback (positive/negative) are required");
  }

  const msg = await Message.findByIdAndUpdate(messageId, { feedback }, { new: true });
  if (!msg) throw new AppError(404, "Message not found");

  res.json({ message: "Feedback recorded" });
}

// Public endpoint — end conversation with satisfaction rating
export async function endConversation(req: Request, res: Response): Promise<void> {
  const { conversationId, satisfaction } = req.body;

  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { status: "ended", satisfaction },
    { new: true }
  );

  if (!conversation) throw new AppError(404, "Conversation not found");
  res.json({ message: "Conversation ended" });
}

// Authenticated endpoint — list conversations for a chatbot
export async function listConversations(req: AuthRequest, res: Response): Promise<void> {
  const chatbotId = req.params.chatbotId as string;
  const chatbot = await Chatbot.findOne({ _id: chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

  const [conversations, total] = await Promise.all([
    Conversation.find({ chatbotId: chatbot._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Conversation.countDocuments({ chatbotId: chatbot._id }),
  ]);

  // Enrich each conversation with message count and first user message preview
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const [messageCount, firstUserMsg, lastMsg] = await Promise.all([
        Message.countDocuments({ conversationId: conv._id }),
        Message.findOne({ conversationId: conv._id, role: "user" }).sort({ createdAt: 1 }),
        Message.findOne({ conversationId: conv._id }).sort({ createdAt: -1 }),
      ]);
      return {
        ...conv.toObject(),
        messageCount,
        preview: firstUserMsg?.content?.slice(0, 100) || "",
        lastMessageAt: lastMsg?.createdAt || conv.updatedAt,
      };
    })
  );

  res.json({ conversations: enriched, total, page, limit });
}

// Authenticated endpoint — get messages for a conversation
export async function getConversationMessages(req: AuthRequest, res: Response): Promise<void> {
  // Verify the conversation belongs to a chatbot owned by the user's team
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw new AppError(404, "Conversation not found");

  const chatbot = await Chatbot.findOne({ _id: conversation.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(403, "Access denied");

  const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
  res.json(messages);
}

// Authenticated endpoint — escalate a conversation
export async function escalateConversation(req: AuthRequest, res: Response): Promise<void> {
  // Verify the conversation belongs to a chatbot owned by the user's team
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw new AppError(404, "Conversation not found");

  const chatbot = await Chatbot.findOne({ _id: conversation.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(403, "Access denied");

  conversation.status = "escalated";
  await conversation.save();
  res.json(conversation);
}
