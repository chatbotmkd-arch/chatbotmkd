import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  _id: Types.ObjectId;
  chatbotId: Types.ObjectId;
  sessionId: string;
  channel: "web" | "facebook" | "instagram";
  status: "active" | "ended" | "escalated";
  satisfaction?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    chatbotId: { type: Schema.Types.ObjectId, ref: "Chatbot", required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    channel: { type: String, enum: ["web", "facebook", "instagram"], default: "web" },
    status: { type: String, enum: ["active", "ended", "escalated"], default: "active" },
    satisfaction: { type: Number, min: 1, max: 5 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
