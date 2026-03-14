import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
});