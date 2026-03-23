import { Router } from "express";
import { getSubscription, cancelSubscription } from "../controllers/subscriptionController";
import { authenticate, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getSubscription));
// PUT / (updateSubscription) intentionally removed — plan changes are manual after payment verification
router.post("/cancel", requireRole("owner"), asyncHandler(cancelSubscription));

export default router;
