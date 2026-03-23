import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAnalyticsDaily extends Document {
  _id: Types.ObjectId;
  chatbotId: Types.ObjectId;
  date: Date;
  conversations: number;
  messages: number;
  avgSatisfaction: number;
  escalations: number;
  tokensUsed: number;
}

const analyticsDailySchema = new Schema<IAnalyticsDaily>(
  {
    chatbotId: { type: Schema.Types.ObjectId, ref: "Chatbot", required: true, index: true },
    date: { type: Date, required: true },
    conversations: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    avgSatisfaction: { type: Number, default: 0 },
    escalations: { type: Number, default: 0 },
    tokensUsed: { type: Number, default: 0 },
  },
  { timestamps: false }
);

analyticsDailySchema.index({ chatbotId: 1, date: 1 }, { unique: true });

export const AnalyticsDaily = mongoose.model<IAnalyticsDaily>("AnalyticsDaily", analyticsDailySchema);
