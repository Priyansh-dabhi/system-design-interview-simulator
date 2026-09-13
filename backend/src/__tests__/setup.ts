import testPrisma from "../../prisma/test-client.js";

// Runs before ALL tests — clean DB
beforeAll(async () => {
  await testPrisma.interviewSummary.deleteMany();
  await testPrisma.interviewMessage.deleteMany();
  await testPrisma.interviewSession.deleteMany();
  await testPrisma.user.deleteMany();
});

// Runs after ALL tests — disconnect
afterAll(async () => {
  await testPrisma.$disconnect();
});
