//This service loads markdown → creates embeddings → stores them in PostgreSQL.
import fs from "fs";
import path from "path";
import { splitter } from "./chunk.service.js";
import { embedBatch } from "./embedding.service.js";
import prisma from "../../config/prisma.js";

export async function ingestFile(filePath: string, topic: string) {
    const content = fs.readFileSync(filePath, "utf-8");

    const chunks = await splitter.splitText(content);

    const embeddings = await embedBatch(chunks);

    for (let i = 0; i < chunks.length; i++) {
        const truncated = embeddings[i].slice(0, 768);
        await prisma.$executeRaw`
        INSERT INTO knowledge_chunks (topic, content, embedding, "updatedAt")
        VALUES (${topic}, ${chunks[i]}, ${JSON.stringify(truncated)}::vector, NOW())
        `;
    }

    console.log(`Inserted ${chunks.length} chunks`);
}