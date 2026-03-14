import { embedText } from "./embedding.service.js";
import prisma from "../../config/prisma.js";

export async function findRelevantChunks(query: string, limit: number = 3) {
    const queryEmbedding = await embedText(query);
    
    // Truncate to 768 to match the vector(768) in schema
    const truncated = queryEmbedding.slice(0, 768);

    // Vector similarity search (Cosine similarity)
    // pgvector <=> operator is for cosine distance (1 - cosine similarity)
    const results: any[] = await prisma.$queryRaw`
        SELECT content, topic, 1 - (embedding <=> ${JSON.stringify(truncated)}::vector) as similarity
        FROM knowledge_chunks
        ORDER BY similarity DESC
        LIMIT ${limit}
    `;

    return results.map(r => r.content);
}
