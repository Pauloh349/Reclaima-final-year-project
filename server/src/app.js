import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import healthRouter from "./routes/health.routes.js";
import itemsRouter from "./routes/items.routes.js";
import matchesRouter from "./routes/matches.routes.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Reclaima API is running." });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;
