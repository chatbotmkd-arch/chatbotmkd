import { Response } from "express";
import { Subscription } from "../models/Subscription";
import { Team } from "../models/Team";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";
import { PlanType } from "../config/constants";

export async function getSubscription(req: AuthRequest, res: Response): Promise<void> {
  const subscription = await Subscription.findOne({ teamId: req.user!.teamId });
  if (!subscription) throw new AppError(404, "No subscription found");
  res.json(subscription);
}

// Plan upgrades are handled manually via MongoDB after bank payment verification.
// This endpoint is intentionally removed to prevent self-service plan changes.
// To upgrade a user: update Team.plan, User.plan, and Subscription.plan/status in MongoDB.

export async function cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
  const subscription = await Subscription.findOne({ teamId: req.user!.teamId });
  if (!subscription) throw new AppError(404, "No subscription found");

  // Downgrade to free plan
  subscription.plan = 0;
  subscription.status = "cancelled";
  await subscription.save();

  await Team.findByIdAndUpdate(req.user!.teamId, { plan: 0 });
  await User.findByIdAndUpdate(req.user!.userId, { plan: 0 });

  res.json(subscription);
}
