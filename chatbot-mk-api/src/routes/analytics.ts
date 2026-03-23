import { Router } from "express";
import { getDashboard, getChatbotAnalytics, getTopQuestions } from "../controllers/analyticsController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/dashboard", asyncHandler(getDashboard));
router.get("/chatbots/:chatbotId", asyncHandler(getChatbotAnalytics));
router.get("/chatbots/:chatbotId/top-questions", asyncHandler(getTopQuestions));

export default router;
