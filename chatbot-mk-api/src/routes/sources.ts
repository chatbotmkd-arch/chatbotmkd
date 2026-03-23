import { Router } from "express";
import { listSources, addTextSource, addWebsiteSource, deleteSource, resyncSource } from "../controllers/sourceController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { validateUrl, validateObjectIds } from "../middleware/validators";

const router = Router();

router.use(authenticate);

router.get("/:chatbotId/sources", validateObjectIds("chatbotId"), asyncHandler(listSources));
router.post("/:chatbotId/sources/text", validateObjectIds("chatbotId"), asyncHandler(addTextSource));
router.post("/:chatbotId/sources/website", validateObjectIds("chatbotId"), validateUrl("url"), asyncHandler(addWebsiteSource));
router.delete("/:chatbotId/sources/:sourceId", validateObjectIds("chatbotId", "sourceId"), asyncHandler(deleteSource));
router.post("/:chatbotId/sources/:sourceId/resync", validateObjectIds("chatbotId", "sourceId"), asyncHandler(resyncSource));

export default router;
