const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Otp = require("../models/Otp");

const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");

const twilioClient = require("../utils/twilio");

const router = express.Router();

/* ================= HELPER FUNCTION ================= */

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    permissions: user.permissions || []
  };
}

/* ================= REGISTER USER ================= */

router.post(
  "/register",
  verifyToken,
  allowRole(["super_admin"]),
  async (req, res) => {
    const { name, email, mobile, password, role } = req.body;

    try {
      const existingUser = await User.findOne({
        $or: [{ email }, { mobile }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        mobile,
        password: hashedPassword,
        role: role || "user",
        isActive: true
      });

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: formatUser(user)
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email, role }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: formatUser(user)
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ================= GET CURRENT USER ================= */

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: formatUser(user)
    });
  } catch (err) {
    console.error("GET ME ERROR:", err);

    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
});

/* ================= SEND OTP ================= */

router.post("/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        message: "Invalid mobile number"
      });
    }

    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(400).json({
        message: "Mobile already registered"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { mobile },
      {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
      },
      { upsert: true }
    );

    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WA_NUMBER}`,
      to: `whatsapp:+91${mobile}`,
      body: `Your SmartStore OTP is ${otp}. Valid for 5 minutes.`
    });

    res.json({
      message: "OTP sent on WhatsApp"
    });
  } catch (error) {
    console.error("WhatsApp OTP error:", error.message);

    res.status(500).json({
      message: "Failed to send OTP"
    });
  }
});

/* ================= VERIFY OTP & REGISTER ================= */

router.post("/verify-otp-register", async (req, res) => {
  try {
    const { name, email, mobile, password, otp, role } = req.body;

    if (!name || !email || !mobile || !password || !otp) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const otpDoc = await Otp.findOne({ mobile });

    if (!otpDoc) {
      return res.status(400).json({
        message: "OTP not found. Please resend OTP"
      });
    }

    if (otpDoc.expiresAt < Date.now()) {
      return res.status(400).json({
        message: "OTP expired. Please resend OTP"
      });
    }

    if (otpDoc.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: role || "user",
      isMobileVerified: true,
      isActive: true
    });

    await Otp.deleteOne({ mobile });

    res.json({
      success: true,
      message: "Registration successful",
      user: formatUser(user)
    });
  } catch (error) {
    console.error("Verify OTP Register error:", error.message);

    res.status(500).json({
      message: "Registration failed"
    });
  }
});

module.exports = router;