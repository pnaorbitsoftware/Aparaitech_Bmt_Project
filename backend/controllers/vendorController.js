const db = require("../db");

/* =========================
   GET ALL VENDORS
========================= */
exports.getVendors = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM vendors ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("FETCH VENDORS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

/* =========================
   ADD VENDOR
========================= */
exports.addVendor = async (req, res) => {
  const {
    company_name,
    category,
    contact_person,
    phone,
    email,
    account_manager,
    payment_due,
    address
  } = req.body;

  if (!company_name || !phone) {
    return res.status(400).json({
      message: "Company name and phone are required"
    });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO vendors
      (company_name, category, contact_person, phone, email, account_manager, payment_due, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        company_name,
        category || null,
        contact_person || null,
        phone,
        email || null,
        account_manager || null,
        payment_due || 0,
        address || null
      ]
    );

    res.json({
      success: true,
      id: result.insertId
    });

  } catch (err) {
    console.error("ADD VENDOR ERROR:", err);
    res.status(500).json({ message: "Failed to add vendor" });
  }
};

/* =========================
   UPDATE VENDOR
========================= */
exports.updateVendor = async (req, res) => {
  const { id } = req.params;
  const v = req.body;

  try {
    await db.query(
      `
      UPDATE vendors SET
        company_name = ?,
        category = ?,
        contact_person = ?,
        phone = ?,
        email = ?,
        account_manager = ?,
        payment_due = ?,
        status = ?,
        address = ?
      WHERE id = ?
      `,
      [
        v.company_name,
        v.category || null,
        v.contact_person || null,
        v.phone,
        v.email || null,
        v.account_manager || null,
        v.payment_due || 0,
        v.status || "ACTIVE",
        v.address || null,
        id
      ]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("UPDATE VENDOR ERROR:", err);
    res.status(500).json({ message: "Failed to update vendor" });
  }
};

/* =========================
   DELETE VENDOR
========================= */
exports.deleteVendor = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      "DELETE FROM vendors WHERE id = ?",
      [id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE VENDOR ERROR:", err);
    res.status(500).json({ message: "Failed to delete vendor" });
  }
};
