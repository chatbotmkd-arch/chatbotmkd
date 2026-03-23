import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessageLog extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  pageId: string;
  senderPsid: string;
  direction: "inbound" | "outbound";
  messageText: string;
  tokensUsed: number;
  channel: "facebook" | "instagram";
  createdAt: Date;
}

const messageLogSchema = new Schema<IMessageLog>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    pageId: { type: String, required: true, index: true },
    senderPsid: { type: String, required: true },
    direction: { type: String, enum: ["inbound", "outbound"], required: true },
    messageText: { type: String, required: true },
    tokensUsed: { type: Number, default: 0 },
    channel: { type: String, enum: ["facebook", "instagram"], default: "facebook" },
  },
  { timestamps: true }
);

export const MessageLog = mongoose.model<IMessageLog>("MessageLog", messageLogSchema);
