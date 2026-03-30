import { Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { ApiKey } from "../models/ApiKey";
import { Webhook } from "../models/Webhook";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

// API Keys

export async function listApiKeys(req: AuthRequest, res: Response): Promise<void> {
  const keys = await ApiKey.find({ teamId: req.user!.teamId }).select("-keyHash");
  res.json(keys);
}

export async function createApiKey(req: AuthRequest, res: Response): Promise<void> {
  const { name, permissions } = req.body;
  if (!name) throw new AppError(400, "Name is required");

  const rawKey = `cmk_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.slice(0, 10);

  const apiKey = await ApiKey.create({
    teamId: req.user!.teamId,
    name,
    keyHash,
    keyPrefix,
    permissions: permissions || ["read", "write"],
  });

  // Return the raw key only once
  res.status(201).json({
    id: apiKey._id,
    name: apiKey.name,
    key: rawKey,
    keyPrefix: apiKey.keyPrefix,
    permissions: apiKey.permissions,
    message: "Store this key securely — it will not be shown again",
  });
}

export async function deleteApiKey(req: AuthRequest, res: Response): Promise<void> {
  const key = await ApiKey.findOneAndDelete({ _id: req.params.id, teamId: req.user!.teamId });
  if (!key) throw new AppError(404, "API key not found");
  res.json({ message: "API key deleted" });
}

// Webhooks

export async function listWebhooks(req: AuthRequest, res: Response): Promise<void> {
  const webhooks = await Webhook.find({ teamId: req.user!.teamId }).select("-secret");
  res.json(webhooks);
}

export async function createWebhook(req: AuthRequest, res: Response): Promise<void> {
  const { url, events } = req.body;
  if (!url || !events?.length) throw new AppError(400, "URL and events are required");

  // Validate webhook URL
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new AppError(400, "Webhook URL must use http or https");
    }
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
      hostname === "169.254.169.254" ||
      hostname.endsWith(".internal")
    ) {
      throw new AppError(400, "Webhook URL must not point to a private or internal address");
    }
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(400, "Invalid webhook URL");
  }

  const secret = crypto.randomBytes(32).toString("hex");

  const webhook = await Webhook.create({
    teamId: req.user!.teamId,
    url,
    events,
    secret,
  });

  res.status(201).json({
    id: webhook._id,
    url: webhook.url,
    events: webhook.events,
    secret,
    message: "Store this secret securely for verifying webhook signatures",
  });
}

export async function deleteWebhook(req: AuthRequest, res: Response): Promise<void> {
  const webhook = await Webhook.findOneAndDelete({ _id: req.params.id, teamId: req.user!.teamId });
  if (!webhook) throw new AppError(404, "Webhook not found");
  res.json({ message: "Webhook deleted" });
}
