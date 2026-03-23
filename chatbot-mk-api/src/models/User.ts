import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { PlanType } from "../config/constants";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  teamId: Types.ObjectId;
  role: "owner" | "admin" | "member";
  plan: PlanType;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
    plan: { type: Number, enum: [0, 1, 2], default: 0 },
    locale: { type: String, default: "mk" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", userSchema);
