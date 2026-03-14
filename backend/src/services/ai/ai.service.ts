import { interviewChain, summaryChain } from "./chains.js";
import { extractTextContent } from "../../utils/llm.js";
import { findRelevantChunks } from "../rag/retriever.service.js";

export const generateFollowUp = async (problem: string, conversation: string) => {
    // 1. Retrieve relevant context
    // We combine problem and latest part of conversation for retrieval
    const query = `${problem}\n${conversation.slice(-500)}`;
    const contextChunks = await findRelevantChunks(query);
    const context = contextChunks.join("\n\n");

    // 2. Generate follow-up with context
    const response = await interviewChain.invoke({
        problem,
        conversation,
        context
    });
    return extractTextContent(response.content);
}

export const generateSummary = async (problem: string, conversation: string) => {
    const response = await summaryChain.invoke({
        problem,
        conversation
    })
    return response; //Already parsed JSON
}