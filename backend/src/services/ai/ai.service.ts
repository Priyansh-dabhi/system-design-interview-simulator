import { summaryChain } from "./chains.js";

export const generateSummary = async (problem: string, conversation: string) => {
    const response = await summaryChain.invoke({
        problem,
        conversation
    })
    return response; //Already parsed JSON
}