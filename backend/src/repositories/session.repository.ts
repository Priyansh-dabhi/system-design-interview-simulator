import pool from "../config/db.js";

export const createSession = async (
    userId: number,
    problem: string
    ) => {
    const result = await pool.query(
        `
        INSERT INTO interview_sessions (user_id, problem_name)
        VALUES ($1, $2)
        RETURNING id
        `,
        [userId, problem]
    );

    return result.rows[0];
};
