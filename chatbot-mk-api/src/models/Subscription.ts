import mongoose, { Schema, Document, Types } from "mongoose";
import { PlanType } from "../config/constants";

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  plan: PlanType;
  status: "active" | "cancelled" | "past_due" | "trialing";
  period: "monthly" | "annual";
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
    plan: { type: Number, enum: [0, 1, 2], required: true },
    status: { type: String, enum: ["active", "cancelled", "past_due", "trialing"], default: "trialing" },
    period: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    currency: { type: String, default: "MKD" },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);
