import testPrisma from "../../../prisma/test-client.js";
import { saveSummary } from "../../repositories/summary.repository.js";

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

  it("should save summary and mark session as completed atomically", async () => {
    await saveSummary(
      sessionId,
      userId,
      ["Good scalability thinking"],
      ["Didn't mention caching"],
      ["Read about Redis"]
    );

    const summary = await testPrisma.interviewSummary.findUnique({
      where: { sessionId },
    });

    const session = await testPrisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    expect(summary).toBeDefined();
    expect(session?.status).toBe("completed"); // both happened atomically
  });
});
