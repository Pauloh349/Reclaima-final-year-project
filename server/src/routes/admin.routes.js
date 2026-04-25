import PDFDocument from "pdfkit";
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/client.js";
import { sendAccountStatusEmail } from "../services/email.js";

const adminRouter = Router();
const USERS_COLLECTION = "users";
const ITEMS_COLLECTION = "items";

async function requireAdmin(req, res, next) {
  try {
    const authHeader = String(req.headers.authorization || "");
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const db = getDatabase();
    const usersCollection = db.collection(USERS_COLLECTION);
    const adminUser = await usersCollection.findOne({ authToken: token });

    if (!adminUser) {
      return res.status(401).json({
        message: "Invalid or expired session.",
      });
    }

    if (adminUser.accountLocked) {
      return res.status(423).json({
        message:
          "This account is locked. Check your email for the detailed notice and appeal steps.",
        accountLocked: true,
      });
    }

    const isAdmin = adminUser.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.adminUser = {
      id: adminUser._id,
      email: adminUser.email,
    };

    return next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(500).json({
      message: "Unable to verify admin access right now.",
    });
  }
}

adminRouter.use(requireAdmin);

function clampDays(value, fallback = 30) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.floor(parsed), 1), 365);
}

function clampLimit(value, fallback = 25) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.floor(parsed), 1), 100);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildUserAdminPayload(user) {
  return {
    id: user._id?.toString?.() || String(user._id),
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    role: user.role || "user",
    createdAt: user.createdAt || "",
    accountLocked: user.accountLocked === true,
    accountLockReason: user.accountLockReason || "",
    accountLockedAt: user.accountLockedAt || "",
    accountLockedBy: user.accountLockedBy || "",
  };
}

function isoDateDaysAgo(days) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

function buildDateRange(days) {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  const keys = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    keys,
  };
}

function csvEscape(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toCsv(rows, headers) {
  const headerLine = headers.map((header) => csvEscape(header)).join(",");
  const lines = rows.map((row) =>
    headers.map((header) => csvEscape(row?.[header])).join(","),
  );
  return [headerLine, ...lines].join("\n");
}

function sendCsv(res, filename, rows, headers) {
  const csv = toCsv(rows, headers);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );
  res.status(200).send(csv);
}

function drawLogo(doc, x, y) {
  doc.save();
  doc.circle(x + 14, y + 14, 14).fill("#1aa68f");
  doc.fillColor("#ffffff").fontSize(12).font("Helvetica-Bold");
  doc.text("R", x + 9.2, y + 7.6, { width: 20, align: "center" });
  doc.restore();
}

function drawFooter(doc) {
  const { left, right, bottom } = doc.page.margins;
  const footerY = doc.page.height - bottom - 8;
  const contentWidth = doc.page.width - left - right;
  const pageNumber = doc.page.number || 1;

  doc.save();
  doc
    .strokeColor("#e6dfd6")
    .lineWidth(1)
    .moveTo(left, footerY - 8)
    .lineTo(doc.page.width - right, footerY - 8)
    .stroke();

  doc.fillColor("#8a9891").font("Helvetica").fontSize(8);
  doc.text("Reclaima Admin Report", left, footerY, {
    width: contentWidth,
    align: "left",
  });
  doc.text(`Page ${pageNumber}`, left, footerY, {
    width: contentWidth,
    align: "right",
  });
  doc.restore();
}

function drawReportPageHeader(doc, title, metaLines = [], options = {}) {
  const { left, right } = doc.page.margins;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - left - right;
  const compact = Boolean(options.compact);
  const headerHeight = compact ? 58 : 92;
  const generatedLine = metaLines.find((line) =>
    String(line).toLowerCase().startsWith("generated:"),
  );

  doc.save();
  doc.rect(0, 0, pageWidth, headerHeight).fill("#0f1d18");
  doc.rect(0, headerHeight - 4, pageWidth, 4).fill("#1aa68f");

  drawLogo(doc, left, 12);

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18);
  doc.text("Reclaima", left + 38, 18);

  doc.fillColor("#d7e2de").font("Helvetica").fontSize(10);
  doc.text("Admin Report", left + 38, 40);

  if (generatedLine) {
    doc.fillColor("#d7e2de").font("Helvetica").fontSize(9);
    doc.text(String(generatedLine), left, 22, {
      width: contentWidth,
      align: "right",
    });
  }
  doc.restore();

  let cursorY = headerHeight + 18;

  doc.fillColor("#1d2b26").font("Helvetica-Bold").fontSize(compact ? 14 : 18);
  doc.text(title, left, cursorY);
  cursorY += compact ? 12 : 18;

  if (!compact && metaLines.length) {
    const metaBoxY = cursorY + 4;
    const rows = Math.ceil(metaLines.length / 2);
    const metaBoxHeight = rows * 14 + 18;

    doc.save();
    doc.roundedRect(left, metaBoxY, contentWidth, metaBoxHeight, 8).fill("#f6f3ec");
    doc.restore();

    doc.fillColor("#51605a").font("Helvetica").fontSize(9);
    const colWidth = (contentWidth - 24) / 2;

    metaLines.forEach((line, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = left + 12 + column * colWidth;
      const y = metaBoxY + 10 + row * 14;
      doc.text(String(line), x, y, { width: colWidth - 8 });
    });

    cursorY = metaBoxY + metaBoxHeight + 10;
  }

  return cursorY;
}

function startReportPage(doc, title, metaLines, options = {}) {
  const cursorY = drawReportPageHeader(doc, title, metaLines, options);
  return cursorY;
}

function sendPdf(res, filename, title, metaLines, columns, rows) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );

  doc.pipe(res);

  const { left, right, bottom } = doc.page.margins;
  const pageWidth = doc.page.width - left - right;
  const contentBottom = doc.page.height - bottom;
  const titleStartY = startReportPage(doc, title, metaLines);
  const rowGap = 10;
  const rowBoxPadding = 10;
  const headerRowHeight = 24;

  doc.y = titleStartY;
  doc.x = left;

  function checkPageSpace(requiredHeight, label = "content") {
    if (doc.y + requiredHeight <= contentBottom) {
      return false;
    }

    drawFooter(doc);
    console.log(`[PDF] addPage for ${label}`);
    doc.addPage();
    doc.y = startReportPage(doc, title, metaLines, { compact: true });
    doc.x = left;
    return true;
  }

  if (rows.length === 0) {
    doc.font("Helvetica").fontSize(10).fillColor("#51605a");
    doc.text("No records available for this report.", left, doc.y + 10);
    drawFooter(doc);
    doc.end();
    return;
  }

  checkPageSpace(headerRowHeight + 8, "table header");
  const headerTop = doc.y + 4;
  doc.rect(left, headerTop, pageWidth, headerRowHeight).fill("#1d2b26");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
  let colX = left + 8;
  columns.forEach((col) => {
    const width = Math.floor(pageWidth * col.width);
    doc.text(col.label, colX, headerTop + 7, {
      width: width - 12,
      lineBreak: false,
      ellipsis: true,
    });
    colX += width;
  });
  doc.y = headerTop + headerRowHeight + 10;

  rows.forEach((row, rowIndex) => {
    const values = columns.map((col) => String(row?.[col.key] ?? ""));
    const rowHeight = Math.max(
      32,
      values.reduce((max, value, index) => {
        const width = Math.floor(pageWidth * columns[index].width) - 12;
        const height = doc.heightOfString(value, { width, align: "left" });
        return Math.max(max, height);
      }, 0) + rowBoxPadding * 2,
    );

    checkPageSpace(rowHeight + rowGap, `row ${rowIndex + 1}`);

    const rowTop = doc.y;

    if (rowIndex % 2 === 0) {
      doc.save();
      doc.roundedRect(left, rowTop, pageWidth, rowHeight, 8).fill("#fbfaf7");
      doc.restore();
    }

    let x = left + 8;
    values.forEach((value, index) => {
      const width = Math.floor(pageWidth * columns[index].width) - 12;
      doc.fillColor("#1d2b26").font("Helvetica").fontSize(9);
      doc.text(value, x, rowTop + rowBoxPadding, {
        width,
        align: "left",
        height: rowHeight - rowBoxPadding * 2,
        lineBreak: false,
        ellipsis: true,
      });
      x += Math.floor(pageWidth * columns[index].width);
    });

    doc
      .strokeColor("#efe8dd")
      .lineWidth(0.5)
      .moveTo(left, rowTop + rowHeight)
      .lineTo(left + pageWidth, rowTop + rowHeight)
      .stroke();

    doc.y = rowTop + rowHeight + rowGap;
    doc.x = left;
  });

  drawFooter(doc);

  doc.end();
}

function _sendItemsReportPdf(res, filename, title, metaLines, rows) {
  const doc = new PDFDocument({
    margin: 42,
    size: "A4",
    layout: "landscape",
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );

  doc.pipe(res);

  const { left, right, bottom } = doc.page.margins;
  const pageWidth = doc.page.width - left - right;
  const contentBottom = doc.page.height - bottom;
  const titleStartY = startReportPage(doc, title, metaLines);
  const cardGap = 12;
  const cardPadding = 12;
  const rowGap = 14;
  const columnGap = 12;
  const cardWidth = Math.floor((pageWidth - columnGap) / 2);
  const pillWidth = 74;
  const fieldGroupWidth = Math.floor((cardWidth - cardPadding * 2 - columnGap) / 2);

  const leftFields = [
    { label: "Reporter type", key: "reporterLabel" },
    { label: "Reporter", key: "reporterName" },
    { label: "Email", key: "reporterEmail" },
  ];

  const rightFields = [
    { label: "Type", key: "type" },
    { label: "Category", key: "category" },
    { label: "Location", key: "location" },
    { label: "Zone", key: "zone" },
    { label: "Status", key: "status" },
    { label: "Returned", key: "returned" },
    { label: "Return method", key: "returnMethod" },
    { label: "Returned at", key: "returnedAt" },
    { label: "Returned by", key: "returnedBy" },
  ];

  doc.y = titleStartY;
  doc.x = left;

  function checkPageSpace(requiredHeight, label = "content") {
    if (doc.y + requiredHeight <= contentBottom) {
      return false;
    }

    drawFooter(doc);
    console.log(`[PDF] addPage for ${label}`);
    doc.addPage();
    doc.y = startReportPage(doc, title, metaLines, { compact: true });
    doc.x = left;
    return true;
  }

  if (rows.length === 0) {
    doc.font("Helvetica").fontSize(10).fillColor("#51605a");
    doc.text("No records available for this report.", left, doc.y + 10);
    drawFooter(doc);
    doc.end();
    return;
  }

  function fieldBlockHeight(field, row, width) {
    const value = String(row?.[field.key] || "").trim() || "Not provided";
    const labelHeight = doc.heightOfString(field.label, {
      width,
      align: "left",
    });
    const valueHeight = doc.heightOfString(value, {
      width,
      align: "left",
    });
    return Math.max(14, labelHeight) + Math.max(16, valueHeight) + 7;
  }

  function measureColumnHeight(fields, row, width) {
    return fields.reduce((total, field) => total + fieldBlockHeight(field, row, width), 0);
  }

  function renderColumn(fields, row, x, y, width) {
    let cursorY = y;

    fields.forEach((field) => {
      const value = String(row?.[field.key] || "").trim() || "Not provided";
      const labelHeight = Math.max(
        14,
        doc.heightOfString(field.label, { width, align: "left" }),
      );
      const valueHeight = Math.max(
        16,
        doc.heightOfString(value, { width, align: "left" }),
      );

      doc.fillColor("#6f7f78").font("Helvetica-Bold").fontSize(8.3);
      doc.text(field.label, x, cursorY, {
        width,
        lineBreak: false,
        ellipsis: true,
      });

      doc.fillColor("#1d2b26").font("Helvetica").fontSize(8.9);
      doc.text(value, x, cursorY + labelHeight + 2, {
        width,
        lineBreak: true,
      });

      cursorY += Math.max(labelHeight + valueHeight + 5, 22);
    });

    return cursorY;
  }

  function renderCard(row, x, y) {
    const statusLabel = String(row.status || "").trim() || "open";
    const titleText = String(row.title || "Untitled report");
    const metaText = `${String(row.id || "").slice(0, 8)} • ${row.reporterLabel || "Reporter"} • ${row.returned === "Yes" ? "Returned" : "Open"}`;
    const noteText = String(row.returnedNote || "").trim();

    const leftHeight = measureColumnHeight(leftFields, row, fieldGroupWidth);
    const rightHeight = measureColumnHeight(rightFields, row, fieldGroupWidth);
    const noteHeight = noteText
      ? doc.heightOfString(noteText, { width: cardWidth - cardPadding * 2, align: "left" })
      : 0;

    const bodyHeight = Math.max(leftHeight, rightHeight) + (noteText ? noteHeight + 10 : 0);
    const cardHeight = cardPadding * 2 + 46 + bodyHeight + 12;

    doc.save();
    doc.roundedRect(x, y, cardWidth, cardHeight, 16).fill("#fffdf8");
    doc.restore();

    doc.save();
    doc.roundedRect(x, y, cardWidth, cardHeight, 16);
    doc.lineWidth(1).strokeColor("#eee3d4").stroke();
    doc.restore();

    const headerY = y + cardPadding;
    doc.fillColor("#1d2b26").font("Helvetica-Bold").fontSize(11.2);
    doc.text(titleText, x + cardPadding, headerY, {
      width: cardWidth - cardPadding * 2 - pillWidth - 8,
      lineBreak: false,
      ellipsis: true,
    });

    doc.save();
    doc.roundedRect(
      x + cardWidth - cardPadding - pillWidth,
      headerY - 1,
      pillWidth,
      18,
      9,
    );
    doc.fillColor(statusLabel === "returned" ? "#e3f3ef" : "#f6f3ec").fill();
    doc.restore();

    doc.fillColor(statusLabel === "returned" ? "#0f6f60" : "#8b6b2d")
      .font("Helvetica-Bold")
      .fontSize(8.2);
    doc.text(statusLabel.toUpperCase(), x + cardWidth - cardPadding - pillWidth + 2, headerY + 2, {
      width: pillWidth - 4,
      align: "center",
      lineBreak: false,
      ellipsis: true,
    });

    doc.fillColor("#8a9891").font("Helvetica").fontSize(8.1);
    doc.text(metaText, x + cardPadding, headerY + 18, {
      width: cardWidth - cardPadding * 2,
      lineBreak: false,
      ellipsis: true,
    });

    const columnsTop = headerY + 34;
    renderColumn(leftFields, row, x + cardPadding, columnsTop, fieldGroupWidth);
    renderColumn(
      rightFields,
      row,
      x + cardPadding + fieldGroupWidth + columnGap,
      columnsTop,
      fieldGroupWidth,
    );

    if (noteText) {
      doc.fillColor("#6f7f78").font("Helvetica-Bold").fontSize(8.1);
      doc.text("Resolution note", x + cardPadding, y + cardHeight - cardPadding - noteHeight - 12, {
        width: cardWidth - cardPadding * 2,
      });
      doc.fillColor("#1d2b26").font("Helvetica").fontSize(8.7);
      doc.text(noteText, x + cardPadding, y + cardHeight - cardPadding - noteHeight - 2, {
        width: cardWidth - cardPadding * 2,
      });
    }
  }

  for (let index = 0; index < rows.length; index += 2) {
    const leftRow = rows[index];
    const rightRow = rows[index + 1] || null;
    const leftEstimate = measureColumnHeight(leftFields, leftRow, fieldGroupWidth) +
      measureColumnHeight(rightFields, leftRow, fieldGroupWidth) +
      88;
    const rightEstimate = rightRow
      ? measureColumnHeight(leftFields, rightRow, fieldGroupWidth) +
        measureColumnHeight(rightFields, rightRow, fieldGroupWidth) +
        88
      : 0;
    const pairHeight = Math.max(leftEstimate, rightEstimate || leftEstimate);

    checkPageSpace(pairHeight + cardGap, `record pair ${Math.floor(index / 2) + 1}`);

    const rowTop = doc.y;
    renderCard(leftRow, left, rowTop);
    if (rightRow) {
      renderCard(rightRow, left + cardWidth + columnGap, rowTop);
    }

    doc.y = rowTop + pairHeight + rowGap;
    doc.x = left;
  }

  drawFooter(doc);
  doc.end();
}
adminRouter.get("/overview", async (_req, res) => {
  try {
    const db = getDatabase();
    const usersCollection = db.collection(USERS_COLLECTION);
    const itemsCollection = db.collection(ITEMS_COLLECTION);
    const last30DaysIso = isoDateDaysAgo(30);
    const last7DaysIso = isoDateDaysAgo(7);

    const [totalUsers, totalItems] = await Promise.all([
      usersCollection.countDocuments(),
      itemsCollection.countDocuments(),
    ]);

    const itemsByType = await itemsCollection
      .aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ])
      .toArray();

    const itemsByStatus = await itemsCollection
      .aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray();

    const newUsersLast30Days = await usersCollection.countDocuments({
      createdAt: { $gte: last30DaysIso },
    });

    const newItemsLast7Days = await itemsCollection.countDocuments({
      createdAt: { $gte: last7DaysIso },
    });

    const recentItems = await itemsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.status(200).json({
      totals: {
        users: totalUsers,
        items: totalItems,
      },
      itemsByType,
      itemsByStatus,
      activity: {
        newUsersLast30Days,
        newItemsLast7Days,
      },
      recentItems,
      matches: {
        total: 0,
        pending: 0,
        resolved: 0,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({
      message: "Unable to load admin overview right now.",
    });
  }
});

adminRouter.get("/reports/items", async (req, res) => {
  try {
    const db = getDatabase();
    const itemsCollection = db.collection(ITEMS_COLLECTION);
    const type = String(req.query?.type || "all").toLowerCase();
    const days = clampDays(req.query?.days, 90);
    const { startIso, endIso } = buildDateRange(days);
    const filter = { createdAt: { $gte: startIso, $lte: endIso } };

    if (type === "lost" || type === "found") {
      filter.type = type;
    }

    const items = await itemsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const rows = items.map((item) => ({
      id: item._id?.toString?.() || item._id,
      type: item.type || "",
      reporterLabel: item.type === "found" ? "Founder" : "Loser",
      reporterName: item.contactName || "",
      reporterEmail: item.contactEmail || "",
      reporterPhone: item.contactPhone || "",
      status: item.status || "",
      returned: item.status === "returned" ? "Yes" : "No",
      returnedAt: item.returnedAt || "",
      returnedBy: item.returnedBy || "",
      returnedNote: item.returnedNote || "",
      returnMethod: item.returnMethod || item.handoverMethod || "",
      title: item.title || "",
      category: item.category || "",
      location: item.location || "",
      zone: item.zone || "",
      createdAt: item.createdAt || "",
      updatedAt: item.updatedAt || "",
    }));

    const filename = `reclaima-items-${new Date().toISOString().slice(0, 10)}.csv`;
    return sendCsv(res, filename, rows, [
      "id",
      "type",
      "reporterLabel",
      "reporterName",
      "reporterEmail",
      "reporterPhone",
      "status",
      "returned",
      "returnedAt",
      "returnedBy",
      "returnedNote",
      "returnMethod",
      "title",
      "category",
      "location",
      "zone",
      "createdAt",
      "updatedAt",
    ]);
  } catch (error) {
    console.error("Items report error:", error);
    res.status(500).json({
      message: "Unable to generate items report right now.",
    });
  }
});

adminRouter.get("/reports/users", async (req, res) => {
  try {
    const db = getDatabase();
    const usersCollection = db.collection(USERS_COLLECTION);
    const days = clampDays(req.query?.days, 365);
    const { startIso, endIso } = buildDateRange(days);

    const users = await usersCollection
      .find({ createdAt: { $gte: startIso, $lte: endIso } })
      .sort({ createdAt: -1 })
      .toArray();

    const rows = users.map((user) => ({
      id: user._id?.toString?.() || user._id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      createdAt: user.createdAt || "",
    }));

    const format = String(req.query?.format || "").toLowerCase();

    if (format === "csv") {
      const filename = `reclaima-users-${new Date().toISOString().slice(0, 10)}.csv`;
      return sendCsv(res, filename, rows, [
        "id",
        "firstName",
        "lastName",
        "email",
        "createdAt",
      ]);
    }

    if (format === "pdf") {
      const filename = `reclaima-users-${new Date().toISOString().slice(0, 10)}.pdf`;
      const pdfRows = rows.map((row) => ({
        ...row,
        id: String(row.id || "").slice(0, 8),
      }));
      return sendPdf(
        res,
        filename,
        "Users Report",
        [
          `Generated: ${new Date().toISOString()}`,
          `Range: ${startIso} to ${endIso}`,
          `Total users: ${rows.length}`,
        ],
        [
          { key: "id", label: "ID", width: 0.14 },
          { key: "firstName", label: "First Name", width: 0.18 },
          { key: "lastName", label: "Last Name", width: 0.18 },
          { key: "email", label: "Email", width: 0.32 },
          { key: "createdAt", label: "Created", width: 0.18 },
        ],
        pdfRows,
      );
    }

    res.status(200).json({
      rangeDays: days,
      startDate: startIso,
      endDate: endIso,
      users: rows,
    });
  } catch (error) {
    console.error("Users report error:", error);
    res.status(500).json({
      message: "Unable to generate users report right now.",
    });
  }
});

adminRouter.get("/users", async (req, res) => {
  try {
    const db = getDatabase();
    const usersCollection = db.collection(USERS_COLLECTION);
    const rawQuery = String(req.query?.query || "").trim();
    const limit = clampLimit(req.query?.limit, 25);
    const filter = {};

    if (rawQuery) {
      const escaped = escapeRegex(rawQuery);
      filter.$or = [
        { email: { $regex: escaped, $options: "i" } },
        { firstName: { $regex: escaped, $options: "i" } },
        { lastName: { $regex: escaped, $options: "i" } },
      ];
    }

    const users = await usersCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .project({
        firstName: 1,
        lastName: 1,
        email: 1,
        role: 1,
        createdAt: 1,
        accountLocked: 1,
        accountLockReason: 1,
        accountLockedAt: 1,
        accountLockedBy: 1,
      })
      .toArray();

    res.status(200).json({
      users: users.map((user) => buildUserAdminPayload(user)),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({
      message: "Unable to load users right now.",
    });
  }
});

adminRouter.patch("/users/:id/role", async (req, res) => {
  try {
    const role = String(req.body?.role || "").toLowerCase();
    if (!role || (role !== "admin" && role !== "user")) {
      return res.status(400).json({
        message: "Role must be either admin or user.",
      });
    }

    const id = String(req.params?.id || "");
    const db = getDatabase();
    const usersCollection = db.collection(USERS_COLLECTION);

    const filter = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
      : { _id: id };

    const result = await usersCollection.findOneAndUpdate(
      filter,
      { $set: { role } },
      { returnDocument: "after" },
    );

    if (!result.value) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Role updated successfully.",
      user: buildUserAdminPayload(result.value),
    });
  } catch (error) {
    console.error("Admin role update error:", error);
    return res.status(500).json({
      message: "Unable to update role right now.",
    });
  }
});

adminRouter.patch("/users/:id/lock", async (req, res) => {
  try {
    const id = String(req.params?.id || "");
    const locked = Boolean(req.body?.locked);
    const reason = String(req.body?.reason || "").trim();
    const db = getDatabase();
    const usersCollection = db.collection(USERS_COLLECTION);

    const filter = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
      : { _id: id };

    const now = new Date().toISOString();
    const update = locked
      ? {
          $set: {
            accountLocked: true,
            accountLockReason: reason || "Misuse of the platform.",
            accountLockedAt: now,
            accountLockedBy: req.adminUser?.email || "",
            updatedAt: now,
          },
        }
      : {
          $set: {
            accountLocked: false,
            updatedAt: now,
          },
          $unset: {
            accountLockReason: "",
            accountLockedAt: "",
            accountLockedBy: "",
            accountLockNotificationSentAt: "",
          },
        };

    const result = await usersCollection.findOneAndUpdate(filter, update, {
      returnDocument: "after",
    });

    if (!result.value) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    let emailSent = false;
    try {
      await sendAccountStatusEmail({
        to: result.value.email,
        firstName: result.value.firstName,
        locked,
        reason: locked
          ? result.value.accountLockReason || reason || "Misuse of the platform."
          : "Account restored by moderation review.",
        lockedAt: locked
          ? result.value.accountLockedAt || now
          : result.value.updatedAt || now,
        adminEmail: req.adminUser?.email || "",
      });
      emailSent = true;
      if (locked) {
        await usersCollection.updateOne(
          { _id: result.value._id },
          {
            $set: {
              accountLockNotificationSentAt: now,
              updatedAt: now,
            },
          },
        );
      }
    } catch (error) {
      console.error("Account status email error:", error);
    }

    return res.status(200).json({
      message: locked
        ? "Account locked successfully."
        : "Account unlocked successfully.",
      user: buildUserAdminPayload(result.value),
      emailSent,
      emailMessage: emailSent
        ? "Account status email sent successfully."
        : "The account was updated, but the email could not be sent.",
    });
  } catch (error) {
    console.error("Admin lock update error:", error);
    return res.status(500).json({
      message: "Unable to update account lock right now.",
    });
  }
});

export default adminRouter;
