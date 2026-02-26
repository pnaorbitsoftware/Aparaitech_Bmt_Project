const router = require("express").Router();
const { sendOfferToLoyalCustomers } = require("../controllers/offerController");

router.post("/send-offer", sendOfferToLoyalCustomers);

module.exports = router;
