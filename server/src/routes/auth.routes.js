import { Router } from "express";
import crypto from "node:crypto";
import { promisify } from "node:util";

import { getDatabase } from "../db/client.js";
import {
  sendAccountStatusEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../services/email.js";

const authRouter = Router();
const scryptAsync = promisify(crypto.scrypt);
const USERS_COLLECTION = "users";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;
const PROFILE_BIO_MAX_LENGTH = 240;
const PROFILE_TEXT_MAX_LENGTH = 80;
const PROFILE_ID_MAX_LENGTH = 40;
const PHONE_REGEX = /^[+()\-\d\s]{7,30}$/;

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizeName(name) {
  return String(name || "").trim();
}

function getAuthTokenFromRequest(req) {
  const authHeader = String(req.headers.authorization || "");
  return authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
}

async function sendAccountLockNoticeIfNeeded(user, usersCollection) {
  if (!user?.accountLocked || user.accountLockNotificationSentAt) {
    return false;
  }

  const sentAt = new Date().toISOString();

  try {
    await sendAccountStatusEmail({
      to: user.email,
      firstName: user.firstName,
      locked: true,
      reason: user.accountLockReason || "Misuse of the platform.",
      lockedAt: user.accountLockedAt || sentAt,
      adminEmail: user.accountLockedBy || "",
    });

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          accountLockNotificationSentAt: sentAt,
          updatedAt: sentAt,
        },
      },
    );

    return true;
  } catch (error) {
    console.error("Account lock notice error:", error);
    return false;
  }
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

function isVerificationExpired(issuedAt) {
  if (!issuedAt) return true;
  const issuedMs = new Date(issuedAt).getTime();
  if (!Number.isFinite(issuedMs)) return true;
  return Date.now() - issuedMs > EMAIL_VERIFICATION_TTL_MS;
}

function isPasswordResetExpired(issuedAt) {
  if (!issuedAt) return true;
  const issuedMs = new Date(issuedAt).getTime();
  if (!Number.isFinite(issuedMs)) return true;
  return Date.now() - issuedMs > PASSWORD_RESET_TTL_MS;
}

function buildUserProfile(user) {
  return {
    id: user._id?.toString?.() || String(user._id),
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    role: user.role || "user",
    emailVerified: user.emailVerified !== false,
    accountLocked: user.accountLocked === true,
    accountLockReason: user.accountLockReason || "",
    accountLockedAt: user.accountLockedAt || "",
    phone: user.phone || "",
    campus: user.campus || "",
    language: user.language || "",
    studentId: user.studentId || "",
    bio: user.bio || "",
    receiveMatchEmails: user.receiveMatchEmails !== false,
    avatarUrl: user.avatarUrl || "",
    createdAt: user.createdAt || "",
    updatedAt: user.updatedAt || "",
  };
}

async function requireAuthenticatedUser(req, res) {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    res.status(401).json({
      message: "Authentication required.",
    });
    return null;
  }

  const db = getDatabase();
  const users = db.collection(USERS_COLLECTION);
  const user = await users.findOne({ authToken: token });

  if (!user) {
    res.status(401).json({
      message: "Invalid or expired session.",
    });
    return null;
  }

  if (user.accountLocked) {
    const users = db.collection(USERS_COLLECTION);
    await sendAccountLockNoticeIfNeeded(user, users);
    res.status(423).json({
      message: buildAccountLockedMessage(user),
      accountLocked: true,
    });
    return null;
  }

  return user;
}

function buildAccountLockedMessage(user) {
  const reason = String(user?.accountLockReason || "").trim();
  const guidance =
    "Check your email for the detailed notice with the reason, review steps, and the appeal process.";
  return reason
    ? `This account is locked. ${reason} ${guidance}`
    : `This account is locked. ${guidance}`;
}

function validateProfileInput(payload) {
  const errors = {};
  const firstName = normalizeName(payload?.firstName);
  const lastName = normalizeName(payload?.lastName);
  const phone = String(payload?.phone || "").trim();
  const campus = String(payload?.campus || "").trim();
  const language = String(payload?.language || "").trim();
  const studentId = String(payload?.studentId || "").trim();
  const bio = String(payload?.bio || "").trim();
  const receiveMatchEmails = payload?.receiveMatchEmails;

  validateNameField(firstName, "First name", errors, "firstName");
  validateNameField(lastName, "Last name", errors, "lastName");

  if (phone && !PHONE_REGEX.test(phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (campus && campus.length > PROFILE_TEXT_MAX_LENGTH) {
    errors.campus = `Campus must be ${PROFILE_TEXT_MAX_LENGTH} characters or fewer.`;
  }

  if (language && language.length > PROFILE_TEXT_MAX_LENGTH) {
    errors.language = `Language must be ${PROFILE_TEXT_MAX_LENGTH} characters or fewer.`;
  }

  if (studentId && studentId.length > PROFILE_ID_MAX_LENGTH) {
    errors.studentId = `Student ID must be ${PROFILE_ID_MAX_LENGTH} characters or fewer.`;
  }

  if (bio && bio.length > PROFILE_BIO_MAX_LENGTH) {
    errors.bio = `Bio must be ${PROFILE_BIO_MAX_LENGTH} characters or fewer.`;
  }

  return {
    firstName,
    lastName,
    phone,
    campus,
    language,
    studentId,
    bio,
    receiveMatchEmails: receiveMatchEmails !== false,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
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
      if (existingUser.emailVerified === false) {
        return res.status(409).json({
          message:
            "This email is already registered but not verified. Please check your inbox.",
          requiresEmailVerification: true,
          email,
        });
      }

      return res.status(409).json({
        message: "An account with this email already exists.",
        errors: {
          email: "Email already in use.",
        },
      });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const verificationToken = createToken();

    const insertResult = await users.insertOne({
      firstName,
      lastName,
      email,
      passwordHash,
      role: "user",
      emailVerified: false,
      accountLocked: false,
      accountLockNotificationSentAt: "",
      emailVerificationToken: verificationToken,
      emailVerificationTokenIssuedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    let emailSent = false;
    try {
      await sendVerificationEmail({
        to: email,
        token: verificationToken,
        firstName,
      });
      emailSent = true;
    } catch (error) {
      console.error("Verification email error:", error);
    }

    return res.status(201).json({
      message: emailSent
        ? "Account created. Please verify your email to continue."
        : "Account created. We could not send the verification email yet.",
      user: {
        id: insertResult.insertedId,
        firstName,
        lastName,
        email,
        role: "user",
        emailVerified: false,
      },
      requiresEmailVerification: true,
      emailSent,
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

    if (user.emailVerified === false) {
      return res.status(403).json({
        message: "Please verify your email before signing in.",
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    if (user.accountLocked) {
      const users = db.collection(USERS_COLLECTION);
      await sendAccountLockNoticeIfNeeded(user, users);
      return res.status(423).json({
        message: buildAccountLockedMessage(user),
        accountLocked: true,
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
      user: buildUserProfile(user),
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      message: "Unable to complete signin right now.",
    });
  }
});

authRouter.get("/verify-email", async (req, res) => {
  try {
    const token = String(req.query?.token || "").trim();

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required.",
      });
    }

    const db = getDatabase();
    const users = db.collection(USERS_COLLECTION);
    const user = await users.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(404).json({
        message: "This verification link is invalid.",
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        message: "Your email is already verified.",
      });
    }

    if (isVerificationExpired(user.emailVerificationTokenIssuedAt)) {
      return res.status(410).json({
        message:
          "This verification link has expired. Please request a new one.",
      });
    }

    const now = new Date().toISOString();
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
          emailVerifiedAt: now,
          updatedAt: now,
        },
        $unset: {
          emailVerificationToken: "",
          emailVerificationTokenIssuedAt: "",
        },
      },
    );

    return res.status(200).json({
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      message: "Unable to verify email right now.",
    });
  }
});

authRouter.post("/resend-verification", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "A valid email address is required.",
        errors: {
          email: "Enter a valid email address.",
        },
      });
    }

    const db = getDatabase();
    const users = db.collection(USERS_COLLECTION);
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account was found for that email.",
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        message: "Your email is already verified. Please sign in.",
      });
    }

    const verificationToken = createToken();
    const now = new Date().toISOString();

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerificationToken: verificationToken,
          emailVerificationTokenIssuedAt: now,
          updatedAt: now,
        },
      },
    );

    let emailSent = false;
    try {
      await sendVerificationEmail({
        to: email,
        token: verificationToken,
        firstName: user.firstName,
      });
      emailSent = true;
    } catch (error) {
      console.error("Resend verification email error:", error);
    }

    return res.status(200).json({
      message: emailSent
        ? "Verification email sent. Please check your inbox."
        : "We could not send the verification email yet. Please try again.",
      emailSent,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      message: "Unable to resend verification email right now.",
    });
  }
});

authRouter.get("/me", async (req, res) => {
  try {
    const user = await requireAuthenticatedUser(req, res);
    if (!user) return;

    return res.status(200).json({
      user: buildUserProfile(user),
    });
  } catch (error) {
    console.error("Load profile error:", error);
    return res.status(500).json({
      message: "Unable to load your profile right now.",
    });
  }
});

authRouter.patch("/me", async (req, res) => {
  try {
    const currentUser = await requireAuthenticatedUser(req, res);
    if (!currentUser) return;

    const {
      firstName,
      lastName,
      phone,
      campus,
      language,
      studentId,
      bio,
      receiveMatchEmails,
      errors,
      isValid,
    } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid profile details.",
        errors,
      });
    }

    const db = getDatabase();
    const users = db.collection(USERS_COLLECTION);
    const now = new Date().toISOString();

    await users.updateOne(
      { _id: currentUser._id },
      {
        $set: {
          firstName,
          lastName,
          phone,
          campus,
          language,
          studentId,
          bio,
          receiveMatchEmails,
          updatedAt: now,
        },
      },
    );

    const updatedUser = await users.findOne({ _id: currentUser._id });

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: buildUserProfile(updatedUser),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      message: "Unable to update your profile right now.",
    });
  }
});

authRouter.patch("/change-password", async (req, res) => {
  try {
    const currentUser = await requireAuthenticatedUser(req, res);
    if (!currentUser) return;

    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");
    const confirmPassword = String(req.body?.confirmPassword || "");
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password is required.";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Invalid password details.",
        errors,
      });
    }

    const passwordMatches = await verifyPassword(currentPassword, currentUser.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({
        message: "Current password is incorrect.",
        errors: {
          currentPassword: "Current password is incorrect.",
        },
      });
    }

    const passwordHash = await hashPassword(newPassword);
    const now = new Date().toISOString();

    const db = getDatabase();
    const users = db.collection(USERS_COLLECTION);

    await users.updateOne(
      { _id: currentUser._id },
      {
        $set: {
          passwordHash,
          updatedAt: now,
        },
        $unset: {
          passwordResetToken: "",
          passwordResetTokenIssuedAt: "",
        },
      },
    );

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      message: "Unable to update your password right now.",
    });
  }
});

authRouter.post("/request-password-reset", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "A valid email address is required.",
        errors: {
          email: "Enter a valid email address.",
        },
      });
    }

    const db = getDatabase();
    const users = db.collection(USERS_COLLECTION);
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists for that email, we sent password reset instructions.",
      });
    }

    const resetToken = createToken();
    const now = new Date().toISOString();

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetTokenIssuedAt: now,
          updatedAt: now,
        },
      },
    );

    let emailSent = false;
    try {
      await sendPasswordResetEmail({
        to: email,
        token: resetToken,
        firstName: user.firstName,
      });
      emailSent = true;
    } catch (error) {
      console.error("Password reset email error:", error);
    }

    return res.status(200).json({
      message: emailSent
        ? "Password reset instructions have been sent to your email."
        : "We could not send the password reset email yet. Please try again.",
      emailSent,
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({
      message: "Unable to request a password reset right now.",
    });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "");
    const confirmPassword = String(req.body?.confirmPassword || "");
    const errors = {};

    if (!token) {
      errors.token = "Reset token is required.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Invalid password reset details.",
        errors,
      });
    }

    const db = getDatabase();
    const users = db.collection(USERS_COLLECTION);
    const user = await users.findOne({ passwordResetToken: token });

    if (!user) {
      return res.status(404).json({
        message: "This reset link is invalid.",
      });
    }

    if (isPasswordResetExpired(user.passwordResetTokenIssuedAt)) {
      return res.status(410).json({
        message: "This reset link has expired. Please request a new one.",
      });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
          updatedAt: now,
        },
        $unset: {
          passwordResetToken: "",
          passwordResetTokenIssuedAt: "",
          authToken: "",
          authTokenIssuedAt: "",
        },
      },
    );

    return res.status(200).json({
      message: "Your password has been updated. You can sign in now.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      message: "Unable to reset your password right now.",
    });
  }
});

export default authRouter;
