import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
dotenv.config();

const useGroq = Boolean(process.env.GROQ_API_KEY);

export const model: any = useGroq
    ? new ChatOpenAI({
        model: "openai/gpt-oss-120b",
        temperature: 0.4,
        apiKey: process.env.GROQ_API_KEY,
        configuration: {
            baseURL: "https://api.groq.com/openai/v1",
        },
    })
    : new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        temperature: 0.4,
        apiKey: process.env.GEMINI_API_KEY,
    });

