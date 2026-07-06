const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../db/pool");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

function toProfile(row) {
  return { username: row.username, email: row.email, avatar: row.avatar, theme: row.theme };
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (id, username, email, password_hash, avatar, theme) VALUES (?, ?, ?, ?, ?, ?)",
      [id, username, email, passwordHash, "🌸", "light"],
    );

    const token = signToken(id);
    res.status(201).json({ token, profile: { username, email, avatar: "🌸", theme: "light" } });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ error: "Failed to register" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken(user.id);
    res.json({ token, profile: toProfile(user) });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

module.exports = router;
