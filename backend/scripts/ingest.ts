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

    for (const file of files) {
        const topic = file.replace(".md", "");

        await ingestFile(path.join(dir, file), topic);
    }

    console.log("Knowledge ingestion completed");
}

run();