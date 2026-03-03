import { Router } from "express";

const matchesRouter = Router();

matchesRouter.get("/", (_req, res) => {
  res.status(200).json({
    matches: [],
    message: "Smart matches endpoint is ready.",
  });
});

export default matchesRouter;
