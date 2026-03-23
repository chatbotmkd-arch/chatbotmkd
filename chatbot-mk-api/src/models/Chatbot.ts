import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChatbot extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  name: string;
  config: {
    model: string;
    systemPrompt: string;
    language: string;
    tone: string;
    temperature: number;
  };
  appearance: {
    primaryColor: string;
    greeting: string;
    placeholder: string;
    position: "bottom-right" | "bottom-left";
    avatarUrl?: string;
  };
  status: "draft" | "active" | "paused";
  allowedDomains: string[];
  createdAt: Date;
  updatedAt: Date;
}

const chatbotSchema = new Schema<IChatbot>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    name: { type: String, required: true, trim: true },
    config: {
      model: { type: String, default: "gpt-4o-mini" },
      systemPrompt: { type: String, default: "" },
      language: { type: String, default: "mk" },
      tone: { type: String, default: "professional" },
      temperature: { type: Number, default: 0.7, min: 0, max: 2 },
    },
    appearance: {
      primaryColor: { type: String, default: "#8b5cf6" },
      greeting: { type: String, default: "Здраво! Како можам да ви помогнам?" },
      placeholder: { type: String, default: "Напишете порака..." },
      position: { type: String, enum: ["bottom-right", "bottom-left"], default: "bottom-right" },
      avatarUrl: { type: String },
    },
    status: { type: String, enum: ["draft", "active", "paused"], default: "draft" },
    allowedDomains: [{ type: String }],
  },
  { timestamps: true }
);

export const Chatbot = mongoose.model<IChatbot>("Chatbot", chatbotSchema);
