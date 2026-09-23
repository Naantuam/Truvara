import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import decisionsRoutes from "./routes/decisions.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import companyRoutes from "./routes/company.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
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
