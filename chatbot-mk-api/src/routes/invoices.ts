import { Router } from "express";
import {
  createInvoice,
  listInvoices,
  getInvoice,
  cancelInvoice,
  getUpgradeStatus,
} from "../controllers/invoiceController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.post("/", asyncHandler(createInvoice as any));
router.get("/", asyncHandler(listInvoices as any));
router.get("/upgrade-status", asyncHandler(getUpgradeStatus as any));
router.get("/:id", asyncHandler(getInvoice as any));
router.post("/:id/cancel", asyncHandler(cancelInvoice as any));

export default router;
