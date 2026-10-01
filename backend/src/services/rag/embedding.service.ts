import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/gemini-embedding-001",
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function embedText(text: string) {
    return embeddings.embedQuery(text);
}

export async function embedBatch(texts: string[]) {
    return embeddings.embedDocuments(texts);
}

export async function embedBatchWithRetry(texts: string[], maxRetries = 5, initialDelayMs = 3000): Promise<number[][]> {
    let delayMs = initialDelayMs;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const results = await embeddings.embedDocuments(texts);
            // @langchain/google-genai returns empty arrays [] if an API error (like rate limit 429) was caught internally
            const hasEmpty = results.some(vec => !vec || vec.length === 0);
            if (!hasEmpty && results.length === texts.length) {
                return results;
            }
            console.warn(`[Embedding] Attempt ${attempt}/${maxRetries} received empty vectors (likely rate limited). Retrying in ${delayMs / 1000}s...`);
        } catch (err: any) {
            console.warn(`[Embedding] Attempt ${attempt}/${maxRetries} failed: ${err.message}. Retrying in ${delayMs / 1000}s...`);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 1.5;
    }

    throw new Error(`Failed to generate embeddings after ${maxRetries} attempts due to persistent API errors or rate limiting.`);
}