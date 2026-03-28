import { Request, Response } from "express";
import { WidgetService } from "../services/WidgetService";
import { Chatbot } from "../models/Chatbot";
import { AppError } from "../middleware/errorHandler";

export async function getWidgetConfig(req: Request, res: Response): Promise<void> {
  const chatbotId = req.params.chatbotId as string;
  const config = await WidgetService.getConfig(chatbotId);

  if (!config) throw new AppError(404, "Chatbot not found or inactive");

  res.json(config);
}

export async function getPublicPageConfig(req: Request, res: Response): Promise<void> {
  const slug = req.params.slug as string;

  const chatbot = await Chatbot.findOne({ slug, status: "active" })
    .select("_id name slug appearance config.language businessInfo");

  if (!chatbot) throw new AppError(404, "Chatbot not found");

  res.json({
    chatbotId: chatbot._id,
    name: chatbot.name,
    slug: chatbot.slug,
    language: chatbot.config.language,
    appearance: chatbot.appearance,
    businessInfo: chatbot.businessInfo || {},
  });
}
