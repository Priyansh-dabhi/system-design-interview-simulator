-- AlterTable: interview timer (chosen length + end anchor)
ALTER TABLE "interview_sessions" ADD COLUMN "durationMinutes" INTEGER,
ADD COLUMN "endedAt" TIMESTAMP(3);

-- AlterTable: richer AI summary (scores, coverage, study plan, ideal answer)
ALTER TABLE "interview_summaries" ADD COLUMN "overallScore" INTEGER,
ADD COLUMN "dimensionScores" JSONB,
ADD COLUMN "topicCoverage" JSONB,
ADD COLUMN "studyPlan" JSONB,
ADD COLUMN "idealAnswer" TEXT;
