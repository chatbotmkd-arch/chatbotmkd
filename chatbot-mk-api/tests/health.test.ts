import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Health endpoint", () => {
  it("GET /api/health returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});
