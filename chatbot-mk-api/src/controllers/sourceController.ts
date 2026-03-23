import { Response } from "express";
import { Source } from "../models/Source";
import { Chatbot } from "../models/Chatbot";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";
import { EmbeddingService } from "../services/EmbeddingService";

export async function listSources(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const sources = await Source.find({ chatbotId: chatbot._id })
    .select("-chunks")
    .sort({ createdAt: -1 });

  res.json(sources);
}

export async function addTextSource(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const { name, content, type } = req.body;
  if (!name || !content) throw new AppError(400, "Name and content are required");

  const source = new Source({
    chatbotId: chatbot._id,
    type: type || "text",
    name,
    status: "processing",
  });
  await source.save();

  // Process embeddings (in production, this would be a BullMQ job)
  try {
    await EmbeddingService.processAndStore(source._id, content);
  } catch (err) {
    source.status = "error";
    source.errorMessage = err instanceof Error ? err.message : "Processing failed";
    await source.save();
  }

  const result = await Source.findById(source._id).select("-chunks");
  res.status(201).json(result);
}

export async function addWebsiteSource(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const { url, name } = req.body;
  if (!url) throw new AppError(400, "URL is required");

  const source = new Source({
    chatbotId: chatbot._id,
    type: "website",
    name: name || url,
    status: "pending",
    meta: { url },
  });
  await source.save();

  // In production, enqueue a BullMQ job for scraping
  // For now, mark as pending
  const result = await Source.findById(source._id).select("-chunks");
  res.status(201).json(result);
}

export async function deleteSource(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const source = await Source.findOneAndDelete({ _id: req.params.sourceId, chatbotId: chatbot._id });
  if (!source) throw new AppError(404, "Source not found");

  res.json({ message: "Source deleted" });
}

export async function resyncSource(req: AuthRequest, res: Response): Promise<void> {
  const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, teamId: req.user!.teamId });
  if (!chatbot) throw new AppError(404, "Chatbot not found");

  const source = await Source.findOneAndUpdate(
    { _id: req.params.sourceId, chatbotId: chatbot._id },
    { status: "pending" },
    { new: true }
  ).select("-chunks");

  if (!source) throw new AppError(404, "Source not found");

  // In production, enqueue re-processing job
  res.json(source);
}
