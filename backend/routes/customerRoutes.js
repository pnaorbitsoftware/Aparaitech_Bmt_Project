const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");
const customerController = require("../controllers/customerController");


/* =========================
   🔍 CHECK CUSTOMER BY PHONE
   (USED BY BILLING — MAIN)
========================= */
router.get(
  "/check",
  verifyToken,
  allowRole(["admin", "staff"]),
  customerController.checkCustomerByPhone
);

router.get(
  "/:id", 
  verifyToken, 
  allowRole(["admin", "staff"]),
   customerController.getCustomerById
);

/* =========================
   GET ALL CUSTOMERS
   (ADMIN + STAFF)
========================= */
router.get(
  "/",
  verifyToken,
  allowRole(["admin", "staff"]),
  customerController.getAllCustomers
);

/* =========================
   ENROLL CUSTOMER
   (MANUAL / OPTIONAL)
========================= */
router.post(
  "/",
  verifyToken,
  allowRole(["admin", "staff"]),
  customerController.enrollCustomer
);

/* =========================
   DELETE CUSTOMER (ADMIN)
========================= */
router.delete(
  "/:id",
  verifyToken,
  allowRole(["admin"]),
  customerController.deleteCustomer
);

module.exports = router;