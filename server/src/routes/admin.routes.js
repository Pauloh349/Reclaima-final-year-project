import PDFDocument from "pdfkit";
import { Router } from "express";

import { getDatabase } from "../db/client.js";

const adminRouter = Router();
const USERS_COLLECTION = "users";
const ITEMS_COLLECTION = "items";

function clampDays(value, fallback = 30) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.floor(parsed), 1), 365);
}

function isoDateDaysAgo(days) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

function dateKeyFromIso(isoString) {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
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
  doc.circle(x + 12, y + 12, 12).fill("#1aa68f");
  doc.fillColor("#ffffff").fontSize(12).font("Helvetica-Bold");
  doc.text("R", x + 8.2, y + 5.8, { width: 20, align: "center" });
  doc.restore();
}

function drawHeader(doc, title, metaLines = []) {
  const { left, top, right } = doc.page.margins;
  const headerY = top - 8;

  drawLogo(doc, left, headerY + 6);

  doc.fillColor("#0f1d18").font("Helvetica-Bold").fontSize(20);
  doc.text("Reclaima", left + 34, headerY + 2);
  doc.fontSize(12).font("Helvetica").fillColor("#6c7b73");
  doc.text("Admin Report", left + 34, headerY + 26);

  doc.fontSize(18).font("Helvetica-Bold").fillColor("#1d2b26");
  doc.text(title, left, headerY + 56);

  doc.fontSize(10).font("Helvetica").fillColor("#51605a");
  let metaY = headerY + 80;
  metaLines.forEach((line) => {
    doc.text(line, left, metaY, { width: doc.page.width - left - right });
    metaY += 14;
  });

  doc.moveTo(left, metaY + 6)
    .lineTo(doc.page.width - right, metaY + 6)
    .lineWidth(1)
    .strokeColor("#e6dfd6")
    .stroke();

  return metaY + 16;
}

function drawTable(doc, startY, columns, rows) {
  const { left, right, bottom } = doc.page.margins;
  const pageWidth = doc.page.width - left - right;
  const rowHeight = 18;
  const headerHeight = 22;
  const maxY = doc.page.height - bottom;

  const columnWidths = columns.map((col) => Math.floor(pageWidth * col.width));

  function drawHeaderRow(y) {
    doc.rect(left, y, pageWidth, headerHeight).fill("#f2efe6");
    doc.fillColor("#0f1d18").font("Helvetica-Bold").fontSize(10);

    let x = left + 6;
    columns.forEach((col, index) => {
      doc.text(col.label, x, y + 6, {
        width: columnWidths[index] - 8,
        align: "left",
      });
      x += columnWidths[index];
    });

    return y + headerHeight;
  }

  let currentY = drawHeaderRow(startY);
  doc.font("Helvetica").fontSize(9).fillColor("#1d2b26");

  rows.forEach((row, rowIndex) => {
    if (currentY + rowHeight > maxY) {
      doc.addPage();
      currentY = drawHeaderRow(doc.page.margins.top);
    }

    if (rowIndex % 2 === 0) {
      doc.rect(left, currentY, pageWidth, rowHeight).fill("#fbfaf7");
      doc.fillColor("#1d2b26");
    }

    let x = left + 6;
    columns.forEach((col, index) => {
      const value = row?.[col.key] ?? "";
      doc.text(String(value), x, currentY + 4, {
        width: columnWidths[index] - 8,
        align: "left",
        ellipsis: true,
      });
      x += columnWidths[index];
    });

    currentY += rowHeight;
  });

  return currentY;
}

function sendPdf(res, filename, title, metaLines, columns, rows) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );

  doc.pipe(res);

  const tableStartY = drawHeader(doc, title, metaLines);
  drawTable(doc, tableStartY, columns, rows);

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

adminRouter.get("/reports/summary", async (req, res) => {
  try {
    const days = clampDays(req.query?.days, 30);
    const { startIso, endIso, keys } = buildDateRange(days);

    const db = getDatabase();
    const usersCollection = db.collection(USERS_COLLECTION);
    const itemsCollection = db.collection(ITEMS_COLLECTION);

    const [items, users] = await Promise.all([
      itemsCollection
        .find({ createdAt: { $gte: startIso, $lte: endIso } })
        .project({ type: 1, createdAt: 1 })
        .toArray(),
      usersCollection
        .find({ createdAt: { $gte: startIso, $lte: endIso } })
        .project({ createdAt: 1 })
        .toArray(),
    ]);

    const dayMap = new Map();
    keys.forEach((key) => {
      dayMap.set(key, {
        date: key,
        lostCount: 0,
        foundCount: 0,
        totalItems: 0,
        newUsers: 0,
      });
    });

    items.forEach((item) => {
      const key = dateKeyFromIso(item.createdAt);
      if (!key || !dayMap.has(key)) return;
      const entry = dayMap.get(key);
      if (item.type === "lost") {
        entry.lostCount += 1;
      } else if (item.type === "found") {
        entry.foundCount += 1;
      }
      entry.totalItems += 1;
    });

    users.forEach((user) => {
      const key = dateKeyFromIso(user.createdAt);
      if (!key || !dayMap.has(key)) return;
      dayMap.get(key).newUsers += 1;
    });

    const rows = Array.from(dayMap.values());
    const format = String(req.query?.format || "").toLowerCase();

    if (format === "csv") {
      const filename = `reclaima-summary-${new Date().toISOString().slice(0, 10)}.csv`;
      return sendCsv(res, filename, rows, [
        "date",
        "lostCount",
        "foundCount",
        "totalItems",
        "newUsers",
      ]);
    }

    if (format === "pdf") {
      const filename = `reclaima-summary-${new Date().toISOString().slice(0, 10)}.pdf`;
      const totalItems = rows.reduce((sum, row) => sum + row.totalItems, 0);
      const totalUsers = rows.reduce((sum, row) => sum + row.newUsers, 0);
      return sendPdf(
        res,
        filename,
        "Summary Report",
        [
          `Generated: ${new Date().toISOString()}`,
          `Range: ${startIso} to ${endIso}`,
          `Total items: ${totalItems} | New users: ${totalUsers}`,
        ],
        [
          { key: "date", label: "Date", width: 0.22 },
          { key: "lostCount", label: "Lost", width: 0.18 },
          { key: "foundCount", label: "Found", width: 0.18 },
          { key: "totalItems", label: "Total", width: 0.2 },
          { key: "newUsers", label: "New Users", width: 0.22 },
        ],
        rows,
      );
    }

    res.status(200).json({
      rangeDays: days,
      startDate: startIso,
      endDate: endIso,
      rows,
    });
  } catch (error) {
    console.error("Summary report error:", error);
    res.status(500).json({
      message: "Unable to generate summary report right now.",
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
      status: item.status || "",
      title: item.title || "",
      category: item.category || "",
      location: item.location || "",
      zone: item.zone || "",
      createdAt: item.createdAt || "",
    }));

    const format = String(req.query?.format || "").toLowerCase();

    if (format === "csv") {
      const filename = `reclaima-items-${new Date().toISOString().slice(0, 10)}.csv`;
      return sendCsv(res, filename, rows, [
        "id",
        "type",
        "status",
        "title",
        "category",
        "location",
        "zone",
        "createdAt",
      ]);
    }

    if (format === "pdf") {
      const filename = `reclaima-items-${new Date().toISOString().slice(0, 10)}.pdf`;
      const pdfRows = rows.map((row) => ({
        ...row,
        id: String(row.id || "").slice(0, 8),
      }));
      return sendPdf(
        res,
        filename,
        "Items Report",
        [
          `Generated: ${new Date().toISOString()}`,
          `Range: ${startIso} to ${endIso}`,
          `Filter: type=${type}, total=${rows.length}`,
        ],
        [
          { key: "id", label: "ID", width: 0.12 },
          { key: "type", label: "Type", width: 0.1 },
          { key: "status", label: "Status", width: 0.1 },
          { key: "title", label: "Title", width: 0.2 },
          { key: "category", label: "Category", width: 0.14 },
          { key: "location", label: "Location", width: 0.17 },
          { key: "createdAt", label: "Created", width: 0.17 },
        ],
        pdfRows,
      );
    }

    res.status(200).json({
      rangeDays: days,
      startDate: startIso,
      endDate: endIso,
      items: rows,
    });
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

export default adminRouter;
