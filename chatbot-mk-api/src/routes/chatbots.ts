import { Router } from "express";
import {
  listChatbots, getChatbot, createChatbot, updateChatbot,
  deleteChatbot, deployChatbot, pauseChatbot, getEmbedCode,
} from "../controllers/chatbotController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listChatbots));
router.post("/", asyncHandler(createChatbot));
router.get("/:id", asyncHandler(getChatbot));
router.put("/:id", asyncHandler(updateChatbot));
router.delete("/:id", asyncHandler(deleteChatbot));
router.post("/:id/deploy", asyncHandler(deployChatbot));
router.post("/:id/pause", asyncHandler(pauseChatbot));
router.get("/:id/embed", asyncHandler(getEmbedCode));

export default router;
