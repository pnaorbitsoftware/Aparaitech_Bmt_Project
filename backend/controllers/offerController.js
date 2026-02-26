const db = require("../db");
const { sendWhatsApp } = require("../utils/notificationService");

exports.sendOfferToLoyalCustomers = async (req, res) => {
  const { message } = req.body;

  try {
    const [customers] = await db.query(
      "SELECT phone FROM customers WHERE total_spent >= 5000"
    );

    for (const c of customers) {
      await sendWhatsApp(
        `+91${c.phone}`,
        `🔥 SmartStore Offer 🔥\n${message}`
      );
    }

    res.json({
      success: true,
      sentTo: customers.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Offer broadcast failed" });
  }
};
