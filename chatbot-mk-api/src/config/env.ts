import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// In production, critical secrets MUST be set via environment variables
function requireEnv(name: string, fallback?: string): string {
  const val = process.env[name] || fallback;
  if (!val && isProduction) {
    console.error(`FATAL: Missing required env variable: ${name}`);
    process.exit(1);
  }
  return val || "";
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001", 10),

  mongodbUri: requireEnv("MONGODB_URI", "mongodb://localhost:27017/chatbot-mk"),

  jwtSecret: requireEnv("JWT_SECRET", isProduction ? undefined : "dev-jwt-secret-CHANGE-ME"),
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET", isProduction ? undefined : "dev-refresh-secret-CHANGE-ME"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  openaiApiKey: requireEnv("OPENAI_API_KEY"),

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:8080",

  metaAppId: process.env.META_APP_ID || "",
  metaAppSecret: process.env.META_APP_SECRET || "",
  metaWebhookVerifyToken: requireEnv("META_WEBHOOK_VERIFY_TOKEN", isProduction ? undefined : "chatbotmk-verify-token"),
  metaApiVersion: process.env.META_API_VERSION || "v19.0",

  encryptionKey: requireEnv("DATABASE_ENCRYPTION_KEY", isProduction ? undefined : "dev-encryption-key-32chars-long!"),

  appUrl: process.env.APP_URL || "http://localhost:3001",

  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "ChatBot MK <noreply@chatbotmkd.mk>",

  adminEmails: (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
} as const;
