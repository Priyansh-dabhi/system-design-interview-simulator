import { determineStage, InterviewStage } from './stageManager.js';
import { buildInterviewPrompt } from './promptBuilder.js';
import { findRelevantChunks } from '../rag/retriever.service.js';
import { model } from './model.js';
import { extractTextContent } from '../../utils/llm.js';

export async function orchestrateResponse(
    sessionId: string,
    problem: string,
    conversation: string,
    messageCount: number,
    difficultyLevel: string = "mid"
): Promise<{ response: string; stage: InterviewStage }> {
    
    // 1. Determine current interview stage
    const stage = determineStage(messageCount);

    // 2. Retrieve relevant context using RAG
    const query = `${problem}\n${conversation.slice(-500)}`;
    let context = "";
    try {
        const contextChunks = await findRelevantChunks(query);
        context = contextChunks.join("\n\n");
    } catch (e) {
        console.warn("Retriever unavailable or error:", e);
    }

    // 3. Build the prompt dynamically based on the stage
    const prompt = buildInterviewPrompt(stage, difficultyLevel);
    
    // 4. Create the chain and invoke it
    const chain = prompt.pipe(model);
    
    // 5. Invoke LLM
    const llmResponse = await chain.invoke({
        problem,
        conversation,
        context,
        stage
    });
    
    // 6. Extract raw text
    const responseText = extractTextContent(llmResponse.content);
    
    return {
        response: responseText,
        stage
    };
}
