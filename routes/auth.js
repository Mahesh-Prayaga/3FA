const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const generateOTP = require("../utils/otp");
let otpStore = {};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    console.log("Register request body:", req.body);
    const { username, password, email } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ msg: "User or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    await newUser.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const otp = generateOTP();
    otpStore[user.username] = otp; // store OTP in memory (temporary)

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ msg: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify-otp", (req, res) => {
  const { username, otp } = req.body;

  if (!otpStore[username]) {
    return res.status(400).json({ msg: "No OTP found, please login first" });
  }

  if (otpStore[username] !== otp) {
    return res.status(400).json({ msg: "Invalid OTP" });
  }

  // ✅ OTP is valid
  delete otpStore[username]; // clear used OTP
  res.json({ msg: "OTP verified successfully, login complete" });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = router;
