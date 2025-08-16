require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));

// connect mongo
connectDB();

// routes
app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "3FA API", ts: Date.now() });
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
