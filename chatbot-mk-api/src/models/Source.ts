import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISource extends Document {
  _id: Types.ObjectId;
  chatbotId: Types.ObjectId;
  type: "document" | "website" | "faq" | "text";
  name: string;
  status: "pending" | "processing" | "ready" | "error";
  meta: {
    url?: string;
    fileKey?: string;
    mimeType?: string;
    fileSize?: number;
    pageCount?: number;
  };
  chunks: {
    text: string;
    embedding: number[];
    index: number;
  }[];
  errorMessage?: string;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sourceSchema = new Schema<ISource>(
  {
    chatbotId: { type: Schema.Types.ObjectId, ref: "Chatbot", required: true, index: true },
    type: { type: String, enum: ["document", "website", "faq", "text"], required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ["pending", "processing", "ready", "error"], default: "pending" },
    meta: {
      url: String,
      fileKey: String,
      mimeType: String,
      fileSize: Number,
      pageCount: Number,
    },
    chunks: [
      {
        text: { type: String, required: true },
        embedding: { type: [Number], required: true },
        index: { type: Number, required: true },
      },
    ],
    errorMessage: String,
    lastSyncedAt: Date,
  },
  { timestamps: true }
);

export const Source = mongoose.model<ISource>("Source", sourceSchema);
