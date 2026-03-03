import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", (req, res) => {
  const { email } = req.body || {};

  res.status(201).json({
    message: "User signup endpoint is ready.",
    user: email ? { email } : null,
  });
});

authRouter.post("/signin", (req, res) => {
  const { email } = req.body || {};

  res.status(200).json({
    message: "User signin endpoint is ready.",
    user: email ? { email } : null,
    token: "replace-with-real-jwt",
  });
});

export default authRouter;
