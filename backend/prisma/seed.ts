import "dotenv/config";
import prisma from "../src/config/prisma.js";
import { seedReviewer } from "./seed_reviewer.js";
import { seedLearning } from "./seed_learning.js";

async function main() {
    console.log("=== Starting Database Seed ===");

    // 1. Seed Google Play Store reviewer credentials
    await seedReviewer();

    // 2. Seed Learning topics and lessons
    await seedLearning();

    console.log("=== All Database Seeds Completed Successfully! ===");
}

main()
    .catch((e) => {
        console.error("Database seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
