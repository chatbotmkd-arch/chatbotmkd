import { Router } from "express";
import {
  listApiKeys, createApiKey, deleteApiKey,
  listWebhooks, createWebhook, deleteWebhook,
} from "../controllers/integrationController";
import { authenticate, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

// API Keys
router.get("/api-keys", asyncHandler(listApiKeys));
router.post("/api-keys", requireRole("owner", "admin"), asyncHandler(createApiKey));
router.delete("/api-keys/:id", requireRole("owner", "admin"), asyncHandler(deleteApiKey));

// Webhooks
router.get("/webhooks", asyncHandler(listWebhooks));
router.post("/webhooks", requireRole("owner", "admin"), asyncHandler(createWebhook));
router.delete("/webhooks/:id", requireRole("owner", "admin"), asyncHandler(deleteWebhook));

export default router;
