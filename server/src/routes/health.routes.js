import { Router } from "express";

import { getDatabaseStatus } from "../db/client.js";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "reclaima-api",
    db: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
