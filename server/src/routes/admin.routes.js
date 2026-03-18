import PDFDocument from "pdfkit";
import { Router } from "express";
import { ObjectId } from "mongodb";

import { getDatabase } from "../db/client.js";

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
  doc.circle(x + 14, y + 14, 14).fill("#1aa68f");
  doc.fillColor("#ffffff").fontSize(12).font("Helvetica-Bold");
  doc.text("R", x + 9.2, y + 7.6, { width: 20, align: "center" });
  doc.restore();
}

function drawFooter(doc) {
  const { left, right, bottom } = doc.page.margins;
  const footerY = doc.page.height - bottom + 16;
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

function drawHeader(doc, title, metaLines = [], options = {}) {
  const { left, top, right } = doc.page.margins;
  const compact = Boolean(options.compact);
  const pageWidth = doc.page.width;
  const headerHeight = compact ? 58 : 86;
  const contentWidth = pageWidth - left - right;
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
  cursorY += compact ? 18 : 24;

  if (!compact && metaLines.length) {
    const metaBoxY = cursorY + 2;
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

  doc
    .moveTo(left, cursorY)
    .lineTo(pageWidth - right, cursorY)
    .lineWidth(1)
    .strokeColor("#e6dfd6")
    .stroke();

  return cursorY + 12;
}

function drawTable(doc, startY, columns, rows, options = {}) {
  const { left, right, bottom } = doc.page.margins;
  const pageWidth = doc.page.width - left - right;
  const rowHeight = 22;
  const headerHeight = 24;
  const footerSpace = 28;
  const maxY = doc.page.height - bottom - footerSpace;
  const title = options.title || "";
  const metaLines = options.metaLines || [];

  const columnWidths = columns.map((col) => Math.floor(pageWidth * col.width));

  function drawHeaderRow(y) {
    doc.rect(left, y, pageWidth, headerHeight).fill("#1d2b26");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);

    let x = left + 8;
    columns.forEach((col, index) => {
      doc.text(col.label, x, y + 7, {
        width: columnWidths[index] - 12,
        height: headerHeight - 10,
        align: "left",
        lineBreak: false,
        ellipsis: true,
      });
      x += columnWidths[index];
    });

    return y + headerHeight;
  }

  if (!rows.length) {
    drawHeaderRow(startY);
    drawFooter(doc);
    return startY + headerHeight;
  }

  let index = 0;
  let pageStartY = startY;

  while (index < rows.length) {
    const rowsPerPage = Math.max(
      1,
      Math.floor((maxY - pageStartY - headerHeight) / rowHeight),
    );

    let currentY = drawHeaderRow(pageStartY);
    doc.font("Helvetica").fontSize(9).fillColor("#1d2b26");

    let rowsOnPage = 0;
    while (rowsOnPage < rowsPerPage && index < rows.length) {
      const row = rows[index];

      if (rowsOnPage % 2 === 0) {
        doc.rect(left, currentY, pageWidth, rowHeight).fill("#fbfaf7");
        doc.fillColor("#1d2b26");
      }

      let x = left + 8;
      columns.forEach((col, colIndex) => {
        const value = row?.[col.key] ?? "";
        doc.text(String(value), x, currentY + 6, {
          width: columnWidths[colIndex] - 12,
          height: rowHeight - 8,
          align: "left",
          lineBreak: false,
          ellipsis: true,
        });
        x += columnWidths[colIndex];
      });

      doc
        .strokeColor("#efe8dd")
        .lineWidth(0.5)
        .moveTo(left, currentY + rowHeight)
        .lineTo(left + pageWidth, currentY + rowHeight)
        .stroke();

      currentY += rowHeight;
      index += 1;
      rowsOnPage += 1;
    }

    drawFooter(doc);

    if (index < rows.length) {
      doc.addPage();
      pageStartY = drawHeader(doc, title, metaLines, { compact: true });
    }
  }

  return pageStartY;
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
  drawTable(doc, tableStartY, columns, rows, { title, metaLines });
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
      .project({ firstName: 1, lastName: 1, email: 1, role: 1, createdAt: 1 })
      .toArray();

    res.status(200).json({
      users: users.map((user) => ({
        id: user._id?.toString?.() || String(user._id),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "user",
        createdAt: user.createdAt || "",
      })),
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
      user: {
        id: result.value._id?.toString?.() || String(result.value._id),
        firstName: result.value.firstName || "",
        lastName: result.value.lastName || "",
        email: result.value.email || "",
        role: result.value.role || "user",
      },
    });
  } catch (error) {
    console.error("Admin role update error:", error);
    return res.status(500).json({
      message: "Unable to update role right now.",
    });
  }
});

export default adminRouter;
