import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/client.js";
import { sendToUser } from "../services/realtime.js";

const chatsRouter = Router();
const CHATS_COLLECTION = "chats";
const MESSAGES_COLLECTION = "messages";
const ITEMS_COLLECTION = "items";
const USERS_COLLECTION = "users";

function toObjectId(value) {
  if (!ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

async function getCollection(name) {
  const db = getDatabase();
  const collection = db.collection(name);
  return collection;
}

async function ensureIndexes() {
  const chats = await getCollection(CHATS_COLLECTION);
  const messages = await getCollection(MESSAGES_COLLECTION);

  await chats.createIndex({ itemId: 1, participants: 1 });
  await chats.createIndex({ participants: 1, lastMessageAt: -1 });
  await messages.createIndex({ chatId: 1, createdAt: -1 });
}

function formatUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
  };
}

chatsRouter.post("/by-item", async (req, res) => {
  try {
    await ensureIndexes();

    const rawItemId = String(req.body?.itemId || "").trim();
    const rawSenderId = String(req.body?.senderId || "").trim();

    if (!rawItemId || !rawSenderId) {
      return res.status(400).json({
        message: "Item id and sender id are required.",
      });
    }

    const itemId = toObjectId(rawItemId);
    const senderId = toObjectId(rawSenderId);

    if (!itemId || !senderId) {
      return res.status(400).json({
        message: "Invalid item or sender id.",
      });
    }

    const items = await getCollection(ITEMS_COLLECTION);
    const users = await getCollection(USERS_COLLECTION);
    const chats = await getCollection(CHATS_COLLECTION);

    const item = await items.findOne({ _id: itemId });
    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    const recipientEmail = String(item.contactEmail || "")
      .trim()
      .toLowerCase();
    if (!recipientEmail) {
      return res.status(400).json({
        message: "Item does not have a recipient email.",
      });
    }

    const recipient = await users.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({
        message: "Recipient not found.",
      });
    }

    const recipientId = recipient._id;
    if (recipientId.equals(senderId)) {
      return res.status(400).json({
        message: "Sender and recipient cannot be the same user.",
      });
    }

    const existingChat = await chats.findOne({
      itemId,
      participants: { $all: [senderId, recipientId] },
    });

    if (existingChat) {
      return res.status(200).json({
        chat: {
          id: existingChat._id,
          itemId: existingChat.itemId,
          participants: existingChat.participants,
        },
        recipient: formatUser(recipient),
      });
    }

    const now = new Date().toISOString();
    const insertResult = await chats.insertOne({
      itemId,
      participants: [senderId, recipientId],
      createdAt: now,
      updatedAt: now,
      lastMessageAt: null,
    });

    return res.status(201).json({
      chat: {
        id: insertResult.insertedId,
        itemId,
        participants: [senderId, recipientId],
      },
      recipient: formatUser(recipient),
    });
  } catch (error) {
    console.error("Chat create error:", error);
    return res.status(500).json({
      message: "Unable to start chat right now.",
    });
  }
});

chatsRouter.get("/", async (req, res) => {
  try {
    await ensureIndexes();

    const rawUserId = String(req.query?.userId || "").trim();
    const userId = toObjectId(rawUserId);

    if (!userId) {
      return res.status(400).json({
        message: "Invalid user id.",
      });
    }

    const chats = await getCollection(CHATS_COLLECTION);
    const items = await getCollection(ITEMS_COLLECTION);
    const messages = await getCollection(MESSAGES_COLLECTION);
    const users = await getCollection(USERS_COLLECTION);

    const chatDocs = await chats
      .find({ participants: userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(50)
      .toArray();

    const itemIds = chatDocs
      .map((chat) => chat.itemId)
      .filter(Boolean)
      .map((value) => value.toString());

    const participantIds = new Set();
    chatDocs.forEach((chat) => {
      (chat.participants || []).forEach((participant) => {
        participantIds.add(String(participant));
      });
    });

    const [itemDocs, userDocs] = await Promise.all([
      items
        .find({ _id: { $in: itemIds.map((value) => new ObjectId(value)) } })
        .toArray(),
      users
        .find({
          _id: {
            $in: Array.from(participantIds).map((id) => new ObjectId(id)),
          },
        })
        .toArray(),
    ]);

    const itemMap = new Map(itemDocs.map((doc) => [String(doc._id), doc]));
    const userMap = new Map(userDocs.map((doc) => [String(doc._id), doc]));

    const results = [];

    for (const chat of chatDocs) {
      const lastMessage = await messages
        .find({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      const message = lastMessage[0];
      const item = chat.itemId ? itemMap.get(String(chat.itemId)) : null;
      const otherParticipant = (chat.participants || []).find(
        (value) => String(value) !== String(userId),
      );
      const recipient = otherParticipant
        ? formatUser(userMap.get(String(otherParticipant)))
        : null;

      results.push({
        id: String(chat._id),
        itemId: chat.itemId ? String(chat.itemId) : null,
        participants: (chat.participants || []).map((value) => String(value)),
        lastMessageAt: chat.lastMessageAt,
        item,
        recipient,
        lastMessage: message
          ? {
              id: String(message._id),
              senderId: String(message.senderId),
              text: message.text,
              createdAt: message.createdAt,
            }
          : null,
      });
    }

    return res.status(200).json({ chats: results });
  } catch (error) {
    console.error("Chats fetch error:", error);
    return res.status(500).json({
      message: "Unable to load chats right now.",
    });
  }
});

chatsRouter.get("/:id", async (req, res) => {
  try {
    const rawChatId = String(req.params?.id || "").trim();
    const rawUserId = String(req.query?.userId || "").trim();
    const chatId = toObjectId(rawChatId);
    const userId = rawUserId ? toObjectId(rawUserId) : null;

    if (!chatId) {
      return res.status(400).json({
        message: "Invalid chat id.",
      });
    }

    const chats = await getCollection(CHATS_COLLECTION);
    const items = await getCollection(ITEMS_COLLECTION);
    const users = await getCollection(USERS_COLLECTION);

    const chat = await chats.findOne({ _id: chatId });
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    const item = chat.itemId ? await items.findOne({ _id: chat.itemId }) : null;

    let recipient = null;
    if (userId) {
      const otherParticipant = (chat.participants || []).find(
        (value) => String(value) !== String(userId),
      );
      if (otherParticipant) {
        const userDoc = await users.findOne({ _id: otherParticipant });
        recipient = formatUser(userDoc);
      }
    }

    return res.status(200).json({
      chat: {
        id: String(chat._id),
        itemId: chat.itemId ? String(chat.itemId) : null,
        participants: (chat.participants || []).map((value) => String(value)),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        lastMessageAt: chat.lastMessageAt,
      },
      item,
      recipient,
    });
  } catch (error) {
    console.error("Chat fetch error:", error);
    return res.status(500).json({
      message: "Unable to load chat right now.",
    });
  }
});

chatsRouter.get("/:id/messages", async (req, res) => {
  try {
    await ensureIndexes();

    const rawChatId = String(req.params?.id || "").trim();
    const chatId = toObjectId(rawChatId);

    if (!chatId) {
      return res.status(400).json({
        message: "Invalid chat id.",
      });
    }

    const messages = await getCollection(MESSAGES_COLLECTION);
    const result = await messages
      .find({ chatId })
      .sort({ createdAt: 1 })
      .limit(200)
      .toArray();
    const formatted = result.map((message) => ({
      id: String(message._id),
      senderId: String(message.senderId),
      recipientId: String(message.recipientId),
      text: message.text,
      createdAt: message.createdAt,
    }));
    return res.status(200).json({ messages: formatted });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return res.status(500).json({
      message: "Unable to load messages right now.",
    });
  }
});

chatsRouter.post("/:id/messages", async (req, res) => {
  try {
    await ensureIndexes();

    const rawChatId = String(req.params?.id || "").trim();
    const rawSenderId = String(req.body?.senderId || "").trim();
    const text = String(req.body?.text || "").trim();

    if (!rawChatId || !rawSenderId || !text) {
      return res.status(400).json({
        message: "Chat id, sender id, and text are required.",
      });
    }

    const chatId = toObjectId(rawChatId);
    const senderId = toObjectId(rawSenderId);

    if (!chatId || !senderId) {
      return res.status(400).json({
        message: "Invalid chat or sender id.",
      });
    }

    const chats = await getCollection(CHATS_COLLECTION);
    const messages = await getCollection(MESSAGES_COLLECTION);
    const notifications = await getCollection("notifications");

    const chat = await chats.findOne({ _id: chatId });
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    const participants = chat.participants || [];
    const isParticipant = participants.some((id) => id.equals(senderId));
    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not a participant in this chat.",
      });
    }

    const recipientId = participants.find((id) => !id.equals(senderId));
    if (!recipientId) {
      return res.status(400).json({
        message: "Recipient not found for this chat.",
      });
    }

    const now = new Date().toISOString();
    const messageDoc = {
      chatId,
      senderId,
      recipientId,
      text,
      createdAt: now,
      readAt: null,
    };

    const insertResult = await messages.insertOne(messageDoc);
    const message = { _id: insertResult.insertedId, ...messageDoc };

    await chats.updateOne(
      { _id: chatId },
      { $set: { updatedAt: now, lastMessageAt: now } },
    );

    const notificationDoc = {
      userId: recipientId,
      type: "message",
      chatId,
      messageId: insertResult.insertedId,
      itemId: chat.itemId,
      senderId,
      text,
      createdAt: now,
      readAt: null,
    };

    const notificationResult = await notifications.insertOne(notificationDoc);

    sendToUser(String(recipientId), "message", {
      chatId: String(chatId),
      message: {
        id: String(message._id),
        senderId: String(message.senderId),
        recipientId: String(message.recipientId),
        text: message.text,
        createdAt: message.createdAt,
      },
      notificationId: String(notificationResult.insertedId),
    });

    sendToUser(String(senderId), "message", {
      chatId: String(chatId),
      message: {
        id: String(message._id),
        senderId: String(message.senderId),
        recipientId: String(message.recipientId),
        text: message.text,
        createdAt: message.createdAt,
      },
      notificationId: String(notificationResult.insertedId),
    });

    return res.status(201).json({
      message: {
        id: String(message._id),
        senderId: String(message.senderId),
        recipientId: String(message.recipientId),
        text: message.text,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error("Message send error:", error);
    return res.status(500).json({
      message: "Unable to send message right now.",
    });
  }
});

export default chatsRouter;
