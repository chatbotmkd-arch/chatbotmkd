import { Response } from "express";
import { Chatbot } from "../models/Chatbot";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { AnalyticsDaily } from "../models/AnalyticsDaily";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  const chatbots = await Chatbot.find({ teamId: req.user!.teamId }).select("_id name status");

  const stats = await Promise.all(
    chatbots.map(async (bot) => {
      const [conversations, messages] = await Promise.all([
        Conversation.countDocuments({ chatbotId: bot._id }),
        Message.countDocuments({
          conversationId: {
            $in: (await Conversation.find({ chatbotId: bot._id }).select("_id")).map((c) => c._id),
          },
        }),
      ]);

      return {
        chatbotId: bot._id,
        name: bot.name,
        status: bot.status,
        totalConversations: conversations,
        totalMessages: messages,
      };
    })
  );

  res.json({ chatbots: stats });
}

export async function getChatbotAnalytics(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const { from, to } = req.query;
  const dateFilter: Record<string, unknown> = { chatbotId: chatbot._id };

  if (from || to) {
    dateFilter.date = {};
    if (from) (dateFilter.date as Record<string, unknown>).$gte = new Date(from as string);
    if (to) (dateFilter.date as Record<string, unknown>).$lte = new Date(to as string);
  }

  const dailyStats = await AnalyticsDaily.find(dateFilter).sort({ date: 1 });

  const totals = dailyStats.reduce(
    (acc, d) => ({
      conversations: acc.conversations + d.conversations,
      messages: acc.messages + d.messages,
      escalations: acc.escalations + d.escalations,
      tokensUsed: acc.tokensUsed + d.tokensUsed,
    }),
    { conversations: 0, messages: 0, escalations: 0, tokensUsed: 0 }
  );

  const avgSatisfaction =
    dailyStats.length > 0
      ? dailyStats.reduce((sum, d) => sum + d.avgSatisfaction, 0) / dailyStats.length
      : 0;

  res.json({
    totals: { ...totals, avgSatisfaction: Math.round(avgSatisfaction * 100) / 100 },
    daily: dailyStats,
  });
}

export async function getTopQuestions(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const conversationIds = (await Conversation.find({ chatbotId: chatbot._id }).select("_id")).map(
    (c) => c._id
  );

  const topQuestions = await Message.aggregate([
    { $match: { conversationId: { $in: conversationIds }, role: "user" } },
    { $group: { _id: "$content", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  res.json(topQuestions.map((q) => ({ question: q._id, count: q.count })));
}
