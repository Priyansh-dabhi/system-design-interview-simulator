import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";

export const registerUser = async (full_name: string, email: string, password: string) => {
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
        "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email",
        [full_name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { user, token };
};

export const loginUser = async (email: string, password: string) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    const user = result.rows[0];
    console.log("User: ", user)
    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
    console.log("Password: ", password)
    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};
