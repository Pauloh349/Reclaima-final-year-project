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

function extractEmailAddress(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const match = trimmed.match(/<([^>]+)>/);
  return (match ? match[1] : trimmed).trim();
}

function extractDisplayName(value, fallback = "Reclaima") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return fallback;
  const match = trimmed.match(/^([^<]+)</);
  return (match ? match[1] : trimmed).trim() || fallback;
}

function getMailFrom() {
  const fromAddress = extractEmailAddress(env.emailFrom);
  const displayName = extractDisplayName(env.emailFrom);
  const senderAddress = extractEmailAddress(env.smtpUser);

  if (senderAddress) {
    return {
      name: displayName,
      address: senderAddress,
    };
  }

  return {
    name: displayName,
    address: fromAddress || "no-reply@example.com",
  };
}

function buildVerificationEmail({ token, firstName }) {
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

function buildPasswordResetEmail({ token, firstName }) {
  const resetUrl = `${env.appBaseUrl}/reset-password?token=${encodeURIComponent(
    token,
  )}`;
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";
  const subject = "Reset your Reclaima password";
  const text = `${greeting}\n\nWe received a request to reset your Reclaima password. You can create a new password by visiting the link below:\n${resetUrl}\n\nIf you did not request this reset, you can ignore this email and your password will stay the same.`;
  const html = `
    <div style="background:#f6f9fc;padding:24px;font-family: Arial, sans-serif;color:#1f2933;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6eef9;">
        <div style="padding:20px 24px;background:linear-gradient(90deg,#eef6ff,#ffffff);">
          <div style="font-size:18px;font-weight:700;color:#0f1720;">Reclaima</div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;">${greeting}</p>
          <p style="margin:0 0 18px;line-height:1.5;color:#334155;">We received a request to reset your password. If this was you, use the button below to choose a new password.</p>

          <p style="text-align:center;margin:10px 0 18px;">
            <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#1f7aec;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
              Reset my password
            </a>
          </p>

          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break:break-all;font-size:13px;color:#0f1720;margin:0 0 18px;">${resetUrl}</p>

          <p style="font-size:13px;color:#64748b;margin:0;">If you did not request this reset, you can safely ignore this email.</p>
        </div>
        <div style="padding:14px 24px;background:#fbfdff;border-top:1px solid #eef2ff;color:#94a3b8;font-size:12px;">
          <div>Reclaima • Helping you recover lost items</div>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildAccountStatusEmail({
  firstName,
  locked,
  reason,
  lockedAt,
  adminEmail,
}) {
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";
  const helpUrl = `${env.appBaseUrl}/help`;
  const supportLine = adminEmail
    ? `If you believe this is a mistake, reply to this email or contact the Reclaima team through the Help Center.`
    : `If you believe this is a mistake, contact the Reclaima team through the Help Center.`;
  const statusLine = locked
    ? "Your account has been temporarily locked or restricted."
    : "Your account has been unlocked and access has been restored.";
  const subject = locked
    ? "Your Reclaima account has been locked"
    : "Your Reclaima account has been unlocked";
  const safeReason = escapeHtml(reason || "Misuse of the platform.");
  const safeLockedAt = lockedAt
    ? new Date(lockedAt).toLocaleString()
    : "Not available";
  const safeAdminEmail = escapeHtml(adminEmail || "Reclaima moderation");
  const nextSteps = locked
    ? [
        "Review the reason carefully so you understand what triggered the moderation action.",
        "If the issue is something you can resolve, reply to this email with a short explanation and any evidence that helps us review the case.",
        "Include the email address on the account and, if relevant, your student or staff ID so the team can identify the account faster.",
        `You can also open the Help Center here: ${helpUrl}`,
        "Once the review is approved, the account can be unlocked and full access restored.",
      ]
    : [
        "You can now sign back in normally using your usual email and password.",
        "If you still see any access issues, visit the Help Center and contact the team with your account email.",
      ];

  const text = `${greeting}\n\n${statusLine}\n\nReason: ${reason || "Misuse of the platform."}\nLocked at: ${lockedAt || "Not available"}\nModeration contact: ${adminEmail || "Reclaima moderation"}\n\nWhat to do next:\n${nextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\n${supportLine}\nHelp Center: ${helpUrl}\n\nIf you did not expect this message, please ignore it.`;

  const html = `
    <div style="background:#f6f9fc;padding:24px;font-family: Arial, sans-serif;color:#1f2933;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6eef9;">
        <div style="padding:20px 24px;background:linear-gradient(90deg,#0f1d18,#16342d);color:#ffffff;">
          <div style="font-size:18px;font-weight:700;">Reclaima</div>
          <div style="font-size:12px;opacity:0.85;margin-top:4px;">Account status notice</div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 18px;line-height:1.6;color:#334155;">${escapeHtml(statusLine)}</p>

          <div style="background:#f9f5ef;border:1px solid #efe5d8;border-radius:12px;padding:16px;margin:0 0 18px;">
            <div style="font-size:13px;color:#64748b;margin-bottom:8px;">Moderation details</div>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:6px 0;color:#52606d;width:160px;">Status</td>
                <td style="padding:6px 0;font-weight:600;color:#1d2b26;">${locked ? "Locked / Restricted" : "Unlocked"}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#52606d;">Reason</td>
                <td style="padding:6px 0;">${safeReason}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#52606d;">${locked ? "Locked at" : "Unlocked at"}</td>
                <td style="padding:6px 0;">${escapeHtml(safeLockedAt)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#52606d;">Moderation contact</td>
                <td style="padding:6px 0;">${safeAdminEmail}</td>
              </tr>
            </table>
          </div>

          ${
            locked
              ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:0 0 18px;">
                  <div style="font-weight:700;color:#9a3412;margin-bottom:8px;">How to request an unlock</div>
                  <ol style="margin:0;padding-left:20px;color:#334155;line-height:1.7;">
                    ${nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                  </ol>
                </div>`
              : `<div style="background:#ecfdf5;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 18px;">
                  <div style="font-weight:700;color:#166534;margin-bottom:8px;">What happens next</div>
                  <ul style="margin:0;padding-left:20px;color:#334155;line-height:1.7;">
                    ${nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                  </ul>
                </div>`
          }

          <p style="margin:0 0 8px;line-height:1.6;color:#334155;">${escapeHtml(supportLine)}</p>
          <p style="margin:0 0 18px;font-size:13px;color:#64748b;">Help Center: <a href="${helpUrl}" style="color:#1f7aec;text-decoration:none;">${helpUrl}</a></p>

          <p style="font-size:13px;color:#64748b;margin:0;">If you did not expect this message, you can safely ignore it.</p>
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

function buildMatchEmail({ lostItem, foundItem }) {
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

function buildAccountDeletionRequestEmail({
  firstName,
  lastName,
  email,
  reason,
}) {
  const subject = `Account deletion request for ${email}`;
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const greeting = displayName ? `Hello Reclaima team,\n\n${displayName} (${email}) has requested account deletion.` : `Hello Reclaima team,\n\n${email} has requested account deletion.`;
  const safeReason = formatValue(reason, "No reason provided.");
  const text = `${greeting}\n\nRequest details:\n- Name: ${formatValue(displayName)}\n- Email: ${email}\n- Reason: ${safeReason}\n\nPlease review and delete the account if it meets your verification process.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2933;">
      <h2 style="margin: 0 0 12px;">Account Deletion Request</h2>
      <p>${escapeHtml(greeting)}</p>
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #f8fafc;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; width: 140px; color: #52606d;">Name</td><td style="padding: 6px 0;">${escapeHtml(formatValue(displayName))}</td></tr>
          <tr><td style="padding: 6px 0; color: #52606d;">Email</td><td style="padding: 6px 0;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding: 6px 0; color: #52606d;">Reason</td><td style="padding: 6px 0;">${escapeHtml(safeReason)}</td></tr>
        </table>
      </div>
      <p style="margin: 16px 0 0;">Please review and delete the account if it meets your verification process.</p>
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
    from: getMailFrom(),
    to,
    subject,
    text,
    html,
  });
}

export async function sendPasswordResetEmail({ to, token, firstName }) {
  const transporter = buildTransporter();
  const { subject, text, html } = buildPasswordResetEmail({
    to,
    token,
    firstName,
  });

  return transporter.sendMail({
    from: getMailFrom(),
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
    from: getMailFrom(),
    to,
    subject,
    text,
    html,
  });
}

export async function sendAccountDeletionRequestEmail({
  to,
  firstName,
  lastName,
  email,
  reason,
}) {
  const transporter = buildTransporter();
  const { subject, text, html } = buildAccountDeletionRequestEmail({
    firstName,
    lastName,
    email,
    reason,
  });

  return transporter.sendMail({
    from: getMailFrom(),
    to,
    subject,
    text,
    html,
    replyTo: email || env.emailFrom,
  });
}

export async function sendAccountStatusEmail({
  to,
  firstName,
  locked,
  reason,
  lockedAt,
  adminEmail,
}) {
  const transporter = buildTransporter();
  const { subject, text, html } = buildAccountStatusEmail({
    firstName,
    locked,
    reason,
    lockedAt,
    adminEmail,
  });

  return transporter.sendMail({
    from: getMailFrom(),
    to,
    subject,
    text,
    html,
    replyTo: adminEmail || env.emailFrom,
  });
}
