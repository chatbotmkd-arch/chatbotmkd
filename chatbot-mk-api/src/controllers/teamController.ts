import { Response } from "express";
import { Team } from "../models/Team";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export async function getTeam(req: AuthRequest, res: Response): Promise<void> {
  const team = await Team.findById(req.user!.teamId);
  if (!team) throw new AppError(404, "Team not found");

  const members = await User.find({ teamId: team._id }).select("email name role createdAt");

  res.json({ team, members });
}

export async function updateTeam(req: AuthRequest, res: Response): Promise<void> {
  const { name } = req.body;
  const team = await Team.findByIdAndUpdate(
    req.user!.teamId,
    { name },
    { new: true }
  );
  if (!team) throw new AppError(404, "Team not found");

  res.json(team);
}

export async function inviteMember(req: AuthRequest, res: Response): Promise<void> {
  const { email, name, password, role } = req.body;

  if (!email || !name || !password) {
    throw new AppError(400, "Email, name, and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new AppError(409, "Email already in use");

  const user = new User({
    email,
    passwordHash: password,
    name,
    teamId: req.user!.teamId,
    role: role || "member",
  });
  await user.save();

  res.status(201).json({
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

export async function removeMember(req: AuthRequest, res: Response): Promise<void> {
  const { memberId } = req.params;
  const member = await User.findOne({ _id: memberId, teamId: req.user!.teamId });

  if (!member) throw new AppError(404, "Member not found");
  if (member.role === "owner") throw new AppError(400, "Cannot remove team owner");

  await User.findByIdAndDelete(memberId);
  res.json({ message: "Member removed" });
}

export async function updateMemberRole(req: AuthRequest, res: Response): Promise<void> {
  const { memberId } = req.params;
  const { role } = req.body;

  if (!["admin", "member"].includes(role)) {
    throw new AppError(400, "Invalid role");
  }

  const member = await User.findOneAndUpdate(
    { _id: memberId, teamId: req.user!.teamId },
    { role },
    { new: true }
  );

  if (!member) throw new AppError(404, "Member not found");
  res.json({ id: member._id, email: member.email, name: member.name, role: member.role });
}
