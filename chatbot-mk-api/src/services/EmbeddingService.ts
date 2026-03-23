import OpenAI from "openai";
import { env } from "../config/env";
import { Source } from "../models/Source";
import { Types } from "mongoose";

const openai = new OpenAI({ apiKey: env.openaiApiKey });

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export class EmbeddingService {
  static splitIntoChunks(text: string): string[] {
    const sentences = text.split(/(?<=[.!?。\n])\s+/);
    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      if ((current + " " + sentence).length > CHUNK_SIZE && current.length > 0) {
        chunks.push(current.trim());
        // Keep overlap from end of previous chunk
        const words = current.split(/\s+/);
        current = words.slice(-CHUNK_OVERLAP).join(" ") + " " + sentence;
      } else {
        current = current ? current + " " + sentence : sentence;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks;
  }

  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    return response.data.map((d) => d.embedding);
  }

  static async processAndStore(sourceId: Types.ObjectId, text: string): Promise<void> {
    const chunks = this.splitIntoChunks(text);
    const embeddings = await this.generateEmbeddings(chunks);

    const chunkDocs = chunks.map((text, index) => ({
      text,
      embedding: embeddings[index],
      index,
    }));

    await Source.findByIdAndUpdate(sourceId, {
      chunks: chunkDocs,
      status: "ready",
      lastSyncedAt: new Date(),
    });
  }

  static async searchSimilar(
    chatbotId: Types.ObjectId,
    query: string,
    topK = 5
  ): Promise<string[]> {
    const [queryEmbedding] = await this.generateEmbeddings([query]);

    // Fetch all ready sources for the chatbot
    const sources = await Source.find({
      chatbotId,
      status: "ready",
    }).select("chunks");

    // Compute cosine similarity for all chunks
    const scored: { text: string; score: number }[] = [];
    for (const source of sources) {
      for (const chunk of source.chunks) {
        const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        scored.push({ text: chunk.text, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.text);
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
