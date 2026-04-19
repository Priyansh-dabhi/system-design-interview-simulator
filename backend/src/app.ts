import express from "express";
import cors from "cors";

// routes (we’ll add auth routes soon)
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from  "./routes/interview.routes.js"

const app = express();

// global middlewares
app.use(express.json());
app.use(cors());

// Diagnostic: Request Logger
app.use((req, res, next) => {
    console.log(`[Diagnostic] ${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// health check
app.get("/", (req, res) => {
    res.send("server is running");
});

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/interview",interviewRoutes)

export default app;
