const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    /* ================= MOBILE (NEW) ================= */
    mobile: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows existing users without mobile
      match: [/^[6-9]\d{9}$/, "Please add a valid mobile number"],
    },

    /* ================= AUTH ================= */
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },

    /* ================= ROLE & STATUS ================= */
    role: {
      type: String,
      enum: ["super_admin", "admin", "staff", "user"], // user = customer
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ================= RELATIONSHIPS ================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // super admin who created admin/staff
    },

    /* ================= PERMISSIONS ================= */
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_roles",
          "delete_data",
          "export_data",
          "view_reports",
        ],
      },
    ],

    /* ================= OTP / VERIFICATION ================= */
    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    /* ================= META ================= */
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);