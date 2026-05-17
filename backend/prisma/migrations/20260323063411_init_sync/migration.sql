-- DropIndex
DROP INDEX "idx_knowledge_topic";

-- DropIndex
DROP INDEX "knowledge_chunks_embedding_idx";

-- AlterTable
ALTER TABLE "interview_sessions" ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'greeting';
