/*Run it:

npx ts-node scripts/ingest.ts

Now your database will contain vector embeddings for knowledge chunks. */

import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Use dynamic import so dotenv.config() runs BEFORE the module is evaluated
// Otherwise, ES module imports are hoisted and process.env is undefined
async function run() {
    const { ingestFile } = await import("../src/services/rag/ingestion.service.js");
    const dir = path.join(process.cwd(), "knowledge/topics");

    const files = fs.readdirSync(dir);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const topic = file.replace(".md", "");

        console.log(`[${i + 1}/${files.length}] Ingesting ${topic}...`);
        await ingestFile(path.join(dir, file), topic);

        // 1.5s delay between files to respect Google Gemini free tier rate limits (15 RPM)
        if (i < files.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }
    }

    console.log("All knowledge ingestion completed successfully!");
}

run();