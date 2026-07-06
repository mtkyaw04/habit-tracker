require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");
const profileRoutes = require("./routes/profile");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", db: "unreachable", message: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/profile", profileRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Retry DB connection on boot since MySQL may still be starting up.
async function start() {
  let attempts = 0;
  while (attempts < 30) {
    try {
      await pool.query("SELECT 1");
      break;
    } catch {
      attempts += 1;
      console.log(`Waiting for MySQL... (${attempts}/30)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  app.listen(PORT, () => console.log(`Habit Tracker API listening on port ${PORT}`));
}

start();
