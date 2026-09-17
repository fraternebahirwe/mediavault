import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export const app = express();

// Vercel sits in front as a reverse proxy, adding X-Forwarded-For; without
// this, express-rate-limit can't reliably identify clients by IP.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.storageProvider === "local") {
  app.use("/files", express.static(path.resolve(process.cwd(), env.local.uploadDir)));
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);
