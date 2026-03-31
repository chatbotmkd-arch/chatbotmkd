import { Router } from "express";
import {
  initiateOAuth,
  oauthCallback,
  connectPage,
  disconnectPage,
  getConnectionStatus,
} from "../controllers/metaOAuthController";
import { verifyWebhook, handleWebhook } from "../controllers/metaWebhookController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// --- Webhook endpoints (public, called by Meta) ---
router.get("/webhook/meta", verifyWebhook);
router.post("/webhook/meta", handleWebhook as any);

// Alias at /api/facebook/webhook for Meta App Review callback URL
router.get("/api/facebook/webhook", verifyWebhook);
router.post("/api/facebook/webhook", handleWebhook as any);

// --- OAuth endpoints ---
// Initiate OAuth — requires auth (customer must be logged in)
router.get("/api/auth/facebook/connect", authenticate, asyncHandler(initiateOAuth as any));

// Callback from Meta — NOT authenticated (Meta redirects the browser here)
router.get("/api/auth/facebook/callback", asyncHandler(oauthCallback as any));

// --- Temporary admin seed endpoint (remove after use) ---
router.post("/api/pages/seed-connection", authenticate, asyncHandler(async (req: any, res: any) => {
  const { pageId, pageName, pageAccessToken, chatbotId } = req.body;
  if (!pageId || !pageAccessToken || !chatbotId) {
    return res.status(400).json({ error: "pageId, pageAccessToken, and chatbotId required" });
  }
  const { encrypt } = await import("../utils/encryption");
  const { MetaConnection } = await import("../models/MetaConnection");
  const connection = await MetaConnection.findOneAndUpdate(
    { pageId },
    {
      teamId: req.user.teamId,
      chatbotId,
      pageId,
      pageName: pageName || pageId,
      pageAccessTokenEncrypted: encrypt(pageAccessToken),
      webhookSubscribed: true,
      status: "active",
      connectedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  res.status(201).json({ id: connection._id, pageId: connection.pageId, status: connection.status });
}));

// --- Page management endpoints (authenticated) ---
router.post("/api/pages/connect", authenticate, asyncHandler(connectPage as any));
router.post("/api/pages/disconnect", authenticate, asyncHandler(disconnectPage as any));
router.get("/api/pages/status", authenticate, asyncHandler(getConnectionStatus as any));

export default router;
