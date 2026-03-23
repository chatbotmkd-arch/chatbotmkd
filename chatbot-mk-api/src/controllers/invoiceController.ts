import { Response } from "express";
import { ProformaInvoice } from "../models/ProformaInvoice";
import { User } from "../models/User";
import { Team } from "../models/Team";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";
import { PLAN_PRICING, PLAN_LIMITS, BANK_DETAILS, PlanType } from "../config/constants";

/**
 * Build payment reference: XXXX-P-T
 * XXXX = client number zero-padded to 4 digits
 * P    = plan (1 or 2)
 * T    = m (monthly) or a (annual)
 */
function buildPaymentReference(clientNumber: number, plan: number, period: string): string {
  const client = String(clientNumber).padStart(4, "0");
  const periodCode = period === "annual" ? "a" : "m";
  return `${client}-${plan}-${periodCode}`;
}

export async function createInvoice(req: AuthRequest, res: Response): Promise<void> {
  const {
    plan,
    period,
    companyName,
    companyAddress,
    companyCity,
    edb,
    contactEmail,
    contactPhone,
  } = req.body;

  if (![1, 2].includes(plan)) {
    throw new AppError(400, "Невалиден план. Изберете Стартер (1) или Про (2).");
  }
  if (!["monthly", "annual"].includes(period)) {
    throw new AppError(400, "Невалиден период. Изберете месечно или годишно.");
  }
  if (!companyName || !companyAddress || !companyCity || !edb || !contactEmail) {
    throw new AppError(400, "Сите полиња за фактурирање се задолжителни.");
  }

  // Check if there's already a pending invoice for this team
  const existingPending = await ProformaInvoice.findOne({
    teamId: req.user!.teamId,
    status: "pending",
  });
  if (existingPending) {
    throw new AppError(
      409,
      "Веќе имате про-фактура која чека плаќање. Откажете ја или платете ја пред да генерирате нова."
    );
  }

  const team = await Team.findById(req.user!.teamId);
  if (!team) throw new AppError(404, "Тимот не е пронајден.");

  const pricing = PLAN_PRICING[plan as 1 | 2];
  const amount = period === "annual" ? pricing.annual : pricing.monthly;
  const paymentReference = buildPaymentReference(team.clientNumber, plan, period);

  const invoice = new ProformaInvoice({
    teamId: team._id,
    userId: req.user!.userId,
    paymentReference,
    plan,
    period,
    amount,
    currency: "MKD",
    companyName,
    companyAddress,
    companyCity,
    edb,
    contactEmail,
    contactPhone,
  });

  await invoice.save();

  res.status(201).json({
    invoice,
    bankDetails: BANK_DETAILS,
    planName: PLAN_LIMITS[plan as PlanType].name,
  });
}

export async function listInvoices(req: AuthRequest, res: Response): Promise<void> {
  const invoices = await ProformaInvoice.find({ teamId: req.user!.teamId })
    .sort({ createdAt: -1 })
    .lean();

  res.json(invoices);
}

export async function getInvoice(req: AuthRequest, res: Response): Promise<void> {
  const invoice = await ProformaInvoice.findOne({
    _id: req.params.id,
    teamId: req.user!.teamId,
  }).lean();

  if (!invoice) throw new AppError(404, "Фактурата не е пронајдена.");

  res.json({
    invoice,
    bankDetails: BANK_DETAILS,
    planName: PLAN_LIMITS[invoice.plan as PlanType].name,
  });
}

export async function cancelInvoice(req: AuthRequest, res: Response): Promise<void> {
  const invoice = await ProformaInvoice.findOne({
    _id: req.params.id,
    teamId: req.user!.teamId,
    status: "pending",
  });

  if (!invoice) throw new AppError(404, "Фактурата не е пронајдена или веќе е обработена.");

  invoice.status = "cancelled";
  await invoice.save();

  res.json({ message: "Про-фактурата е откажана.", invoice });
}

export async function getUpgradeStatus(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new AppError(404, "User not found");

  const pendingInvoice = await ProformaInvoice.findOne({
    teamId: req.user!.teamId,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    currentPlan: user.plan,
    pendingInvoice: pendingInvoice || null,
    bankDetails: pendingInvoice ? BANK_DETAILS : undefined,
  });
}
