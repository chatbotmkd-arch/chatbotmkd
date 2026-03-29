import { Router } from "express";
import { authenticate, requireSuperAdmin } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getStats,
  listUsers,
  changePlan,
  extendGrace,
  listAllInvoices,
  markInvoicePaid,
} from "../controllers/adminController";

const router = Router();

// All admin routes require authentication + super admin check
router.use(authenticate, asyncHandler(requireSuperAdmin as any));

router.get("/stats", asyncHandler(getStats as any));
router.get("/users", asyncHandler(listUsers as any));
router.patch("/teams/:teamId/plan", asyncHandler(changePlan as any));
router.post("/teams/:teamId/extend-grace", asyncHandler(extendGrace as any));
router.get("/invoices", asyncHandler(listAllInvoices as any));
router.patch("/invoices/:invoiceId/mark-paid", asyncHandler(markInvoicePaid as any));

export default router;
