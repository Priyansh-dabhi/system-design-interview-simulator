import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from 'dotenv'
dotenv.config()

export const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",     // updated to correct model name
    temperature: 0.4,       // controlled probing
    apiKey: process.env.GEMINI_API_KEY,
});

// import { ChatOpenAI } from "@langchain/openai";
// import dotenv from 'dotenv'
// dotenv.config()

// export const model = new ChatOpenAI({
//     model: "llama-3.1-8b-instant",
//     temperature: 0.4,
//     apiKey: process.env.AI_API_KEY,
//     configuration: {
//         baseURL: "https://api.groq.com/openai/v1"
//     }
// });
