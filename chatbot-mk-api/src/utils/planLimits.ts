import { Types } from "mongoose";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { Chatbot } from "../models/Chatbot";
import { Team } from "../models/Team";
import { PLAN_LIMITS, PlanType } from "../config/constants";

/**
 * Count messages sent to chatbots owned by a team.
 * Plan 0 (free): counts lifetime total.
 * Plan 1-2 (paid): counts current calendar month only.
 */
export async function getTeamMessageCount(teamId: string | Types.ObjectId, plan: PlanType): Promise<number> {
  // Get all chatbot IDs for this team
  const chatbots = await Chatbot.find({ teamId }, { _id: 1 }).lean();
  if (chatbots.length === 0) return 0;

  const chatbotIds = chatbots.map((c) => c._id);

  // Get all conversations for these chatbots
  const conversationFilter: Record<string, unknown> = {
    chatbotId: { $in: chatbotIds },
  };

  // For paid plans, only count current month
  if (plan > 0) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    conversationFilter.createdAt = { $gte: monthStart };
  }

  const conversations = await Conversation.find(conversationFilter, { _id: 1 }).lean();
  if (conversations.length === 0) return 0;

  const conversationIds = conversations.map((c) => c._id);

  // Count only user messages (each user message triggers one AI response)
  const count = await Message.countDocuments({
    conversationId: { $in: conversationIds },
    role: "user",
  });

  return count;
}

export type LimitStatus = "ok" | "trial_expired" | "grace_expired" | "limit_reached";

export interface LimitCheckResult {
  allowed: boolean;
  status: LimitStatus;
  used: number;
  limit: number;
  plan: PlanType;
  trialEndsAt?: Date;
  graceEndsAt?: Date | null;
  daysLeft?: number;
}

/**
 * Check if a team can send more messages.
 *
 * Free plan (0):
 *   - Must be within trial period OR grace period
 *   - Must be under lifetime message limit
 *
 * Paid plans (1-2):
 *   - Must be under monthly message limit
 *   - No trial/grace concept
 */
export async function checkMessageLimit(teamId: string | Types.ObjectId, plan: PlanType): Promise<LimitCheckResult> {
  const safePlan: PlanType = plan in PLAN_LIMITS ? plan : 0;
  const limits = PLAN_LIMITS[safePlan];
  const used = await getTeamMessageCount(teamId, safePlan);

  const base = { used, limit: limits.maxMessages, plan: safePlan };

  // Paid plans: only check message count
  if (safePlan > 0) {
    const allowed = used < limits.maxMessages;
    return {
      ...base,
      allowed,
      status: allowed ? "ok" : "limit_reached",
    };
  }

  // Free plan: check trial + grace + message limit
  const team = await Team.findById(teamId, { trialEndsAt: 1, graceEndsAt: 1 }).lean();
  const now = new Date();

  const trialEndsAt = team?.trialEndsAt;
  const graceEndsAt = team?.graceEndsAt;
  const trialActive = trialEndsAt ? now < trialEndsAt : false;
  const graceActive = graceEndsAt ? now < graceEndsAt : false;
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Trial or grace must be active
  if (!trialActive && !graceActive) {
    return {
      ...base,
      allowed: false,
      status: graceEndsAt ? "grace_expired" : "trial_expired",
      trialEndsAt,
      graceEndsAt,
      daysLeft: 0,
    };
  }

  // Within trial/grace — check message limit
  const allowed = used < limits.maxMessages;
  return {
    ...base,
    allowed,
    status: allowed ? "ok" : "limit_reached",
    trialEndsAt,
    graceEndsAt,
    daysLeft,
  };
}
