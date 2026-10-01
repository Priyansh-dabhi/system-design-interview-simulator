import fs from "fs";
import path from "path";
import { splitter } from "./chunk.service.js";
import { embedBatchWithRetry } from "./embedding.service.js";
import prisma from "../../config/prisma.js";

export async function ingestFile(filePath: string, topic: string) {
    const content = fs.readFileSync(filePath, "utf-8");

    const chunks = await splitter.splitText(content);
    if (!chunks.length) {
        console.log(`Skipping ${topic}: No content found`);
        return;
    }

    const embeddings = await embedBatchWithRetry(chunks);

    // Clean up any previously inserted chunks for this topic to avoid duplicates
    await prisma.$executeRaw`
        DELETE FROM knowledge_chunks WHERE topic = ${topic}
    `;

    for (let i = 0; i < chunks.length; i++) {
        const vec = embeddings[i];
        if (!vec || vec.length === 0) {
            throw new Error(`Embedding vector for chunk ${i} in topic "${topic}" is empty.`);
        }
        const truncated = vec.slice(0, 768);
        await prisma.$executeRaw`
        INSERT INTO knowledge_chunks (topic, content, embedding, "updatedAt")
        VALUES (${topic}, ${chunks[i]}, ${JSON.stringify(truncated)}::vector, NOW())
        `;
    }

    console.log(`Inserted ${chunks.length} chunks for ${topic}`);
}