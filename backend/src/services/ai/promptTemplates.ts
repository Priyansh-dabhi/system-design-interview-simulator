import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are evaluating a system design interview."],
    ["human", `
        Problem: {problem}

        Conversation:
        {conversation}

        Generate structured output in JSON:

        {{
        "strengths": [],
        "missed_topics": [],
        "suggestions": []
        }}
    `],
]);
