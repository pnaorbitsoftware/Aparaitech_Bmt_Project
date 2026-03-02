const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");

const router = express.Router();


const Otp = require("../models/Otp");
const twilioClient = require("../utils/twilio");

router.post("/register", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      isActive: true
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id, // MongoDB uses _id, not id
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ✅ LOGIN ROUTE (updated for MongoDB)
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Find user in MongoDB
    const user = await User.findOne({ email, role }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ✅ GET CURRENT USER ROUTE
router.get("/me", async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("GET ME ERROR:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});
router.post("/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: "Mobile already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { mobile },
      { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
      { upsert: true }
    );

    // 🔥 WHATSAPP OTP VIA TWILIO
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WA_NUMBER}`,
      to: `whatsapp:+91${mobile}`,
      body: `Your SmartStore OTP is ${otp}. Valid for 5 minutes.`,
    });

    res.json({ message: "OTP sent on WhatsApp" });
  } catch (error) {
    console.error("❌ WhatsApp OTP error:", error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});
/* ================= VERIFY OTP & REGISTER ================= */
router.post("/verify-otp-register", async (req, res) => {
  try {
    const { name, email, mobile, password, otp, role } = req.body;

    if (!name || !email || !mobile || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find OTP
    const otpDoc = await Otp.findOne({ mobile });

    if (!otpDoc) {
      return res.status(400).json({ message: "OTP not found. Please resend OTP" });
    }

    if (otpDoc.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please resend OTP" });
    }

    if (otpDoc.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: role || "user",
      isMobileVerified: true,
    });

    // Delete OTP after successful registration
    await Otp.deleteOne({ mobile });

    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("❌ Verify OTP Register error:", error.message);
    res.status(500).json({ message: "Registration failed" });
  }
});

module.exports = router;


