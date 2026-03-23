import { Router } from "express";
import { getTeam, updateTeam, inviteMember, removeMember, updateMemberRole } from "../controllers/teamController";
import { authenticate, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getTeam));
router.put("/", requireRole("owner", "admin"), asyncHandler(updateTeam));
router.post("/members", requireRole("owner", "admin"), asyncHandler(inviteMember));
router.delete("/members/:memberId", requireRole("owner"), asyncHandler(removeMember));
router.patch("/members/:memberId/role", requireRole("owner"), asyncHandler(updateMemberRole));

export default router;
