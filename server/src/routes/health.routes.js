import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "reclaima-api",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
