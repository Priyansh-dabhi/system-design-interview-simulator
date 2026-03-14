import dotenv from "dotenv";
dotenv.config();

import { findRelevantChunks } from "../src/services/rag/retriever.service.js";

async function test() {
    console.log("--- Testing Retrieval ---");
    
    const queries = [
        "How to handle database scaling?",
        "What are the trade-offs of microservices?",
        "Explain consistent hashing."
    ];

    for (const query of queries) {
        console.log(`\nQuery: ${query}`);
        const chunks = await findRelevantChunks(query, 2);
        if (chunks.length === 0) {
            console.log("No relevant chunks found. (Is the DB populated?)");
        } else {
            chunks.forEach((chunk, i) => {
                console.log(`[Chunk ${i+1}]: ${chunk.substring(0, 150)}...`);
            });
        }
    }
}

test().catch(err => {
    console.error("Test failed:", err);
});
