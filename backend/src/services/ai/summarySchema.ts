import { z } from "zod";

// The five evaluation dimensions scored by the summary model.
export const SUMMARY_DIMENSIONS = [
    "requirements",
    "scalability",
    "data_modeling",
    "tradeoffs",
    "communication",
] as const;

export type SummaryDimension = (typeof SUMMARY_DIMENSIONS)[number];

const dimensionScore = z.object({
    score: z.number().min(0).max(10).describe("Score for this dimension, 0-10."),
    comment: z.string().describe("One concise sentence justifying the score."),
});

// Zod schema handed to `model.withStructuredOutput()` so Gemini returns
// schema-valid JSON instead of free-form text we have to parse defensively.
export const summarySchema = z.object({
    overall_score: z
        .number()
        .min(0)
        .max(100)
        .describe("Overall interview performance, 0-100."),
    dimension_scores: z
        .object({
            requirements: dimensionScore,
            scalability: dimensionScore,
            data_modeling: dimensionScore,
            tradeoffs: dimensionScore,
            communication: dimensionScore,
        })
        .describe("Per-dimension breakdown of the candidate's performance."),
    strengths: z.array(z.string()).describe("What the candidate did well."),
    missed_topics: z
        .array(z.string())
        .describe("Important topics the candidate did not cover or handled poorly."),
    suggestions: z
        .array(z.string())
        .describe("Actionable suggestions to improve."),
    topic_coverage: z
        .array(
            z.object({
                topic: z.string().describe("A key topic for this problem."),
                covered: z
                    .boolean()
                    .describe("Whether the candidate meaningfully addressed it."),
            })
        )
        .describe("Coverage map against the problem's key knowledge-base topics."),
    study_plan: z
        .array(
            z.object({
                topic: z.string().describe("A topic the candidate should study."),
                why: z.string().describe("Why this matters for the candidate."),
            })
        )
        .describe("Prioritized study plan grounded in the missed topics."),
    ideal_answer: z
        .string()
        .describe("A concise reference design an ideal candidate would give."),
});

// Inferred TS type used across the service, controller and persistence layer.
export type InterviewSummaryResult = z.infer<typeof summarySchema>;

// Graceful-degradation fallback if the structured model call fails for any
// reason — the summary screen still renders the three-list block.
export const emptySummaryResult = (): InterviewSummaryResult => ({
    overall_score: 0,
    dimension_scores: {
        requirements: { score: 0, comment: "" },
        scalability: { score: 0, comment: "" },
        data_modeling: { score: 0, comment: "" },
        tradeoffs: { score: 0, comment: "" },
        communication: { score: 0, comment: "" },
    },
    strengths: [],
    missed_topics: [],
    suggestions: [],
    topic_coverage: [],
    study_plan: [],
    ideal_answer: "",
});
