import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWebhook extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const webhookSchema = new Schema<IWebhook>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    url: { type: String, required: true },
    events: [{ type: String, required: true }],
    secret: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Webhook = mongoose.model<IWebhook>("Webhook", webhookSchema);
