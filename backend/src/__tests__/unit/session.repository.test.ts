import testPrisma from "../../../prisma/test-client.js";
import { createSession, getDailyInterviewUsage } from "../../repositories/session.repository.js";

describe("Session Repository", () => {
  let userId: number;

  beforeAll(async () => {
    // Create a user to attach sessions to
    const user = await testPrisma.user.create({
      data: {
        fullName: "Test User",
        email: "session.test@gmail.com",
        password: "hashedpassword123",
      },
    });
    userId = user.id;
  });

  it("should create a session and return id", async () => {
    const session = await createSession(userId, "Design Twitter");

    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
  });

  it("should set default status as active", async () => {
    const session = await testPrisma.interviewSession.findFirst({
      where: { userId },
    });

    expect(session?.status).toBe("active");
  });

  it("should calculate daily interview usage correctly", async () => {
    const usage = await getDailyInterviewUsage(userId);
    expect(usage).toBeDefined();
    expect(usage.used).toBeGreaterThanOrEqual(1);
    expect(usage.limit).toBeDefined();
    expect(usage.resetsAt).toBeDefined();
  });
});

