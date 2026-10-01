import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

export async function seedReviewer() {
    console.log("Seeding Play Store Reviewer account...");

    const email = process.env.REVIEWER_EMAIL;
    const plainPassword = process.env.REVIEWER_PASSWORD;

    if (!email || !plainPassword) {
        console.warn("[Seed Reviewer] Skipping: REVIEWER_EMAIL or REVIEWER_PASSWORD not set in environment.");
        return null;
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const reviewer = await prisma.user.upsert({
        where: { email },
        update: {
            fullName: "Play Store Reviewer",
            password: passwordHash,
            authProvider: "password",
            acceptedTermsAt: new Date(),
        },
        create: {
            email,
            fullName: "Play Store Reviewer",
            password: passwordHash,
            authProvider: "password",
            acceptedTermsAt: new Date(),
        },
    });

    console.log(`[Success] Play Store Reviewer seeded successfully: ${reviewer.email}`);
    return reviewer;
}

// Allow running directly via: node --loader ts-node/esm prisma/seed_reviewer.ts
const isMain = process.argv[1] && (
    process.argv[1].endsWith("seed_reviewer.ts") ||
    process.argv[1].endsWith("seed_reviewer.js")
);

if (isMain) {
    seedReviewer()
        .catch((err) => {
            console.error("Failed to seed reviewer:", err);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
