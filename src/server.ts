import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";

import StudentRoute from "./routes/student.route.ts";
import { configDotenv } from "dotenv";

const app = express();
const PORT = process.env.PORT || 3000;

configDotenv();

// Middleware
app.use(helmet()); // security headers
app.use(cors); // Allow cross-origin
app.use(express.json()); // Parse json bodies

// Routes
app.get("/health", (req: Request, res: Response) => res.json({ status: "ok" }));
app.use("/api/students", StudentRoute);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log("Server running on port: ", PORT);
});
