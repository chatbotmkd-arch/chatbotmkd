import mongoose, { Schema, Document, Types } from "mongoose";

export interface IApiKey extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  name: string;
  keyHash: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: Date;
  createdAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    name: { type: String, required: true },
    keyHash: { type: String, required: true },
    keyPrefix: { type: String, required: true },
    permissions: [{ type: String }],
    lastUsedAt: Date,
  },
  { timestamps: true }
);

export const ApiKey = mongoose.model<IApiKey>("ApiKey", apiKeySchema);
