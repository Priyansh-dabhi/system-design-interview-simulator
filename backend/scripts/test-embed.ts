import dotenv from "dotenv";
dotenv.config();

import { embedText } from "../src/services/rag/embedding.service.js";

async function test() {
    console.log("Testing Embedding...");
    const embedding = await embedText("Hello world");
    console.log("Embedding size:", embedding.length);
}

test().catch(console.error);
