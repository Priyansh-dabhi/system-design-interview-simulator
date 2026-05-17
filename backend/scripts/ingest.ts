/*Run it:

npx ts-node scripts/ingest.ts

Now your database will contain vector embeddings for knowledge chunks. */

import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

import { ingestFile } from "../src/services/rag/ingestion.service.js";

async function run() {
    const dir = path.join(process.cwd(), "knowledge/topics");

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const topic = file.replace(".md", "");

        await ingestFile(path.join(dir, file), topic);
    }

    console.log("Knowledge ingestion completed");
}

run();