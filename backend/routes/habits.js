const express = require("express");
const crypto = require("crypto");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function normalizeWeekDays(value) {
if (value == null) return undefined;

// MySQL JSON may come back as an array, object, or string depending on driver/config
let parsed = value;
if (typeof value === "string") {
try {
parsed = JSON.parse(value);
} catch {
return undefined;
}
}

if (!Array.isArray(parsed)) return undefined;

return [...new Set(parsed.map(Number))]
.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
.sort((a, b) => a - b);
}

async function loadHabit(habitId, userId) {
const [rows] = await pool.query(
"SELECT * FROM habits WHERE id = ? AND user_id = ?",
[habitId, userId],
);
if (rows.length === 0) return null;

const [completions] = await pool.query(
"SELECT date FROM habit_completions WHERE habit_id = ? ORDER BY date ASC",
[habitId],
);

return toHabit(rows[0], completions.map((c) => c.date));
}

function toHabit(row, completions) {
return {
id: row.id,
name: row.name,
description: row.description || undefined,
category: row.category,
frequency: row.frequency,
weekDays: normalizeWeekDays(row.week_days),
reminder: row.reminder || undefined,
color: row.color,
createdAt: row.created_at,
completions,
};
}

// GET /api/habits — list all habits (with completions) for the logged-in user
router.get("/", async (req, res) => {
const [habitRows] = await pool.query(
"SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC",
[req.userId],
);
if (habitRows.length === 0) return res.json([]);

const ids = habitRows.map((h) => h.id);
const [completionRows] = await pool.query(
`SELECT habit_id, date
     FROM habit_completions
     WHERE habit_id IN (${ids.map(() => "?").join(",")})`,
ids,
);

const byHabit = new Map();
for (const c of completionRows) {
if (!byHabit.has(c.habit_id)) byHabit.set(c.habit_id, []);
byHabit.get(c.habit_id).push(c.date);
}

res.json(habitRows.map((row) => toHabit(row, (byHabit.get(row.id) || []).sort())));
});

// POST /api/habits — create a habit
router.post("/", async (req, res) => {
const { name, description, category, frequency, weekDays, reminder, color } = req.body || {};

if (!name || !category || !frequency) {
return res.status(400).json({ error: "name, category and frequency are required" });
}

const normalizedWeekDays = normalizeWeekDays(weekDays);

if (frequency === "weekly" && (!normalizedWeekDays || normalizedWeekDays.length === 0)) {
return res.status(400).json({ error: "weekDays is required for weekly habits" });
}

const id = crypto.randomUUID();

await pool.query(
`INSERT INTO habits (
      id, user_id, name, description, category, frequency, week_days, reminder, color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
[
id,
req.userId,
name,
description || null,
category,
frequency,
frequency === "weekly" ? JSON.stringify(normalizedWeekDays) : null,
reminder || null,
color || "pink",
],
);

const habit = await loadHabit(id, req.userId);
res.status(201).json(habit);
});

// PATCH /api/habits/:id — update a habit
router.patch("/:id", async (req, res) => {
const existing = await loadHabit(req.params.id, req.userId);
if (!existing) return res.status(404).json({ error: "Habit not found" });

const { name, description, category, frequency, weekDays, reminder, color } = req.body || {};

const nextFrequency = frequency ?? existing.frequency;
const nextWeekDays =
weekDays !== undefined ? normalizeWeekDays(weekDays) : existing.weekDays;

if (nextFrequency === "weekly" && (!nextWeekDays || nextWeekDays.length === 0)) {
return res.status(400).json({ error: "weekDays is required for weekly habits" });
}

const fields = [];
const values = [];

if (name !== undefined) {
fields.push("name = ?");
values.push(name);
}
if (description !== undefined) {
fields.push("description = ?");
values.push(description || null);
}
if (category !== undefined) {
fields.push("category = ?");
values.push(category);
}
if (frequency !== undefined) {
fields.push("frequency = ?");
values.push(frequency);
}
if (weekDays !== undefined || frequency !== undefined) {
fields.push("week_days = ?");
values.push(nextFrequency === "weekly" ? JSON.stringify(nextWeekDays) : null);
}
if (reminder !== undefined) {
fields.push("reminder = ?");
values.push(reminder || null);
}
if (color !== undefined) {
fields.push("color = ?");
values.push(color);
}

if (fields.length > 0) {
values.push(req.params.id, req.userId);
await pool.query(
`UPDATE habits SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
values,
);
}

const habit = await loadHabit(req.params.id, req.userId);
res.json(habit);
});

// DELETE /api/habits/:id
router.delete("/:id", async (req, res) => {
const [result] = await pool.query(
"DELETE FROM habits WHERE id = ? AND user_id = ?",
[req.params.id, req.userId],
);

if (result.affectedRows === 0) {
return res.status(404).json({ error: "Habit not found" });
}

res.status(204).end();
});

// POST /api/habits/:id/toggle — toggle completion for a given date (defaults to today)
router.post("/:id/toggle", async (req, res) => {
const existing = await loadHabit(req.params.id, req.userId);
if (!existing) return res.status(404).json({ error: "Habit not found" });

const date = (req.body && req.body.date) || new Date().toISOString().slice(0, 10);
const alreadyDone = existing.completions.includes(date);

if (alreadyDone) {
await pool.query(
"DELETE FROM habit_completions WHERE habit_id = ? AND date = ?",
[req.params.id, date],
);
} else {
await pool.query(
"INSERT IGNORE INTO habit_completions (habit_id, date) VALUES (?, ?)",
[req.params.id, date],
);
}

const habit = await loadHabit(req.params.id, req.userId);
res.json(habit);
});

module.exports = router;
