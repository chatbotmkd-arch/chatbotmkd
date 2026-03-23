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

// --- OAuth endpoints ---
// Initiate OAuth — requires auth (customer must be logged in)
router.get("/api/auth/facebook/connect", authenticate, asyncHandler(initiateOAuth as any));

// Callback from Meta — NOT authenticated (Meta redirects the browser here)
router.get("/api/auth/facebook/callback", asyncHandler(oauthCallback as any));

// --- Page management endpoints (authenticated) ---
router.post("/api/pages/connect", authenticate, asyncHandler(connectPage as any));
router.post("/api/pages/disconnect", authenticate, asyncHandler(disconnectPage as any));
router.get("/api/pages/status", authenticate, asyncHandler(getConnectionStatus as any));

export default router;
