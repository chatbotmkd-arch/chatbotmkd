import { Request, Response } from "express";
import { WidgetService } from "../services/WidgetService";
import { AppError } from "../middleware/errorHandler";

export async function getWidgetConfig(req: Request, res: Response): Promise<void> {
  const chatbotId = req.params.chatbotId as string;
  const config = await WidgetService.getConfig(chatbotId);

  if (!config) throw new AppError(404, "Chatbot not found or inactive");

  res.json(config);
}
