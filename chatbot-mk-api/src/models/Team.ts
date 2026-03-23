import mongoose, { Schema, Document, Types } from "mongoose";
import { PlanType } from "../config/constants";

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  plan: PlanType;
  clientNumber: number; // sequential: 1, 2, 3...
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    plan: { type: Number, enum: [0, 1, 2], default: 0 },
    clientNumber: { type: Number, unique: true, sparse: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/**
 * Auto-assign the next client number before save.
 */
teamSchema.pre("save", async function () {
  if (this.isNew && !this.clientNumber) {
    const last = await Team.findOne({ clientNumber: { $exists: true } })
      .sort({ clientNumber: -1 })
      .lean();
    this.clientNumber = last?.clientNumber ? last.clientNumber + 1 : 1;
  }
});

export const Team = mongoose.model<ITeam>("Team", teamSchema);
