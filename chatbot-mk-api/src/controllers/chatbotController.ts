import { Response } from "express";
import { Chatbot } from "../models/Chatbot";
import { Team } from "../models/Team";
import { PLAN_LIMITS } from "../config/constants";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";
import { WidgetService } from "../services/WidgetService";

export async function listChatbots(req: AuthRequest, res: Response): Promise<void> {
  const chatbots = await Chatbot.find({ teamId: req.user!.teamId }).sort({ createdAt: -1 });
  res.json(chatbots);
}

export async function getChatbot(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.id, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");
  res.json(chatbot);
}

export async function createChatbot(req: AuthRequest, res: Response): Promise<void> {
  const team = await Team.findById(req.user!.teamId);
  if (!team) throw new AppError(404, "Team not found");

  const limits = PLAN_LIMITS[team.plan] || PLAN_LIMITS[0];
  const count = await Chatbot.countDocuments({ teamId: team._id });
  if (count >= limits.maxChatbots) {
    throw new AppError(403, `Достигнат е лимитот: максимум ${limits.maxChatbots} chatbot(и). Надградете го вашиот план.`);
  }

  const chatbot = new Chatbot({
    teamId: team._id,
    name: req.body.name || "New Chatbot",
    config: req.body.config,
    appearance: req.body.appearance,
  });
  await chatbot.save();

  res.status(201).json(chatbot);
}

export async function updateChatbot(req: AuthRequest, res: Response): Promise<void> {
  const { name, config, appearance, allowedDomains } = req.body;

  const chatbot = await Chatbot.findOneAndUpdate(
    { _id: req.params.id, teamId: req.user!.teamId },
    { name, config, appearance, allowedDomains },
    { new: true }
  );

  if (!chatbot) throw new AppError(404, "Chatbot not found");
  res.json(chatbot);
}

export async function deleteChatbot(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOneAndDelete({ _id: req.params.id, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");
  res.json({ message: "Chatbot deleted" });
}

export async function deployChatbot(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOneAndUpdate(
    { _id: req.params.id, teamId: req.user!.teamId },
    { status: "active" },
    { new: true }
  );
  if (!chatbot) throw new AppError(404, "Chatbot not found");
  res.json(chatbot);
}

export async function pauseChatbot(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOneAndUpdate(
    { _id: req.params.id, teamId: req.user!.teamId },
    { status: "paused" },
    { new: true }
  );
  if (!chatbot) throw new AppError(404, "Chatbot not found");
  res.json(chatbot);
}

export async function getEmbedCode(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.id, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const protocol = req.protocol;
  const host = req.get("host");
  const apiBase = `${protocol}://${host}`;

  res.json({ embedCode: WidgetService.generateEmbedCode(chatbot._id.toString(), apiBase) });
}
