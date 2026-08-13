import request from "supertest";
import app from "../../app.js";
import { registerAndLogin, authHeader } from "../test-helpers.js";

// Mock the AI services to avoid hitting real APIs
jest.mock("../../services/ai/interviewOrchestrator.js", () => ({
  orchestrateResponse: jest.fn().mockResolvedValue({
    response: "Mocked AI question",
    stage: "warmup",
  }),
}));

jest.mock("../../services/ai/ai.service.js", () => ({
  generateSummary: jest.fn().mockResolvedValue({
    overall_score: 78,
    dimension_scores: {
      requirements: { score: 8, comment: "Clear scope" },
      scalability: { score: 7, comment: "Discussed sharding" },
      data_modeling: { score: 8, comment: "Solid schema" },
      tradeoffs: { score: 7, comment: "Weighed options" },
      communication: { score: 8, comment: "Structured" },
    },
    strengths: ["Great communication"],
    missed_topics: ["Scalability"],
    suggestions: ["Read about CDNs"],
    topic_coverage: [{ topic: "CDN", covered: false }],
    study_plan: [{ topic: "CDN", why: "Not addressed" }],
    ideal_answer: "Use a CDN with origin shield and adaptive bitrate...",
  }),
}));

describe("Interview Routes", () => {
  let token: string;
  let user: any;

  beforeAll(async () => {
    const auth = await registerAndLogin(app, "interview");
    token = auth.accessToken;
    user = auth.user;
  });

  describe("POST /api/interview/start_session", () => {
    it("should start a new session", async () => {
      const res = await request(app)
        .post("/api/interview/start_session")
        .set("Authorization", authHeader(token))
        .send({ problem: "Design Netflix" });

      expect(res.status).toBe(201);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.message).toBe("Mocked AI question");
      expect(res.body.stage).toBe("warmup");
    });

    it("should start a session with a chosen duration", async () => {
      const res = await request(app)
        .post("/api/interview/start_session")
        .set("Authorization", authHeader(token))
        .send({ problem: "Design Netflix", durationMinutes: 30 });

      expect(res.status).toBe(201);
      expect(res.body.sessionId).toBeDefined();
    });

    it("should reject an out-of-allowlist duration", async () => {
      const res = await request(app)
        .post("/api/interview/start_session")
        .set("Authorization", authHeader(token))
        .send({ problem: "Design Netflix", durationMinutes: 25 });

      expect(res.status).toBe(400);
    });

    it("should reject a missing problem", async () => {
      const res = await request(app)
        .post("/api/interview/start_session")
        .set("Authorization", authHeader(token))
        .send({ durationMinutes: 30 });

      expect(res.status).toBe(400);
    });

    it("should reject without token", async () => {
      const res = await request(app)
        .post("/api/interview/start_session")
        .send({ problem: "Design Netflix" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/interview/chat", () => {
    let sessionId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/interview/start_session")
        .set("Authorization", authHeader(token))
        .send({ problem: "Design Netflix" });
      sessionId = res.body.sessionId;
    });

    it("should process chat message", async () => {
      const res = await request(app)
        .post("/api/interview/chat")
        .set("Authorization", authHeader(token))
        .send({ sessionId, message: "I would use microservices" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Mocked AI question");
      expect(res.body.stage).toBe("warmup");
    });

    it("should return 404 for invalid session id", async () => {
      const res = await request(app)
        .post("/api/interview/chat")
        .set("Authorization", authHeader(token))
        .send({ sessionId: "invalid-id", message: "Hello" });

      expect(res.status).toBe(404);
    });

    it("should reject without token", async () => {
      const res = await request(app)
        .post("/api/interview/chat")
        .send({ sessionId, message: "Hello" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/interview/summary", () => {
    let sessionId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/interview/start_session")
        .set("Authorization", authHeader(token))
        .send({ problem: "Design Netflix" });
      sessionId = res.body.sessionId;
    });

    it("should generate a rich scored summary", async () => {
      const res = await request(app)
        .post("/api/interview/summary")
        .set("Authorization", authHeader(token))
        .send({ sessionId });

      expect(res.status).toBe(200);
      expect(res.body.strengths).toContain("Great communication");
      expect(res.body.missed_topics).toContain("Scalability");
      expect(res.body.overall_score).toBe(78);
      expect(res.body.dimension_scores.requirements.score).toBe(8);
      expect(Array.isArray(res.body.topic_coverage)).toBe(true);
      expect(typeof res.body.durationSeconds).toBe("number");
    });

    it("should return 404 for invalid session id", async () => {
      const res = await request(app)
        .post("/api/interview/summary")
        .set("Authorization", authHeader(token))
        .send({ sessionId: "invalid-id" });

      expect(res.status).toBe(404);
    });

    it("should reject without token", async () => {
      const res = await request(app)
        .post("/api/interview/summary")
        .send({ sessionId });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/interview/history", () => {
    it("should return history with stats", async () => {
      const res = await request(app)
        .get("/api/interview/history")
        .set("Authorization", authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.history).toBeInstanceOf(Array);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.total).toBeGreaterThanOrEqual(1);
    });

    it("should return empty history for new user", async () => {
      const newAuth = await registerAndLogin(app, "historynew");
      const res = await request(app)
        .get("/api/interview/history")
        .set("Authorization", authHeader(newAuth.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.history).toEqual([]);
      expect(res.body.stats.total).toBe(0);
    });

    it("should reject without token", async () => {
      const res = await request(app).get("/api/interview/history");
      expect(res.status).toBe(401);
    });
  });
});
