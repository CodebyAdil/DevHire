import express from "express";
import authRoutes from "./features/auth/auth.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import jobRoutes from "./features/jobs/job.routes.js";
import candidateRoutes from "./features/candidates/candidate.routes.js";
import cors from "cors";

const app = express();


app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));

app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/jobs/:jobId/candidates", candidateRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
