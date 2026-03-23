import { Router } from "express";
import { getWidgetConfig } from "../controllers/widgetController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/:chatbotId/config", asyncHandler(getWidgetConfig));

export default router;
