import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

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

process.on('beforeExit', async () => {
    console.log("Shutting down Prisma client...");
    await prisma.$disconnect();
});

export default prisma;