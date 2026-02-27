const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");

// Profile routes (any authenticated user)
router.get("/profile", verifyToken, userController.getProfile);
router.put("/profile", verifyToken, userController.updateProfile);

// User management routes (super_admin only)
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

module.exports = router;