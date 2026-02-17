import pool from "../config/db.js";

export const saveSummary = async (
    sessionId: string,
    strengths: string[],
    missedTopics: string[],
    suggestions: string[]
) => {
    await pool.query(
        `
        INSERT INTO interview_summaries 
        (session_id, strengths, missed_topics, suggestions)
        VALUES ($1, $2, $3, $4)
        `,
        [sessionId, JSON.stringify(strengths), JSON.stringify(missedTopics), JSON.stringify(suggestions)]
    );

    await pool.query(
        `
        UPDATE interview_sessions
        SET status = 'completed'
        WHERE id = $1
        `,
        [sessionId]
    );
};
