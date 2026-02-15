import express from "express";
import tokenRouter from "./routes/token";
import justifyRouter from "./routes/justify";

const app = express();

// Parse JSON for /api/token
app.use("/api/token", express.json());

// Parse raw text for /api/justify
app.use("/api/justify", express.text({ type: "text/plain", limit: "10mb" }));

// Routes
app.use("/api/token", tokenRouter);
app.use("/api/justify", justifyRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
