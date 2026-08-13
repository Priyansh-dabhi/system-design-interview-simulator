import testPrisma from "../../../prisma/test-client.js";
import { saveSummary } from "../../repositories/summary.repository.js";
import type { InterviewSummaryResult } from "../../services/ai/summarySchema.js";

const richResult: InterviewSummaryResult = {
  overall_score: 82,
  dimension_scores: {
    requirements: { score: 8, comment: "Clarified scope early" },
    scalability: { score: 7, comment: "Discussed sharding" },
    data_modeling: { score: 8, comment: "Reasonable schema" },
    tradeoffs: { score: 9, comment: "Weighed consistency vs availability" },
    communication: { score: 8, comment: "Clear and structured" },
  },
  strengths: ["Good scalability thinking"],
  missed_topics: ["Didn't mention caching"],
  suggestions: ["Read about Redis"],
  topic_coverage: [
    { topic: "Sharding", covered: true },
    { topic: "Caching", covered: false },
  ],
  study_plan: [{ topic: "Caching", why: "Missed during the interview" }],
  ideal_answer: "Use consistent hashing with a cache-aside Redis layer...",
};

describe("Summary Repository", () => {
  let sessionId: string;
  let userId: number;

  beforeAll(async () => {
    const user = await testPrisma.user.create({
      data: {
        fullName: "Summary User",
        email: "summary.test@gmail.com",
        password: "hashedpassword123",
      },
    });
    userId = user.id;

    const session = await testPrisma.interviewSession.create({
      data: { userId, problemName: "Design Uber" },
    });

    sessionId = session.id;
  });

  it("should save a rich summary, mark session completed and stamp endedAt atomically", async () => {
    await saveSummary(sessionId, userId, richResult);

    const summary = await testPrisma.interviewSummary.findUnique({
      where: { sessionId },
    });

    const session = await testPrisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    expect(summary).toBeDefined();
    expect(summary?.overallScore).toBe(82);
    expect(summary?.idealAnswer).toContain("consistent hashing");
    // The three original lists remain JSON-encoded strings for back-compat.
    expect(JSON.parse(summary?.strengths ?? "[]")).toEqual(["Good scalability thinking"]);
    // Rich JSON columns are stored as structured objects.
    expect(summary?.dimensionScores).toMatchObject({
      requirements: { score: 8 },
    });
    expect(summary?.topicCoverage).toEqual(richResult.topic_coverage);

    expect(session?.status).toBe("completed"); // both happened atomically
    expect(session?.endedAt).not.toBeNull();
  });
});
