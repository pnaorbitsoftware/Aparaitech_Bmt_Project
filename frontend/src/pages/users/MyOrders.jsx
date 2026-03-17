import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChevronRight, FaMapMarkerAlt, FaTimes } from "react-icons/fa";

const STATUS_CONFIG = {
  Placed:             { color: "#3b82f6", bg: "#eff6ff", icon: "🕐", label: "Order Placed" },
  Confirmed:          { color: "#f59e0b", bg: "#fffbeb", icon: "✅", label: "Confirmed" },
  Preparing:          { color: "#f97316", bg: "#fff7ed", icon: "👨‍🍳", label: "Being Prepared" },
  "Out for Delivery": { color: "#8b5cf6", bg: "#f5f3ff", icon: "🛵", label: "Out for Delivery" },
  Delivered:          { color: "#1a9c3e", bg: "#f0fdf4", icon: "✅", label: "Delivered" },
  Cancelled:          { color: "#ef4444", bg: "#fef2f2", icon: "❌", label: "Cancelled" },
};

const STEPS = ["Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userId = user.id || user._id;
      const res = await API.get(`/orders/user/${userId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.orders || [];
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const getStepIndex = (status) => STEPS.indexOf(status);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f5f5f0", minHeight: "100vh", paddingBottom: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      {/* HEADER */}
      <div style={{ background: "white", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 40 }}>
        <button onClick={() => navigate(-1)} style={{ background: "#f5f5f5", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <FaArrowLeft size={14} color="#374151" />
        </button>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#111" }}>My Orders</span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: 20, height: 100, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#111", marginBottom: 8 }}>No orders yet</div>
            <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Looks like you haven't ordered anything yet!</div>
            <button onClick={() => navigate("/user-dashboard")} style={{ background: "#1a9c3e", color: "white", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Placed;
              return (
                <div key={order._id} onClick={() => setSelected(order)}
                  style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        {cfg.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>
                          {order.items?.slice(0, 2).map(i => i.name).join(", ")}
                          {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ""}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                          {order.items?.length} item{order.items?.length > 1 ? "s" : ""} • {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    <FaChevronRight color="#d1d5db" size={13} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#111" }}>₹{order.totalAmount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ORDER DETAIL BOTTOM SHEET */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e5e7eb" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f5f5f5" }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#111" }}>Order Details</span>
              <button onClick={() => setSelected(null)} style={{ background: "#f5f5f5", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaTimes size={13} color="#374151" />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {/* STATUS TRACKER */}
              {selected.status !== "Cancelled" ? (
                <div style={{ background: "#f9fafb", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 16 }}>Order Tracking</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {STEPS.map((step, i) => {
                      const done = i <= getStepIndex(selected.status);
                      const active = i === getStepIndex(selected.status);
                      return (
                        <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#1a9c3e" : "white", border: `2px solid ${done ? "#1a9c3e" : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: active ? "0 0 0 4px rgba(26,156,62,0.15)" : "none" }}>
                            {done ? <span style={{ color: "white", fontSize: 11 }}>✓</span> : <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e5e7eb", display: "block" }} />}
                          </div>
                          <span style={{ fontWeight: active ? 700 : done ? 600 : 400, fontSize: 13, color: active ? "#1a9c3e" : done ? "#111" : "#9ca3af" }}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fef2f2", borderRadius: 12, padding: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>❌</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#ef4444" }}>Order Cancelled</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>This order was cancelled</div>
                  </div>
                </div>
              )}

              {/* ITEMS */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 12 }}>Items Ordered</div>
                {selected.items?.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < selected.items.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: "#f5f5f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>x{item.quantity} • ₹{item.price} each</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* ADDRESS */}
              {selected.address && (
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: 14, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 8 }}>
                    <FaMapMarkerAlt color="#1a9c3e" size={14} /> Delivery Address
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                    {selected.address.name && <div style={{ fontWeight: 600, color: "#374151" }}>{selected.address.name}</div>}
                    <div>{[selected.address.street, selected.address.city, selected.address.state, selected.address.pincode].filter(Boolean).join(", ")}</div>
                    {selected.address.phone && <div>📞 {selected.address.phone}</div>}
                  </div>
                </div>
              )}

              {/* BILL */}
              <div style={{ background: "#f9fafb", borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 12 }}>Bill Details</div>
                {[
                  { label: "Items Total", val: `₹${selected.itemsTotal?.toFixed(2) || 0}` },
                  { label: "Delivery Charge", val: `₹${selected.deliveryCharge || 40}` },
                  { label: "GST (5%)", val: `₹${selected.gst?.toFixed(2) || 0}` },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6b7280" }}>
                    <span>{r.label}</span><span>{r.val}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, color: "#111", borderTop: "1px solid #e5e7eb", paddingTop: 10, marginTop: 4 }}>
                  <span>Grand Total</span><span>₹{selected.totalAmount}</span>
                </div>
              </div>

              {/* PAYMENT */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#f9fafb", borderRadius: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Payment Method</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{selected.paymentMethod || "COD"}</span>
              </div>

              <button onClick={() => { setSelected(null); navigate("/user-dashboard"); }}
                style={{ width: "100%", background: "#1a9c3e", color: "white", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Order Again 🛒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}