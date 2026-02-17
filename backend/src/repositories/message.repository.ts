import pool from "../config/db.js";

export const getConversation = async (sessionId: string) => {
    const result = await pool.query(
        `
        SELECT role, content
        FROM interview_messages
        WHERE session_id = $1
        ORDER BY created_at ASC
        `,
        [sessionId]
    );

    // Convert to string format for LLM
    return result.rows
        .map(row => `${row.role.toUpperCase()}: ${row.content}`)
        .join("\n");
};


export const saveMessage = async (
    sessionId: string,
    role: "user" | "ai",
    content: string
) => {
    await pool.query(
        `
        INSERT INTO interview_messages (session_id, role, content)
        VALUES ($1, $2, $3)
        `,
        [sessionId, role, content]
    );
};
