const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const verifyToken = require("../middleware/authMiddleware");

// All vendor routes require authentication
router.use(verifyToken);

router.get("/", vendorController.getVendors);
router.post("/", vendorController.addVendor);
router.put("/:id", vendorController.updateVendor);
router.delete("/:id", vendorController.deleteVendor);

module.exports = router;