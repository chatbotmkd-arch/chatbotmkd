import { Types } from "mongoose";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { Chatbot } from "../models/Chatbot";
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

/**
 * Check if a team can send more messages.
 * Returns { allowed, used, limit, plan }
 */
export async function checkMessageLimit(teamId: string | Types.ObjectId, plan: PlanType): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: PlanType;
}> {
  const safePlan: PlanType = plan in PLAN_LIMITS ? plan : 0;
  const limits = PLAN_LIMITS[safePlan];
  const used = await getTeamMessageCount(teamId, safePlan);

  return {
    allowed: used < limits.maxMessages,
    used,
    limit: limits.maxMessages,
    plan: safePlan,
  };
}
