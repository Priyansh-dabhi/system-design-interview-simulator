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