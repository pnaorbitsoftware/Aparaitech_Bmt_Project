import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaWallet, FaCreditCard, FaMoneyBillWave, FaTag } from "react-icons/fa";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
    setAddress(prev => ({ ...prev, name: user.name || "", phone: user.mobile || "" }));
  }, []);

  const itemsTotal = cartItems.reduce((t, item) => t + item.price * item.quantity, 0);
  const delivery = 40;
  const gst = +(itemsTotal * 0.05).toFixed(2);
  const grandTotal = +(itemsTotal + delivery + gst).toFixed(2);

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.pincode) {
      alert("Please fill all address fields"); return;
    }
    if (cartItems.length === 0) { alert("Your cart is empty"); return; }
    const storeId = cartItems[0]?.storeId?._id || cartItems[0]?.storeId || null;
    try {
      setPlacing(true);
      const order = {
        userId: user.id || user._id,
        storeId,
        items: cartItems.map(item => ({
          productId: item._id || item.id || "",
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        address,
        paymentMethod,
        itemsTotal,
        deliveryCharge: delivery,
        gst,
        totalAmount: grandTotal,
        status: "Placed"
      };
      await API.post("/orders/place", order);
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/order-success");
    } catch (error) {
      console.error(error);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const PAYMENT_OPTIONS = [
    { id: "COD", label: "Cash on Delivery", sub: "Pay when delivered", icon: <FaMoneyBillWave size={18} color="#1a9c3e" /> },
    { id: "UPI", label: "UPI", sub: "Google Pay, PhonePe, Paytm", icon: <FaWallet size={18} color="#6366f1" /> },
    { id: "Card", label: "Credit / Debit Card", sub: "Visa, Mastercard, Rupay", icon: <FaCreditCard size={18} color="#3b82f6" /> },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f5f5f0", minHeight: "100vh", paddingBottom: 100 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: "white", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 40 }}>
        <button onClick={() => navigate(-1)} style={{ background: "#f5f5f5", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <FaArrowLeft size={14} color="#374151" />
        </button>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#111" }}>Checkout</span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* CART ITEMS */}
        <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 12 }}>🛒 Your Order ({cartItems.length} items)</div>
          {cartItems.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < cartItems.length - 1 ? "1px solid #f5f5f5" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: "#f5f5f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>x{item.quantity}</div>
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* ADDRESS */}
        <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 14 }}>
            <FaMapMarkerAlt color="#1a9c3e" size={15} /> Delivery Address
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { key: "name", label: "Full Name", placeholder: "Your name", full: false },
              { key: "phone", label: "Phone", placeholder: "10 digit number", full: false },
              { key: "street", label: "Street / Area", placeholder: "House no, street name", full: true },
              { key: "city", label: "City", placeholder: "City", full: false },
              { key: "state", label: "State", placeholder: "State", full: false },
              { key: "pincode", label: "Pincode", placeholder: "6 digit pincode", full: false },
            ].map(field => (
              <div key={field.key} style={{ gridColumn: field.full ? "1 / -1" : "auto" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 5 }}>{field.label}</label>
                <input
                  value={address[field.key]}
                  onChange={e => setAddress(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", background: "#fafafa" }}
                  onFocus={e => e.target.style.borderColor = "#1a9c3e"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT */}
        <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 14 }}>💳 Payment Method</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PAYMENT_OPTIONS.map(opt => (
              <div key={opt.id} onClick={() => setPaymentMethod(opt.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `2px solid ${paymentMethod === opt.id ? "#1a9c3e" : "#e5e7eb"}`, background: paymentMethod === opt.id ? "#f0fdf4" : "white", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 36, height: 36, background: "#f5f5f5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{opt.sub}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${paymentMethod === opt.id ? "#1a9c3e" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {paymentMethod === opt.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a9c3e" }} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BILL */}
        <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 14 }}>
            <FaTag color="#1a9c3e" size={14} /> Bill Details
          </div>
          {[
            { label: "Items Total", val: `₹${itemsTotal.toFixed(2)}` },
            { label: "Delivery Charge", val: `₹${delivery}` },
            { label: "GST (5%)", val: `₹${gst}` },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "#6b7280" }}>
              <span>{r.label}</span><span>{r.val}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, color: "#111", borderTop: "2px dashed #e5e7eb", paddingTop: 12, marginTop: 4 }}>
            <span>Grand Total</span><span>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* STICKY BUTTON */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", padding: "14px 20px", borderTop: "1px solid #e5e7eb", zIndex: 50 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button onClick={handlePlaceOrder} disabled={placing || cartItems.length === 0}
            style={{ width: "100%", background: placing ? "#9ca3af" : "#1a9c3e", color: "white", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 800, cursor: placing ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(26,156,62,0.3)" }}>
            <span>{placing ? "Placing Order..." : "Place Order"}</span>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "4px 12px", fontSize: 15 }}>₹{grandTotal}</span>
          </button>
        </div>
      </div>
    </div>
  );
}