import { Router } from "express";
import { getWidgetConfig, getPublicPageConfig } from "../controllers/widgetController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/page/:slug", asyncHandler(getPublicPageConfig));
router.get("/:chatbotId/config", asyncHandler(getWidgetConfig));

export default router;
