const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// register user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username & password required" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // save user
    const user = new User({ username, password: hashed });
    await user.save();

    res.json({ message: "user registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "registration failed" });
  }
});

module.exports = router;
