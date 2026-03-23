import { Router } from "express";
import {
  sendMessage, playgroundMessage, submitFeedback, endConversation,
  listConversations, getConversationMessages, escalateConversation, getUsage,
} from "../controllers/chatController";
import { authenticate } from "../middleware/auth";
import { chatLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";
import { validateMessageLength, validateObjectIds } from "../middleware/validators";

const router = Router();

// Public endpoints (used by widget)
router.post("/message", chatLimiter, validateMessageLength(5000), asyncHandler(sendMessage));
router.post("/feedback", asyncHandler(submitFeedback));
router.post("/end", asyncHandler(endConversation));

// Playground (authenticated — works on any status)
router.post("/playground/:chatbotId", authenticate, validateObjectIds("chatbotId"), validateMessageLength(5000), asyncHandler(playgroundMessage as any));

// Usage check
router.get("/usage", authenticate, asyncHandler(getUsage as any));

// Authenticated endpoints
router.get("/chatbots/:chatbotId/conversations", authenticate, validateObjectIds("chatbotId"), asyncHandler(listConversations));
router.get("/conversations/:conversationId/messages", authenticate, validateObjectIds("conversationId"), asyncHandler(getConversationMessages));
router.post("/conversations/:conversationId/escalate", authenticate, validateObjectIds("conversationId"), asyncHandler(escalateConversation));

export default router;
