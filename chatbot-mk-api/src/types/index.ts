import { Request } from "express";
import { Types } from "mongoose";

export interface AuthPayload {
  userId: string;
  teamId: string;
  role: "owner" | "admin" | "member";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface EmbeddingChunk {
  text: string;
  embedding: number[];
  sourceId: Types.ObjectId;
  metadata?: Record<string, unknown>;
}
