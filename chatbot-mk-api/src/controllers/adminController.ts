import { Response } from "express";
import { Team } from "../models/Team";
import { User } from "../models/User";
import { Chatbot } from "../models/Chatbot";
import { Subscription } from "../models/Subscription";
import { ProformaInvoice } from "../models/ProformaInvoice";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";
import { PLAN_LIMITS, GRACE_DAYS, PlanType } from "../config/constants";
import { getTeamMessageCount } from "../utils/planLimits";
import { sendPlanActivatedEmail } from "../services/EmailService";

// ── GET /api/admin/stats ──────────────────────────────────────
export async function getStats(_req: AuthRequest, res: Response): Promise<void> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalTeams,
    paidTeams,
    totalChatbots,
    messagesToday,
    pendingInvoices,
  ] = await Promise.all([
    Team.countDocuments(),
    Team.countDocuments({ plan: { $gt: 0 } }),
    Chatbot.countDocuments(),
    Message.countDocuments({ role: "user", createdAt: { $gte: todayStart } }),
    ProformaInvoice.countDocuments({ status: "pending" }),
  ]);

  res.json({
    totalTeams,
    paidTeams,
    totalChatbots,
    messagesToday,
    pendingInvoices,
  });
}

// ── GET /api/admin/users ──────────────────────────────────────
export async function listUsers(_req: AuthRequest, res: Response): Promise<void> {
  const teams = await Team.find().sort({ createdAt: -1 }).lean();

  const enriched = await Promise.all(
    teams.map(async (team) => {
      const [owner, chatbotCount, usage] = await Promise.all([
        User.findOne({ teamId: team._id, role: "owner" }, { name: 1, email: 1 }).lean(),
        Chatbot.countDocuments({ teamId: team._id }),
        getTeamMessageCount(team._id, team.plan as PlanType),
      ]);

      const now = new Date();
      const trialActive = team.trialEndsAt ? now < team.trialEndsAt : false;
      const graceActive = team.graceEndsAt ? now < team.graceEndsAt : false;
      const limits = PLAN_LIMITS[team.plan as PlanType] || PLAN_LIMITS[0];

      return {
        teamId: team._id,
        teamName: team.name,
        clientNumber: team.clientNumber,
        ownerName: owner?.name || "—",
        ownerEmail: owner?.email || "—",
        plan: team.plan,
        planName: limits.name,
        trialEndsAt: team.trialEndsAt,
        graceEndsAt: team.graceEndsAt,
        trialActive,
        graceActive,
        messagesUsed: usage,
        messagesLimit: limits.maxMessages,
        chatbotCount,
        chatbotLimit: limits.maxChatbots,
        createdAt: team.createdAt,
      };
    })
  );

  res.json(enriched);
}

// ── PATCH /api/admin/teams/:teamId/plan ───────────────────────
export async function changePlan(req: AuthRequest, res: Response): Promise<void> {
  const { teamId } = req.params;
  const { plan, period } = req.body;

  if (![0, 1, 2].includes(plan)) {
    throw new AppError(400, "Invalid plan. Must be 0, 1, or 2.");
  }

  const team = await Team.findById(teamId);
  if (!team) throw new AppError(404, "Team not found");

  team.plan = plan;
  await team.save();

  // Update the owner's plan field too
  await User.updateMany({ teamId: team._id }, { plan });

  // Update or create subscription
  const now = new Date();
  const periodEnd = new Date(now);
  if (plan === 0) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 10);
  } else if (period === "annual") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  await Subscription.findOneAndUpdate(
    { teamId: team._id },
    {
      plan,
      status: plan === 0 ? "trialing" : "active",
      period: period || "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    { upsert: true }
  );

  res.json({ message: "Plan updated", team: { id: team._id, plan: team.plan } });
}

// ── POST /api/admin/teams/:teamId/extend-grace ───────────────
export async function extendGrace(req: AuthRequest, res: Response): Promise<void> {
  const { teamId } = req.params;
  const { days } = req.body;

  const graceDays = typeof days === "number" && days > 0 ? days : GRACE_DAYS;

  const team = await Team.findById(teamId);
  if (!team) throw new AppError(404, "Team not found");

  const graceEndsAt = new Date();
  graceEndsAt.setDate(graceEndsAt.getDate() + graceDays);
  team.graceEndsAt = graceEndsAt;
  await team.save();

  res.json({ message: `Grace period extended by ${graceDays} days`, graceEndsAt });
}

// ── GET /api/admin/invoices ──────────────────────────────────
export async function listAllInvoices(_req: AuthRequest, res: Response): Promise<void> {
  const invoices = await ProformaInvoice.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  // Enrich with team/owner info
  const enriched = await Promise.all(
    invoices.map(async (inv) => {
      const team = await Team.findById(inv.teamId, { name: 1, clientNumber: 1 }).lean();
      const user = await User.findById(inv.userId, { name: 1, email: 1 }).lean();
      return {
        ...inv,
        teamName: team?.name || "—",
        clientNumber: team?.clientNumber || 0,
        userName: user?.name || "—",
        userEmail: user?.email || "—",
      };
    })
  );

  res.json(enriched);
}

// ── PATCH /api/admin/invoices/:invoiceId/mark-paid ───────────
export async function markInvoicePaid(req: AuthRequest, res: Response): Promise<void> {
  const { invoiceId } = req.params;

  const invoice = await ProformaInvoice.findById(invoiceId);
  if (!invoice) throw new AppError(404, "Invoice not found");
  if (invoice.status === "paid") throw new AppError(400, "Invoice is already paid");

  invoice.status = "paid";
  invoice.paidAt = new Date();
  await invoice.save();

  // Activate the plan
  const team = await Team.findById(invoice.teamId);
  if (team) {
    team.plan = invoice.plan as PlanType;
    team.graceEndsAt = null; // clear grace — plan is now active
    await team.save();

    await User.updateMany({ teamId: team._id }, { plan: invoice.plan });

    const now = new Date();
    const periodEnd = new Date(now);
    if (invoice.period === "annual") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await Subscription.findOneAndUpdate(
      { teamId: team._id },
      {
        plan: invoice.plan,
        status: "active",
        period: invoice.period,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      { upsert: true }
    );

    // Send activation email (fire-and-forget)
    const owner = await User.findOne({ teamId: team._id, role: "owner" }, { email: 1, name: 1 }).lean();
    if (owner?.email) {
      const planName = PLAN_LIMITS[invoice.plan as PlanType]?.name || "Стартер";
      sendPlanActivatedEmail(owner.email, owner.name, planName, periodEnd).catch(() => {});
    }
  }

  res.json({ message: "Invoice marked as paid and plan activated", invoice });
}
