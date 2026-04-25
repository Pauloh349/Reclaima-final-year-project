import dotenv from "dotenv";

dotenv.config();

function readEnv(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function parseCorsOrigins(value) {
  const raw = readEnv(value);
  const list = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return list.length ? list : ["http://localhost:5173"];
}

export const env = {
  nodeEnv: readEnv(process.env.NODE_ENV, "development"),
  port: Number(readEnv(process.env.PORT, "4000")) || 4000,
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  mongoDbConnectionUrl: readEnv(process.env.MONGODB_URI),
  mongoDbName: readEnv(process.env.MONGODB_DB_NAME, "reclaima"),
  appBaseUrl: readEnv(process.env.APP_BASE_URL, "http://localhost:5173"),
  smtpHost: readEnv(process.env.SMTP_HOST),
  smtpPort: Number(readEnv(process.env.SMTP_PORT, "587")) || 587,
  smtpUser: readEnv(process.env.SMTP_USER),
  smtpPass: readEnv(process.env.SMTP_PASS),
  smtpSecure: readEnv(process.env.SMTP_SECURE).toLowerCase() === "true",
  emailFrom: readEnv(
    process.env.EMAIL_FROM,
    "Reclaima <no-reply@reclaima.edu>",
  ),
};
