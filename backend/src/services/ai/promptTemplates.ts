import { ChatPromptTemplate } from "@langchain/core/prompts";

export const interviewerPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a strict system design interviewer."],
    ["human", `
        Problem: {problem}

        Conversation so far:
        {conversation}

        Ask ONE probing follow-up question.
        Do not explain.
    `],
]);

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
