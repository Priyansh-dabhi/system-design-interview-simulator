import "dotenv/config";

/**
 * Executed before every test file (via jest.config.ts setupFiles).
 *
 * Redirects DATABASE_URL → TEST_DATABASE_URL so that the production
 * prisma singleton (src/config/prisma.ts) connects to the test DB
 * rather than the live DB during test runs.
 *
 * This works because, in CommonJS mode, module-level code (like
 * `new PrismaPg({ connectionString: process.env.DATABASE_URL })`)
 * runs when the module is first required — which happens AFTER
 * setupFiles run. So the env override lands just in time.
 */
if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is not set. Check your .env file.");
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
