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
};
