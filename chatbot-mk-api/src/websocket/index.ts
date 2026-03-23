import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Chatbot } from "../models/Chatbot";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { Team } from "../models/Team";
import { AIService } from "../services/AIService";
import { EmbeddingService } from "../services/EmbeddingService";
import { checkMessageLimit } from "../utils/planLimits";
import { v4 as uuidv4 } from "uuid";

// Simple per-socket rate limiting for WebSocket messages
const socketMessageCounts = new Map<string, { count: number; resetAt: number }>();
const WS_MAX_MESSAGES_PER_MINUTE = 10;
const WS_MAX_MESSAGE_LENGTH = 5000;

function checkSocketRateLimit(socketId: string): boolean {
  const now = Date.now();
  const entry = socketMessageCounts.get(socketId);
  if (!entry || now > entry.resetAt) {
    socketMessageCounts.set(socketId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  entry.count++;
  return entry.count <= WS_MAX_MESSAGES_PER_MINUTE;
}

export function setupWebSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  // Optional authentication middleware — validates token if provided
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query.token;
    if (token) {
      try {
        jwt.verify(token as string, env.jwtSecret, { algorithms: ["HS256"] });
      } catch {
        return next(new Error("Invalid authentication token"));
      }
    }
    // Widget connections don't require auth — chatbot ownership is verified per-message
    next();
  });

  io.on("connection", (socket: Socket) => {
    const chatbotId = socket.handshake.query.chatbotId as string;
    const sessionId = (socket.handshake.query.sessionId as string) || uuidv4();

    if (!chatbotId) {
      socket.emit("error", { message: "chatbotId is required" });
      socket.disconnect();
      return;
    }

    socket.join(`session:${sessionId}`);

    socket.on("message", async (data: { content: string }) => {
      try {
        // Rate limit
        if (!checkSocketRateLimit(socket.id)) {
          socket.emit("error", { message: "Too many messages, please slow down", code: "RATE_LIMITED" });
          return;
        }

        // Validate message length
        if (!data?.content || typeof data.content !== "string") {
          socket.emit("error", { message: "Message content is required" });
          return;
        }
        if (data.content.length > WS_MAX_MESSAGE_LENGTH) {
          socket.emit("error", { message: `Message too long. Maximum ${WS_MAX_MESSAGE_LENGTH} characters.` });
          return;
        }

        const chatbot = await Chatbot.findOne({ _id: chatbotId, status: "active" });
        if (!chatbot) {
          socket.emit("error", { message: "Chatbot not found or inactive" });
          return;
        }

        // Check message limit
        const team = await Team.findById(chatbot.teamId);
        if (!team) {
          socket.emit("error", { message: "Team not found" });
          return;
        }

        const limitCheck = await checkMessageLimit(team._id, team.plan);
        if (!limitCheck.allowed) {
          socket.emit("error", {
            message: `Достигнат е лимитот на пораки (${limitCheck.used}/${limitCheck.limit}). Надградете го вашиот план.`,
            code: "LIMIT_REACHED",
          });
          return;
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
          chatbotId,
          sessionId,
          status: "active",
        });
        if (!conversation) {
          conversation = await Conversation.create({
            chatbotId,
            sessionId,
            channel: "web",
          });
        }

        // Save user message
        await Message.create({
          conversationId: conversation._id,
          role: "user",
          content: data.content,
        });

        // RAG context
        const relevantChunks = await EmbeddingService.searchSimilar(chatbot._id, data.content);
        const ragContext = relevantChunks.join("\n\n---\n\n");

        // Conversation history
        const history = await Message.find({ conversationId: conversation._id })
          .sort({ createdAt: -1 })
          .limit(10);

        const chatMessages = history
          .reverse()
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        // Stream response
        const stream = await AIService.chatStream(
          chatbot.config.model,
          chatbot.config.systemPrompt,
          ragContext,
          chatMessages,
          chatbot.config.temperature
        );

        let fullContent = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullContent += delta;
            socket.emit("stream", { content: delta });
          }
        }

        // Save assistant message
        const assistantMsg = await Message.create({
          conversationId: conversation._id,
          role: "assistant",
          content: fullContent,
        });

        socket.emit("stream_end", {
          messageId: assistantMsg._id,
          sessionId,
        });
      } catch (err) {
        console.error("WebSocket message error:", err);
        socket.emit("error", { message: "Failed to process message" });
      }
    });

    socket.on("disconnect", () => {
      socket.leave(`session:${sessionId}`);
      socketMessageCounts.delete(socket.id);
    });
  });

  return io;
}
