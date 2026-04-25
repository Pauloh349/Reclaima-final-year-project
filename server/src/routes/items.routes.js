import { Router } from "express";
import { ObjectId } from "mongodb";

import { getDatabase } from "../db/client.js";
import { sendMatchEmail } from "../services/email.js";

const itemsRouter = Router();
const ITEMS_COLLECTION = "items";
const MATCH_NOTIFICATIONS_COLLECTION = "match_notifications";
const ALLOWED_ITEM_FIELDS = [
  "title",
  "category",
  "description",
  "location",
  "zone",
  "contactName",
  "contactEmail",
  "contactPhone",
  "handoverMethod",
  "photoUrl",
];
const MATCH_EMAIL_COOLDOWN_MINUTES = 180;
const MATCH_EMAIL_TTL_DAYS = 30;

let indexesReady = false;
let matchIndexesReady = false;

async function getItemsCollection() {
  const db = getDatabase();
  const collection = db.collection(ITEMS_COLLECTION);

  if (!indexesReady) {
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ type: 1, createdAt: -1 });
    await collection.createIndex({ status: 1, createdAt: -1 });
    await collection.createIndex({ type: 1, contactEmail: 1, createdAt: -1 });
    await collection.createIndex({ type: 1, category: 1, createdAt: -1 });
    indexesReady = true;
  }

  return collection;
}

async function getMatchNotificationsCollection() {
  const db = getDatabase();
  const collection = db.collection(MATCH_NOTIFICATIONS_COLLECTION);

  if (!matchIndexesReady) {
    await collection.createIndex(
      { lostItemId: 1, foundItemId: 1 },
      { unique: true },
    );
    await collection.createIndex({ lostItemId: 1, sentAt: -1 });
    await collection.createIndex(
      { sentAt: 1 },
      { expireAfterSeconds: MATCH_EMAIL_TTL_DAYS * 24 * 60 * 60 },
    );
    matchIndexesReady = true;
  }

  return collection;
}

function buildItemPayload(input, type) {
  const payload = {};

  ALLOWED_ITEM_FIELDS.forEach((field) => {
    const value = input?.[field];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      payload[field] = typeof value === "string" ? value.trim() : value;
    }
  });

  const now = new Date().toISOString();

  return {
    ...payload,
    type,
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensFrom(value) {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized.split(" ");
}

function hasTokenOverlap(a, b) {
  const tokensA = new Set(tokensFrom(a));
  if (!tokensA.size) return false;
  return tokensFrom(b).some((token) => tokensA.has(token));
}

function isMatch(lostItem, foundItem) {
  const lostCategory = normalizeText(lostItem?.category);
  const foundCategory = normalizeText(foundItem?.category);
  if (!lostCategory || !foundCategory || lostCategory !== foundCategory) {
    return false;
  }

  const lostZone = normalizeText(lostItem?.zone);
  const foundZone = normalizeText(foundItem?.zone);
  const lostLocation = normalizeText(lostItem?.location);
  const foundLocation = normalizeText(foundItem?.location);
  const zoneMatches = lostZone && foundZone && lostZone === foundZone;
  const locationMatches =
    lostLocation && foundLocation && lostLocation === foundLocation;

  if (!zoneMatches && !locationMatches) {
    return false;
  }

  const lostTitle = normalizeText(lostItem?.title);
  const foundTitle = normalizeText(foundItem?.title);

  if (lostTitle && foundTitle) {
    return lostTitle === foundTitle || hasTokenOverlap(lostTitle, foundTitle);
  }

  return true;
}

function isWithinCooldown(sentAt) {
  if (!sentAt) return false;
  const sentMs = new Date(sentAt).getTime();
  if (!Number.isFinite(sentMs)) return false;
  return Date.now() - sentMs < MATCH_EMAIL_COOLDOWN_MINUTES * 60 * 1000;
}

async function shouldSendMatchEmail(notifications, lostItemId, foundItemId) {
  if (!lostItemId || !foundItemId) return false;

  const alreadySent = await notifications.findOne({
    lostItemId,
    foundItemId,
  });

  if (alreadySent) {
    return false;
  }

  if (MATCH_EMAIL_COOLDOWN_MINUTES > 0) {
    const lastSent = await notifications.findOne(
      { lostItemId },
      { sort: { sentAt: -1 } },
    );

    if (lastSent && isWithinCooldown(lastSent.sentAt)) {
      return false;
    }
  }

  return true;
}

async function notifyLostItemMatches(foundItem) {
  const category = String(foundItem?.category || "").trim();
  const location = String(foundItem?.location || "").trim();
  const zone = String(foundItem?.zone || "").trim();

  if (!category || (!location && !zone)) {
    return;
  }

  const collection = await getItemsCollection();
  const notifications = await getMatchNotificationsCollection();
  const categoryRegex = new RegExp(`^${escapeRegex(category)}$`, "i");
  const candidates = await collection
    .find({ type: "lost", category: categoryRegex })
    .sort({ createdAt: -1 })
    .toArray();

  if (!candidates.length) return;

  const foundItemId = foundItem?._id?.toString?.() || foundItem?.id;
  const sendTasks = [];

  for (const lostItem of candidates) {
    if (!isMatch(lostItem, foundItem)) continue;
    const email = String(lostItem?.contactEmail || "").trim();
    if (!email) continue;

    const lostItemId = lostItem?._id?.toString?.() || lostItem?._id;
    const shouldSend = await shouldSendMatchEmail(
      notifications,
      lostItemId,
      foundItemId,
    );

    if (!shouldSend) continue;

    sendTasks.push(
      sendMatchEmail({
        to: email,
        lostItem,
        foundItem: {
          ...foundItem,
          id: foundItemId,
        },
      })
        .then(() =>
          notifications.insertOne({
            lostItemId,
            foundItemId,
            sentAt: new Date().toISOString(),
          }),
        )
        .catch((error) => {
          console.error("Match email error:", error);
        }),
    );
  }

  if (!sendTasks.length) return;

  await Promise.allSettled(sendTasks);
}

itemsRouter.get("/", async (req, res) => {
  try {
    const collection = await getItemsCollection();
    const type = String(req.query?.type || "").toLowerCase();
    const filter = {};

    if (type === "lost" || type === "found") {
      filter.type = type;
    }

    const items = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ items });
  } catch (error) {
    console.error("Items fetch error:", error);
    res.status(500).json({
      message: "Unable to load items right now.",
    });
  }
});

itemsRouter.get("/matches", async (req, res) => {
  try {
    const rawEmail = String(req.query?.email || "").trim();

    if (!rawEmail) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const email = rawEmail.toLowerCase();
    const collection = await getItemsCollection();
    const emailRegex = new RegExp(`^${escapeRegex(email)}$`, "i");

    const lostReports = await collection
      .find({ type: "lost", contactEmail: emailRegex })
      .sort({ createdAt: -1 })
      .toArray();

    if (!lostReports.length) {
      return res.status(200).json({
        matches: [],
        lostCount: 0,
        foundCount: 0,
      });
    }

    const categories = [
      ...new Set(
        lostReports
          .map((item) => String(item?.category || "").trim())
          .filter(Boolean),
      ),
    ];

    if (!categories.length) {
      return res.status(200).json({
        matches: [],
        lostCount: lostReports.length,
        foundCount: 0,
      });
    }

    const categoryRegexes = categories.map(
      (value) => new RegExp(`^${escapeRegex(value)}$`, "i"),
    );

    const foundReports = await collection
      .find({ type: "found", category: { $in: categoryRegexes } })
      .sort({ createdAt: -1 })
      .toArray();

    const matches = [];
    const seen = new Set();

    lostReports.forEach((lostItem) => {
      foundReports.forEach((foundItem) => {
        if (!isMatch(lostItem, foundItem)) return;
        const id = foundItem._id?.toString?.() || foundItem._id;
        const key = id || `${foundItem.title}-${foundItem.createdAt}`;
        if (seen.has(key)) return;
        seen.add(key);
        matches.push({
          ...foundItem,
          matchSource: {
            id: lostItem._id?.toString?.() || lostItem._id,
            title: lostItem.title || "",
          },
        });
      });
    });

    res.status(200).json({
      matches,
      lostCount: lostReports.length,
      foundCount: foundReports.length,
    });
  } catch (error) {
    console.error("Matches fetch error:", error);
    res.status(500).json({
      message: "Unable to load matches right now.",
    });
  }
});

itemsRouter.get("/summary", async (req, res) => {
  try {
    const rawEmail = String(req.query?.email || "").trim();

    if (!rawEmail) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const email = rawEmail.toLowerCase();
    const collection = await getItemsCollection();
    const emailRegex = new RegExp(`^${escapeRegex(email)}$`, "i");

    const [lostCount, foundCount, openCount, recentItems] = await Promise.all([
      collection.countDocuments({ type: "lost", contactEmail: emailRegex }),
      collection.countDocuments({ type: "found", contactEmail: emailRegex }),
      collection.countDocuments({ contactEmail: emailRegex, status: "open" }),
      collection
        .find({ contactEmail: emailRegex })
        .sort({ createdAt: -1 })
        .project({
          title: 1,
          type: 1,
          category: 1,
          location: 1,
          zone: 1,
          createdAt: 1,
          status: 1,
          photoUrl: 1,
        })
        .limit(5)
        .toArray(),
    ]);

    res.status(200).json({
      lostCount,
      foundCount,
      openCount,
      recentItems: recentItems.map((item) => ({
        id: item._id?.toString?.() || item._id,
        title: item.title || "",
        type: item.type || "",
        category: item.category || "",
        location: item.location || item.zone || "",
        createdAt: item.createdAt || "",
        status: item.status || "",
        photoUrl: item.photoUrl || "",
      })),
    });
  } catch (error) {
    console.error("Summary fetch error:", error);
    res.status(500).json({
      message: "Unable to load summary right now.",
    });
  }
});

itemsRouter.get("/:id", async (req, res) => {
  try {
    const rawId = String(req.params?.id || "").trim();

    if (!rawId) {
      return res.status(400).json({
        message: "Item id is required.",
      });
    }

    if (!ObjectId.isValid(rawId)) {
      return res.status(400).json({
        message: "Invalid item id.",
      });
    }

    const collection = await getItemsCollection();
    const item = await collection.findOne({ _id: new ObjectId(rawId) });

    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    return res.status(200).json({ item });
  } catch (error) {
    console.error("Item fetch error:", error);
    res.status(500).json({
      message: "Unable to load item right now.",
    });
  }
});

itemsRouter.patch("/:id/status", async (req, res) => {
  try {
    const rawId = String(req.params?.id || "").trim();
    const status = String(req.body?.status || "").trim();
    const returnMethod = String(req.body?.returnMethod || "").trim();
    const returnedBy = String(req.body?.returnedBy || "").trim();
    const returnedNote = String(req.body?.returnedNote || "").trim();

    if (!rawId) {
      return res.status(400).json({
        message: "Item id is required.",
      });
    }

    if (!ObjectId.isValid(rawId)) {
      return res.status(400).json({
        message: "Invalid item id.",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
      });
    }

    const collection = await getItemsCollection();
    const now = new Date().toISOString();
    const update = {
      status,
      updatedAt: now,
    };

    if (status === "returned") {
      update.returnedAt = now;
      update.returnMethod = returnMethod || undefined;
      update.returnedBy = returnedBy || undefined;
      update.returnedNote = returnedNote || undefined;
    } else {
      update.$unset = {
        returnedAt: "",
        returnMethod: "",
        returnedBy: "",
        returnedNote: "",
      };
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(rawId) },
      status === "returned"
        ? {
            $set: Object.fromEntries(
              Object.entries(update).filter(([, value]) => value !== undefined),
            ),
          }
        : {
            $set: {
              status,
              updatedAt: now,
            },
            $unset: {
              returnedAt: "",
              returnMethod: "",
              returnedBy: "",
              returnedNote: "",
            },
          },
      { returnDocument: "after" },
    );

    if (!result?.value) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    return res.status(200).json({ item: result.value });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      message: "Unable to update status right now.",
    });
  }
});

itemsRouter.post("/lost", async (req, res) => {
  try {
    const collection = await getItemsCollection();
    const newItem = buildItemPayload(req.body, "lost");
    const insertResult = await collection.insertOne(newItem);

    res.status(201).json({
      id: insertResult.insertedId,
      ...newItem,
    });
  } catch (error) {
    console.error("Lost item error:", error);
    res.status(500).json({
      message: "Unable to create lost item report.",
    });
  }
});

itemsRouter.post("/found", async (req, res) => {
  try {
    const collection = await getItemsCollection();
    const newItem = buildItemPayload(req.body, "found");
    const insertResult = await collection.insertOne(newItem);

    const foundItem = {
      ...newItem,
      _id: insertResult.insertedId,
    };

    notifyLostItemMatches(foundItem).catch((error) => {
      console.error("Match notification error:", error);
    });

    res.status(201).json({
      id: insertResult.insertedId,
      ...newItem,
    });
  } catch (error) {
    console.error("Found item error:", error);
    res.status(500).json({
      message: "Unable to create found item report.",
    });
  }
});

export default itemsRouter;
