import { Router } from "express";
import { ObjectId } from "mongodb";

import { getDatabase } from "../db/client.js";
import { registerClient } from "../services/realtime.js";

const notificationsRouter = Router();
const NOTIFICATIONS_COLLECTION = "notifications";

function toObjectId(value) {
  if (!ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

async function getNotificationsCollection() {
  const db = getDatabase();
  const collection = db.collection(NOTIFICATIONS_COLLECTION);
  await collection.createIndex({ userId: 1, createdAt: -1 });
  await collection.createIndex({ userId: 1, readAt: 1 });
  return collection;
}

notificationsRouter.get("/stream", async (req, res) => {
  const rawUserId = String(req.query?.userId || "").trim();
  const userId = toObjectId(rawUserId);

  if (!userId) {
    return res.status(400).json({
      message: "Invalid user id.",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  res.write("event: ready\n");
  res.write("data: {}\n\n");

  registerClient(String(userId), res);

  const keepAlive = setInterval(() => {
    res.write("event: ping\n");
    res.write(`data: ${Date.now()}\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

notificationsRouter.get("/", async (req, res) => {
  try {
    const rawUserId = String(req.query?.userId || "").trim();
    const userId = toObjectId(rawUserId);

    if (!userId) {
      return res.status(400).json({
        message: "Invalid user id.",
      });
    }

    const unreadOnly = String(req.query?.unread || "").toLowerCase() === "true";
    const collection = await getNotificationsCollection();

    const filter = { userId };
    if (unreadOnly) {
      filter.readAt = null;
    }

    const notifications = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return res.status(500).json({
      message: "Unable to load notifications right now.",
    });
  }
});

notificationsRouter.post("/:id/read", async (req, res) => {
  try {
    const rawId = String(req.params?.id || "").trim();
    const notificationId = toObjectId(rawId);

    if (!notificationId) {
      return res.status(400).json({
        message: "Invalid notification id.",
      });
    }

    const collection = await getNotificationsCollection();
    const now = new Date().toISOString();

    await collection.updateOne(
      { _id: notificationId },
      { $set: { readAt: now } },
    );

    return res.status(200).json({
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Notification update error:", error);
    return res.status(500).json({
      message: "Unable to update notification right now.",
    });
  }
});

export default notificationsRouter;
