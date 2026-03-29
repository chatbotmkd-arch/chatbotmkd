import { Request, Response } from "express";
import { User } from "../models/User";
import { Team } from "../models/Team";
import { Subscription } from "../models/Subscription";
import { generateTokens, verifyRefreshToken } from "../utils/tokens";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";
import { TRIAL_DAYS } from "../config/constants";
import { sendWelcomeEmail } from "../services/EmailService";

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new AppError(400, "Email, password, and name are required");
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, "Invalid email format");
  }

  // Password strength: min 8 chars, at least one uppercase, one lowercase, one digit
  if (password.length < 8) {
    throw new AppError(400, "Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError(400, "Password must contain at least one uppercase letter, one lowercase letter, and one digit");
  }

  // Name length limit
  if (name.length > 100) {
    throw new AppError(400, "Name must be 100 characters or less");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  // Create team first
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const team = new Team({
    name: `${name}'s Team`,
    plan: 0, // free plan
    ownerId: null!, // will update after user created
    trialEndsAt,
  });
  await team.save();

  const user = new User({
    email,
    passwordHash: password,
    name,
    teamId: team._id,
    role: "owner",
    plan: 0, // free plan
  });
  await user.save();

  // Update team owner
  team.ownerId = user._id;
  await team.save();

  // Create subscription record
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 365 * 10); // free plan doesn't expire

  await Subscription.create({
    teamId: team._id,
    plan: 0,
    status: "active",
    period: "monthly",
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
  });

  // Send welcome email (fire-and-forget)
  sendWelcomeEmail(user.email, user.name).catch(() => {});

  const tokens = generateTokens({
    userId: user._id.toString(),
    teamId: team._id.toString(),
    role: user.role,
  });

  res.status(201).json({
    user: { id: user._id, email: user.email, name: user.name, role: user.role, plan: user.plan },
    team: { id: team._id, name: team.name, plan: team.plan, clientNumber: team.clientNumber, trialEndsAt: team.trialEndsAt, graceEndsAt: team.graceEndsAt },
    ...tokens,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  const tokens = generateTokens({
    userId: user._id.toString(),
    teamId: user.teamId.toString(),
    role: user.role,
  });

  res.json({
    user: { id: user._id, email: user.email, name: user.name, role: user.role, plan: user.plan },
    ...tokens,
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError(400, "Refresh token required");
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokens = generateTokens(payload);
    res.json(tokens);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const team = await Team.findById(user.teamId);

  res.json({
    user: { id: user._id, email: user.email, name: user.name, role: user.role, plan: user.plan, locale: user.locale },
    team: team ? { id: team._id, name: team.name, plan: team.plan, clientNumber: team.clientNumber, trialEndsAt: team.trialEndsAt, graceEndsAt: team.graceEndsAt } : null,
  });
}
