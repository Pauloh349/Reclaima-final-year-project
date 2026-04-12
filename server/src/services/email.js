import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let cachedTransporter;

function buildTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: env.smtpUser
      ? {
          user: env.smtpUser,
          pass: env.smtpPass,
        }
      : undefined,
  });

  return cachedTransporter;
}

function buildVerificationEmail({ to, token, firstName }) {
  const verifyUrl = `${env.appBaseUrl}/verify-email?token=${encodeURIComponent(
    token,
  )}`;
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";
  const subject = "Verify your Reclaima email";
  const text = `${greeting}\n\nThanks for joining Reclaima. Please verify your email address by visiting the link below:\n${verifyUrl}\n\nIf you did not create this account, you can ignore this email.`;
  const html = `
    <div style="background:#f6f9fc;padding:24px;font-family: Arial, sans-serif;color:#1f2933;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6eef9;">
        <div style="padding:20px 24px;background:linear-gradient(90deg,#eef6ff,#ffffff);">
          <div style="font-size:18px;font-weight:700;color:#0f1720;">Reclaima</div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;">${greeting}</p>
          <p style="margin:0 0 18px;line-height:1.5;color:#334155;">Thanks for creating an account with Reclaima. Please verify your email address to activate your account and start using the app.</p>

          <p style="text-align:center;margin:10px 0 18px;">
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#1f7aec;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
              Verify my email
            </a>
          </p>

          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break:break-all;font-size:13px;color:#0f1720;margin:0 0 18px;">${verifyUrl}</p>

          <p style="font-size:13px;color:#64748b;margin:0;">If you did not create this account, you can safely ignore this email.</p>
        </div>
        <div style="padding:14px 24px;background:#fbfdff;border-top:1px solid #eef2ff;color:#94a3b8;font-size:12px;">
          <div>Reclaima • Helping you recover lost items</div>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

function formatValue(value, fallback = "Not provided") {
  const trimmed = String(value || "").trim();
  return trimmed || fallback;
}

function buildMatchEmail({ to, lostItem, foundItem }) {
  const foundTitle = formatValue(foundItem?.title, "Found item");
  const lostTitle = formatValue(lostItem?.title, "Your lost item");
  const foundLocation = formatValue(foundItem?.location || foundItem?.zone);
  const foundCategory = formatValue(foundItem?.category);
  const foundDescription = formatValue(foundItem?.description);
  const foundContact = formatValue(
    foundItem?.contactName || foundItem?.contactEmail,
  );
  const foundDate = formatValue(foundItem?.createdAt);
  const itemId = foundItem?._id?.toString?.() || foundItem?.id || "";
  const itemUrl = itemId ? `${env.appBaseUrl}/item/${itemId}` : env.appBaseUrl;

  const subject = `Possible match found for ${lostTitle}`;
  const text = `Hello,\n\nWe found a possible match for your lost item (${lostTitle}).\n\nFound item details:\n- Title: ${foundTitle}\n- Category: ${foundCategory}\n- Location/Zone: ${foundLocation}\n- Reported by: ${foundContact}\n- Reported at: ${foundDate}\n- Description: ${foundDescription}\n\nView details: ${itemUrl}\n\nPlease verify the match and contact the reporter if this is yours.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2933;">
      <h2 style="margin: 0 0 12px;">Possible Match Found</h2>
      <p>We found a possible match for your lost item:</p>
      <p style="font-size: 16px; font-weight: 600;">${lostTitle}</p>
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #f8fafc;">
        <h3 style="margin-top: 0;">Found Item Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; width: 140px; color: #52606d;">Title</td><td style="padding: 6px 0;">${foundTitle}</td></tr>
          <tr><td style="padding: 6px 0; color: #52606d;">Category</td><td style="padding: 6px 0;">${foundCategory}</td></tr>
          <tr><td style="padding: 6px 0; color: #52606d;">Location/Zone</td><td style="padding: 6px 0;">${foundLocation}</td></tr>
          <tr><td style="padding: 6px 0; color: #52606d;">Reported by</td><td style="padding: 6px 0;">${foundContact}</td></tr>
          <tr><td style="padding: 6px 0; color: #52606d;">Reported at</td><td style="padding: 6px 0;">${foundDate}</td></tr>
          <tr><td style="padding: 6px 0; color: #52606d;">Description</td><td style="padding: 6px 0;">${foundDescription}</td></tr>
        </table>
      </div>
      <p style="margin: 16px 0;">
        <a href="${itemUrl}" style="display: inline-block; padding: 10px 16px; background: #1f7aec; color: #fff; text-decoration: none; border-radius: 8px;">
          View item details
        </a>
      </p>
      <p>Please verify the details before making contact. If this is not your item, you can ignore this email.</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendVerificationEmail({ to, token, firstName }) {
  const transporter = buildTransporter();
  const { subject, text, html } = buildVerificationEmail({
    to,
    token,
    firstName,
  });

  return transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
  });
}

export async function sendMatchEmail({ to, lostItem, foundItem }) {
  const transporter = buildTransporter();
  const { subject, text, html } = buildMatchEmail({
    to,
    lostItem,
    foundItem,
  });

  return transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
  });
}
