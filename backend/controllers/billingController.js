const db = require("../db");
const { sendSMS, sendWhatsApp } = require("../utils/notificationService");

exports.createBill = async (req, res) => {
  const {
    paymentMode,
    items,
    phone,
    joinLoyalty,
    newCustomer,
    cashReceived // ✅ NEW
  } = req.body;

  /* ======================
     BASIC VALIDATION
  ====================== */
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    let customerId = null;
    let loyaltyId = null;
    let customerName = null;
    let customerPoints = 0;
    let customerPhone = phone || null;
    let isNewLoyaltyCustomer = false;

    /* ======================
       1️⃣ FIND EXISTING CUSTOMER
    ====================== */
    if (phone) {
      const [[existing]] = await conn.query(
        `SELECT id, name, points, loyalty_id FROM customers WHERE phone = ?`,
        [phone]
      );

      if (existing) {
        customerId = existing.id;
        loyaltyId = existing.loyalty_id;
        customerName = existing.name;
        customerPoints = existing.points;
      }
    }

    /* ======================
       2️⃣ CREATE CUSTOMER IF JOINING
    ====================== */
    if (!customerId && joinLoyalty && newCustomer?.name && phone) {
      loyaltyId = "LOY" + Date.now();

      const [cust] = await conn.query(
        `
        INSERT INTO customers
        (loyalty_id, name, phone, email, points, total_spent)
        VALUES (?, ?, ?, ?, 0, 0)
        `,
        [loyaltyId, newCustomer.name, phone, newCustomer.email || null]
      );

      customerId = cust.insertId;
      customerName = newCustomer.name;
      customerPoints = 0;
      isNewLoyaltyCustomer = true;
    }

    /* ======================
       3️⃣ VALIDATE ITEMS + EXPIRY DISCOUNT
    ====================== */
    let subtotal = 0;
    const billItems = [];

    for (const i of items) {
      if (!i.productId || !i.qty || i.qty <= 0) {
        throw new Error("Invalid cart data");
      }

      const [[p]] = await conn.query(
        `
        SELECT
          name,
          price,
          stock,
          expiry_date,
          CASE
            WHEN expiry_date IS NULL THEN 999
            ELSE DATEDIFF(DATE(expiry_date), CURDATE())
          END AS days_left
        FROM products
        WHERE id = ?
        FOR UPDATE
        `,
        [i.productId]
      );

      if (!p) throw new Error("Product not found");
      if (p.stock < i.qty) {
        throw new Error(`Insufficient stock for ${p.name}`);
      }

      let discountPercent = 0;

      if (p.days_left < 0) {
        throw new Error(`${p.name} is expired`);
      } else if (p.days_left === 0) {
        throw new Error(`${p.name} expires today`);
      } else if (p.days_left <= 1) {
        discountPercent = 50;
      } else if (p.days_left <= 3) {
        discountPercent = 30;
      } else if (p.days_left <= 7) {
        discountPercent = 15;
      }

      const mrp = Number(p.price);
      let finalPrice = mrp;

      if (discountPercent > 0) {
        finalPrice = mrp * (1 - discountPercent / 100);
      }

      finalPrice = Number(finalPrice.toFixed(2));
      const lineTotal = Number((finalPrice * i.qty).toFixed(2));

      subtotal += lineTotal;

      billItems.push({
        name: p.name,
        qty: i.qty,
        mrp,
        discountPercent,
        total: lineTotal
      });

      i._validatedPrice = finalPrice;
      i._lineTotal = lineTotal;
    }

    subtotal = Number(subtotal.toFixed(2));
    const gst = Number((subtotal * 0.18).toFixed(2));
    const total = Number((subtotal + gst).toFixed(2));

    /* ======================
       4️⃣ CREATE TRANSACTION
    ====================== */
    const billNo = "SS-" + Date.now();

    const [tx] = await conn.query(
      `
      INSERT INTO transactions
      (bill_no, customer_id, subtotal, gst, total,
       payment_mode, payment_provider, status)
      VALUES (?, ?, ?, ?, ?, ?, 'POS', 'SUCCESS')
      `,
      [billNo, customerId, subtotal, gst, total, paymentMode]
    );

    const transactionId = tx.insertId;

    /* ======================
       5️⃣ INSERT ITEMS + UPDATE STOCK
    ====================== */
    for (const i of items) {
      await conn.query(
        `
        INSERT INTO transaction_items
        (transaction_id, product_id, price, quantity, total)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          transactionId,
          i.productId,
          i._validatedPrice,
          i.qty,
          i._lineTotal
        ]
      );

      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [i.qty, i.productId]
      );
    }

    /* ======================
       6️⃣ LOYALTY POINTS
    ====================== */
    let pointsAdded = 0;

    if (customerId) {
      pointsAdded = Math.floor(total / 100);

      await conn.query(
        `
        UPDATE customers
        SET points = points + ?, total_spent = total_spent + ?
        WHERE id = ?
        `,
        [pointsAdded, total, customerId]
      );

      await conn.query(
        `
        INSERT INTO loyalty_history
        (customer_id, transaction_id, points, type)
        VALUES (?, ?, ?, 'EARNED')
        `,
        [customerId, transactionId, pointsAdded]
      );

      customerPoints += pointsAdded;
    }

    await conn.commit();

    /* ======================
       7️⃣ WHATSAPP RECEIPT WITH PAYMENT DETAILS
    ====================== */
    if (customerPhone) {
      const billDate = new Date().toLocaleString("en-IN");

      let paymentText = "";

      if (paymentMode === "CASH") {
        const change = Number(cashReceived) - total;
        paymentText = `
Payment Mode: CASH
Cash Given: ₹${cashReceived}
Bill Amount: ₹${total}
Change Returned: ₹${change.toFixed(2)}
`;
      } else if (paymentMode === "UPI") {
        paymentText = `
Payment Mode: UPI
Paid via UPI
Amount: ₹${total}
`;
      } else if (paymentMode === "CARD") {
        paymentText = `
Payment Mode: CARD
Paid via Credit/Debit Card
Amount: ₹${total}
`;
      } else if (paymentMode === "WALLET") {
        paymentText = `
Payment Mode: WALLET
Paid via Wallet
Amount: ₹${total}
`;
      }

      const itemText = billItems
        .map(
          (i, idx) =>
            `${idx + 1}. ${i.name}
Qty: ${i.qty} | MRP: ₹${i.mrp}
${i.discountPercent ? `Discount: ${i.discountPercent}%` : "No Discount"}
Amount: ₹${i.total}`
        )
        .join("\n\n");

      const whatsappMsg = `
🧾 SmartStore Receipt

Bill No: ${billNo}
Date: ${billDate}

${paymentText}
------------------------
${itemText}
------------------------

Subtotal: ₹${subtotal}
GST (18%): ₹${gst}
TOTAL: ₹${total}

Thank you for shopping with us 🧡
Visit Again!
`;

      sendWhatsApp(`+91${customerPhone}`, whatsappMsg).catch(() => {});
    }

    /* ======================
       8️⃣ RESPONSE
    ====================== */
    res.json({
      success: true,
      billNo,
      total,
      pointsAdded
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("CREATE BILL ERROR:", err);
    res.status(400).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
