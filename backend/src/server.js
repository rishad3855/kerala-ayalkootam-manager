import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "ayalkootam-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

connectDb()
  .then(() => app.listen(port, () => console.log(`API running on ${port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
