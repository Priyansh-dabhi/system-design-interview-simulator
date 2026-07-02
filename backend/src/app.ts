import express from "express";
import cors from "cors";

// routes (we’ll add auth routes soon)
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from  "./routes/interview.routes.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import { generalLimiter, authLimiter, chatLimiter } from "./middleware/rate-limit.middleware.js";

const app = express();

// global middlewares
app.use(express.json());
app.use(cors());

// rate limiting (disabled in test environment automatically by the middleware itself)
app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/interview/chat", chatLimiter);

// Diagnostic: Request Logger
app.use((req, res, next) => {
    console.log(`[Diagnostic] ${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// health check
app.get("/", (req, res) => {
    res.send("AI System Design Interview Simulator API is live 🚀");
});

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/interview",interviewRoutes)

// 404 catch-all
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found", code: "NOT_FOUND" });
});

// global error handler
app.use(globalErrorHandler);

export default app;
