-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "interview_sessions" ADD COLUMN     "coveredTopics" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "difficultyLevel" TEXT NOT NULL DEFAULT 'mid';

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" SERIAL NOT NULL,
    "topic" VARCHAR(255) NOT NULL,
    "subtopic" VARCHAR(255),
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
ON knowledge_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index for topic filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_topic
ON knowledge_chunks(topic);