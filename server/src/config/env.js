import dotenv from "dotenv";

dotenv.config();

function parseCorsOrigins(value) {
  const raw = value || "";
  const list = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return list.length ? list : ["http://localhost:5173"];
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  mongoDbConnectionUrl: process.env.MONGODB_URI || "",
  mongoDbName: process.env.MONGODB_DB_NAME || "reclaima",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:5173",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpSecure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
  emailFrom: process.env.EMAIL_FROM || "Reclaima <no-reply@reclaima.edu>",
};
