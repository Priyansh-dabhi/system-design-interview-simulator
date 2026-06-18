import testPrisma from "../../../prisma/test-client.js";
import { createSession } from "../../repositories/session.repository.js";

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
});
