const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const inventoryController = require("../controllers/inventoryController");

/* =========================
   GET ALL ACTIVE PRODUCTS
   (ADMIN + STAFF)
========================= */
router.get(
  "/",
  authMiddleware,
  allowRoles(["admin", "staff"]),
  inventoryController.getAllProducts
);

/* =========================
   GET SINGLE PRODUCT
========================= */
router.get(
  "/:id",
  authMiddleware,
  allowRoles(["admin", "staff"]),
  inventoryController.getProductById
);

/* =========================
   ADD PRODUCT (ADMIN)
========================= */
router.post(
  "/",
  authMiddleware,
  allowRoles(["admin"]),
  inventoryController.addProduct
);

/* =========================
   UPDATE PRODUCT (ADMIN)
========================= */
router.put(
  "/:id",
  authMiddleware,
  allowRoles(["admin"]),
  inventoryController.updateProduct
);

/* =========================
   ARCHIVE PRODUCT (ADMIN)
========================= */
router.delete(
  "/:id",
  authMiddleware,
  allowRoles(["admin"]),
  inventoryController.archiveProduct
);

module.exports = router;