import { ChatPromptTemplate } from "@langchain/core/prompts";
import { InterviewStage } from "./stageManager.js";

// Stage-specific instruction map
const stageInstructions: Record<InterviewStage, string> = {
    greeting: "Greet the user warmly, introduce the system design problem, and ask ONE simple warm-up question to set the tone. Do NOT discuss architecture yet.",
    warmup: "Ask basic requirement clarification questions. Focus on scope, constraints, target users, and core features. Avoid architecture discussion.",
    design: "Ask about overall system architecture. Encourage proposing services, APIs, databases, and communication protocols.",
    deep_dive: "Ask deeper technical questions about scaling, caching, replication, consistency, fault tolerance, and trade-offs.",
    evaluation: "Generate a structured evaluation JSON containing 'strengths', 'missed_topics', and 'suggestions'. Do not ask a new question."
};

const commonRules = `
Rules:
- Ask ONLY one question at a time
- Difficulty must increase gradually across stages
- Do NOT repeat greetings or re-introduce the problem
- Maintain a friendly but professional tone
- If the user's answer is vague, probe deeper before moving on
`;

// Builds a ChatPromptTemplate dynamically based on stage
export function buildInterviewPrompt(stage: InterviewStage, difficulty: string = "mid"): ChatPromptTemplate {
    const difficultyInstruction = 
        difficulty === "junior" ? "Keep questions introductory. Accept high-level answers without demanding deep trade-off analysis." :
        difficulty === "senior" ? "Demand rigorous trade-off analysis, failure modes, and back-of-the-envelope calculations." :
        "Expect reasonable depth. Probe trade-offs but don't demand production-grade nuance.";

    return ChatPromptTemplate.fromMessages([
        ["system", `You are a FAANG-level system design interviewer. 
        Interview Stage: ${stage}
        Difficulty Level: ${difficulty}
        
        ${difficultyInstruction}
        
        ${stageInstructions[stage]}
        
        ${commonRules}
        
        Use the provided technical context for more specific questions.
        If the context is irrelevant, ignore it.`],
        ["human", `
        Technical Context:
        {context}

        Problem: {problem}

        Conversation so far:
        {conversation}

        ${stage === 'evaluation' ? 'Generate structured JSON output.' : 'Ask ONE probing follow-up question based on the conversation and technical context.'}
        `]
    ]);
}
