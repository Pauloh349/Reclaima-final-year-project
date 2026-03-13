import { Router } from "express";

import { getDatabase } from "../db/client.js";

const itemsRouter = Router();
const ITEMS_COLLECTION = "items";
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

let indexesReady = false;

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
