import { Router } from "express";
import crypto from "node:crypto";
import { promisify } from "node:util";

import { getDatabase } from "../db/client.js";

const authRouter = Router();
const scryptAsync = promisify(crypto.scrypt);
const USERS_COLLECTION = "users";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}


function normalizeName(name) {
  return String(name || "").trim();
}

function validateNameField(value, label, errors, key) {
  if (!value) {
    errors[key] = `${label} is required.`;
    return;
  }

  if (value.length < 2) {
    errors[key] = `${label} must be at least 2 characters.`;
    return;
  }

  if (value.length > 50) {
    errors[key] = `${label} must be 50 characters or fewer.`;
    return;
  }

  if (!NAME_REGEX.test(value)) {
    errors[key] =
      `${label} can only contain letters, spaces, apostrophes, or hyphens.`;
  }
}

function validateAuthInput(payload, options = {}) {
  const { requireNames = false } = options;
  const firstName = normalizeName(payload?.firstName);
  const lastName = normalizeName(payload?.lastName);
  const email = normalizeEmail(payload?.email);
  const password = String(payload?.password || "");
  const errors = {};

  if (requireNames) {
    validateNameField(firstName, "First name", errors, "firstName");
    validateNameField(lastName, "Last name", errors, "lastName");
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return {
    firstName,
    lastName,
    email,
    password,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, key] = String(storedHash || "").split(":");

  if (!salt || !key) {
    return false;
  }

  const derived = await scryptAsync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");

  if (keyBuffer.length !== derived.length) {
    return false;
  }

  return crypto.timingSafeEqual(keyBuffer, Buffer.from(derived));
}

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, errors, isValid } =
      validateAuthInput(req.body, { requireNames: true });

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid signup details.",
        errors,
      });
    }

    const db = getDatabase();
    const users = db.collection(USERS_COLLECTION);
    await users.createIndex({ email: 1 }, { unique: true });

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
        errors: {
          email: "Email already in use.",
        },
      });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const token = createToken();

    const insertResult = await users.insertOne({
      firstName,
      lastName,
      email,
      passwordHash,
      role: "user",
      authToken: token,
      authTokenIssuedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: insertResult.insertedId,
        firstName,
        lastName,
        email,
        role: "user",
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Unable to complete signup right now.",
    });
  }
});

authRouter.post("/signin", async (req, res) => {
  try {
    const { email, password, errors, isValid } = validateAuthInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid signin details.",
        errors,
      });
    }

    const db = getDatabase();
    const users = db.collection(USERS_COLLECTION);
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken();
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          authToken: token,
          authTokenIssuedAt: new Date().toISOString(),
        },
      },
    );

    return res.status(200).json({
      message: "Signed in successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || "user",
      },
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      message: "Unable to complete signin right now.",
    });
  }
});

export default authRouter;
