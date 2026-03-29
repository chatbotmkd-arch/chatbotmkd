import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { sanitizeMongoQuery } from "./middleware/validators";

import authRoutes from "./routes/auth";
import teamRoutes from "./routes/teams";
import chatbotRoutes from "./routes/chatbots";
import sourceRoutes from "./routes/sources";
import chatRoutes from "./routes/chat";
import analyticsRoutes from "./routes/analytics";
import subscriptionRoutes from "./routes/subscriptions";
import invoiceRoutes from "./routes/invoices";
import integrationRoutes from "./routes/integrations";
import widgetRoutes from "./routes/widget";
import scrapeRoutes from "./routes/scrape";
import adminRoutes from "./routes/admin";
import metaRoutes from "./routes/meta";

const app = express();

// Trust proxy for rate limiting behind reverse proxy (Vercel, nginx, etc.)
app.set("trust proxy", 1);

// Global middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", env.corsOrigin],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // allow widget embedding
  })
);
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// Raw body capture for Meta webhook signature verification
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Sanitize MongoDB query operators from request body/query
app.use(sanitizeMongoQuery);

// Rate limiting
app.use("/api/", apiLimiter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/chatbots", chatbotRoutes);
app.use("/api/chatbots", sourceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/widget", widgetRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api/admin", adminRoutes);

// Meta routes (mounted at root — webhook & OAuth paths are not under /api/)
app.use(metaRoutes);

// Error handler
app.use(errorHandler);

export default app;
