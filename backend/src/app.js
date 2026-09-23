import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import decisionsRoutes from "./routes/decisions.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import companyRoutes from "./routes/company.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// CORS_ORIGIN accepts a comma-separated list, e.g. both the local dev
// server and the deployed Vercel frontend need to reach the same backend:
// "http://localhost:5173,https://truvara-lilac.vercel.app"
function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN || "http://localhost:5173";
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

export function createApp() {
  const app = express();

  const allowedOrigins = parseAllowedOrigins();
  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header (e.g. curl, server-to-server) -- allow.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/decisions", decisionsRoutes);
  app.use("/api/tasks", tasksRoutes);
  app.use("/api/transactions", transactionsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/company", companyRoutes);

  app.use(errorHandler);

  return app;
}
