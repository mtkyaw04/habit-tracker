const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function toProfile(row) {
  return { username: row.username, email: row.email, avatar: row.avatar, theme: row.theme };
}

router.get("/", requireAuth, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
  if (rows.length === 0) return res.status(404).json({ error: "User not found" });
  res.json(toProfile(rows[0]));
});

router.patch("/", requireAuth, async (req, res) => {
  const { username, email, avatar, theme } = req.body || {};
  const fields = [];
  const values = [];
  if (username !== undefined) { fields.push("username = ?"); values.push(username); }
  if (email !== undefined) { fields.push("email = ?"); values.push(email); }
  if (avatar !== undefined) { fields.push("avatar = ?"); values.push(avatar); }
  if (theme !== undefined) { fields.push("theme = ?"); values.push(theme); }

  if (fields.length > 0) {
    values.push(req.userId);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
  res.json(toProfile(rows[0]));
});

module.exports = router;
