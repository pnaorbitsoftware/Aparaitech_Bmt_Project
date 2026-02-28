const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");

// ==================== PROFILE ROUTES (any authenticated user) ====================
router.get("/profile", verifyToken, userController.getProfile);
router.put("/profile", verifyToken, userController.updateProfile);

// ==================== GENERAL USER MANAGEMENT (super_admin only) ====================
router.get(
  "/",
  verifyToken,
  allowRole(["super_admin"]),
  userController.getAllUsers
);

router.post(
  "/",
  verifyToken,
  allowRole(["super_admin"]),
  userController.createUser
);

router.put(
  "/:id",
  verifyToken,
  allowRole(["super_admin"]),
  userController.updateUser
);

router.delete(
  "/:id",
  verifyToken,
  allowRole(["super_admin"]),
  userController.deleteUser
);

// ==================== ADMIN-SPECIFIC ROUTES (super_admin only) ====================
// Get all store admins
router.get(
  "/admins",
  verifyToken,
  allowRole(["super_admin"]),
  userController.getStoreAdmins
);

// Get single admin by ID
router.get(
  "/admins/:id",
  verifyToken,
  allowRole(["super_admin"]),
  userController.getAdminById
);

// Create new admin
router.post(
  "/admins",
  verifyToken,
  allowRole(["super_admin"]),
  userController.createAdmin
);

// Update admin
router.put(
  "/admins/:id",
  verifyToken,
  allowRole(["super_admin"]),
  userController.updateAdmin
);

// Delete admin
router.delete(
  "/admins/:id",
  verifyToken,
  allowRole(["super_admin"]),
  userController.deleteAdmin
);

module.exports = router;