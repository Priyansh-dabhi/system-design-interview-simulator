import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const isRemoteDb = Boolean(
    connectionString &&
    !connectionString.includes("localhost") &&
    !connectionString.includes("127.0.0.1")
);

const pool = new pg.Pool({
    connectionString,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ 
    adapter,
    log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
    ],
});

prisma.$on('warn', (e) => {
    console.warn(`[Prisma Warn] ${e.message}`);
});

prisma.$on('error', (e) => {
    console.error(`[Prisma Error] ${e.message}`);
});

export async function closeDatabaseConnections() {
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
}

export { pool };
export default prisma;