import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  mongoDbConnectionUrl: process.env.MONGODB_URI || "",
  mongoDbName: process.env.MONGODB_DB_NAME || "reclaima",
};
