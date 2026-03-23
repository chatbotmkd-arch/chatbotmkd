import { Router } from "express";
import { register, login, refresh, me } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { authLimiter, refreshLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));
router.post("/refresh", refreshLimiter, asyncHandler(refresh));
router.get("/me", authenticate, asyncHandler(me));

export default router;
