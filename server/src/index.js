import app from "./app.js";
import { env } from "./config/env.js";
import {
  closeDatabaseConnection,
  connectToDatabase,
} from "./db/client.js";

let server;

async function startServer() {
  await connectToDatabase();

  server = app.listen(env.port, () => {
    console.log(`Reclaima API running on http://localhost:${env.port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await closeDatabaseConnection();
  process.exit(0);
}

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    console.error("Shutdown error:", error);
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    console.error("Shutdown error:", error);
    process.exit(1);
  });
});

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
