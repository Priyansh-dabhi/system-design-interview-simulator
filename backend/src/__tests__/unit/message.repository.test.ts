import testPrisma from "../../../prisma/test-client.js";
import {
  saveMessage,
  getConversationForOwnedSession,
} from "../../repositories/message.repository.js";

describe("Message Repository", () => {
  let sessionId: string;
  let userId: number;

  beforeAll(async () => {
    const user = await testPrisma.user.create({
      data: {
        fullName: "Msg Test User",
        email: "msg.test@gmail.com",
        password: "hashedpassword123",
      },
    });
    userId = user.id;

    const session = await testPrisma.interviewSession.create({
      data: { userId, problemName: "Design YouTube" },
    });

    sessionId = session.id;
  });

  it("should save a message", async () => {
    await expect(
      saveMessage(sessionId, userId, "user", "I would use microservices")
    ).resolves.not.toThrow();
  });

  it("should return conversation in correct LLM format", async () => {
    await saveMessage(sessionId, userId, "ai", "Why microservices over monolith?");
    const conversation = await getConversationForOwnedSession(sessionId, userId);

    expect(conversation).toContain("USER:");
    expect(conversation).toContain("AI:");
    expect(typeof conversation).toBe("string");
  });

  it("should return messages in chronological order", async () => {
    const conversation = await getConversationForOwnedSession(sessionId, userId);
    const lines = conversation.split("\n");

    expect(lines[0]).toMatch(/^USER:/);
    expect(lines[1]).toMatch(/^AI:/);
  });
});
