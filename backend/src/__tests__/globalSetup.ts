import "dotenv/config";
import testPrisma from "../../prisma/test-client.js";

/**
 * Runs ONCE before all test suites.
 * Wipes the test DB so every test run starts from a clean slate.
 */
export default async function globalSetup(): Promise<void> {
  await testPrisma.interviewSummary.deleteMany();
  await testPrisma.interviewMessage.deleteMany();
  await testPrisma.interviewSession.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.$disconnect();
}
