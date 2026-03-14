import { ChatPromptTemplate } from "@langchain/core/prompts";

export const interviewerPrompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a strict system design interviewer. 
    Use the provided technical context to ask more specific and depth-oriented questions.
    If the context is irrelevant, ignore it.
    Focus on architectural trade-offs, scalability, and reliability.`],
    ["human", `
        Technical Context:
        {context}

        Problem: {problem}

        Conversation so far:
        {conversation}

        Ask ONE probing follow-up question based on the conversation and technical context.
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
