import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
    try {
        const {full_name, email, password } = req.body;
        const user = await registerUser(full_name, email, password);
        res.status(201).json(user);
    } catch (err) {
        console.log("Registration error: ",err)
        res.status(400).json({ message: err });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.json(result);
    } catch (err) {
        console.log("Login error: ",err)
        res.status(401).json({ message: "Invalid credentials" });
    }
};