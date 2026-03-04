const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");

// ==================== PROFILE ROUTES (any authenticated user) ====================
router.get("/profile", verifyToken, userController.getProfile);
router.put("/profile", verifyToken, userController.updateProfile);

// ==================== ADMIN SELF-SERVICE STAFF ROUTES ====================
// Admin manages their own store's staff
router.get("/my-staff", verifyToken, allowRole(["admin"]), userController.getMyStaff);
router.post("/my-staff", verifyToken, allowRole(["admin"]), userController.createMyStaff);
router.put("/my-staff/:id", verifyToken, allowRole(["admin"]), userController.updateMyStaff);
router.delete("/my-staff/:id", verifyToken, allowRole(["admin"]), userController.deleteMyStaff);

// ==================== GENERAL USER MANAGEMENT (super_admin only) ====================
router.get("/", verifyToken, allowRole(["super_admin"]), userController.getAllUsers);
router.post("/", verifyToken, allowRole(["super_admin"]), userController.createUser);
router.put("/:id", verifyToken, allowRole(["super_admin"]), userController.updateUser);
router.delete("/:id", verifyToken, allowRole(["super_admin"]), userController.deleteUser);

// ==================== ADMIN-SPECIFIC ROUTES (super_admin only) ====================
router.get("/admins", verifyToken, allowRole(["super_admin"]), userController.getStoreAdmins);
router.get("/admins/:id", verifyToken, allowRole(["super_admin"]), userController.getAdminById);
router.post("/admins", verifyToken, allowRole(["super_admin"]), userController.createAdmin);
router.put("/admins/:id", verifyToken, allowRole(["super_admin"]), userController.updateAdmin);
router.delete("/admins/:id", verifyToken, allowRole(["super_admin"]), userController.deleteAdmin);

module.exports = router;