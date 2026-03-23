import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMetaConnection extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  chatbotId: Types.ObjectId;
  pageId: string;
  pageName: string;
  pageAccessTokenEncrypted: string;
  instagramAccountId?: string;
  webhookSubscribed: boolean;
  status: "active" | "disconnected" | "error";
  connectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const metaConnectionSchema = new Schema<IMetaConnection>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    chatbotId: { type: Schema.Types.ObjectId, ref: "Chatbot", required: true },
    pageId: { type: String, required: true, unique: true },
    pageName: { type: String, required: true },
    pageAccessTokenEncrypted: { type: String, required: true },
    instagramAccountId: { type: String },
    webhookSubscribed: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "disconnected", "error"], default: "active" },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

metaConnectionSchema.index({ pageId: 1 });

export const MetaConnection = mongoose.model<IMetaConnection>("MetaConnection", metaConnectionSchema);
