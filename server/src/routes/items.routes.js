import { Router } from "express";

const itemsRouter = Router();

const items = [];

itemsRouter.get("/", (_req, res) => {
  res.status(200).json({ items });
});

itemsRouter.post("/lost", (req, res) => {
  const newItem = {
    id: items.length + 1,
    type: "lost",
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

itemsRouter.post("/found", (req, res) => {
  const newItem = {
    id: items.length + 1,
    type: "found",
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

export default itemsRouter;
