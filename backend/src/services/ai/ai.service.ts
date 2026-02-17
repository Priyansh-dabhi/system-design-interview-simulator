import { interviewChain, summaryChain } from "./chains.js";
import { extractTextContent } from "../../utils/llm.js";

export const generateFollowUp = async (problem: string, conversation: string) => {
    const response = await interviewChain.invoke({
        problem,
        conversation
    })
    return extractTextContent(response.content);
}

export const generateSummary = async (problem: string, conversation: string) => {
    const response = await summaryChain.invoke({
        problem,
        conversation
    })
    return response; //Already parsed JSON
}