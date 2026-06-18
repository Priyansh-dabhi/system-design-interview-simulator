import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.TEST_DATABASE_URL!,
});

const testPrisma = new PrismaClient({ adapter });

export default testPrisma;
