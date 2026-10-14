import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { logger, rateLimit } from "./middleware/requestMiddleware.js";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 5000);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "50kb" }));
app.use(logger);
app.use(rateLimit);
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    database: process.env.DATABASE_URL ? "postgres" : "development-memory",
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chat", chatRoutes);
app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});
app.listen(PORT, () =>
  console.log(`API listening at http://localhost:${PORT}`),
);
