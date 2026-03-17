import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaTrash, FaShoppingBag } from "react-icons/fa";

export default function CartDrawer({ isOpen, onClose }) {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    const handleUpdate = () => loadCart();
    window.addEventListener("cartUpdated", handleUpdate);
    return () => window.removeEventListener("cartUpdated", handleUpdate);
  }, [isOpen]);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  };

  const updateCart = (items) => {
    localStorage.setItem("cart", JSON.stringify(items));
    setCartItems(items);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQty = (id) => {
    updateCart(cartItems.map(p => p._id === id ? { ...p, quantity: p.quantity + 1 } : p));
  };

  const decreaseQty = (id) => {
    updateCart(cartItems.map(p => p._id === id ? { ...p, quantity: p.quantity - 1 } : p).filter(p => p.quantity > 0));
  };

  const removeItem = (id) => {
    updateCart(cartItems.filter(p => p._id !== id));
  };

  const itemsTotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const delivery = cartItems.length > 0 ? 40 : 0;
  const gst = +(itemsTotal * 0.05).toFixed(2);
  const grandTotal = +(itemsTotal + delivery + gst).toFixed(2);
  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* OVERLAY */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }} />

      {/* DRAWER */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: "100%", maxWidth: 420,
        background: "#f5f5f0", zIndex: 100, display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        animation: "slideIn 0.3s ease"
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* HEADER */}
        <div style={{ background: "white", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FaShoppingBag color="#1a9c3e" size={18} />
            <span style={{ fontWeight: 800, fontSize: 18, color: "#111" }}>Your Cart</span>
            {totalItems > 0 && (
              <span style={{ background: "#1a9c3e", color: "white", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{totalItems} items</span>
            )}
          </div>
          <button onClick={onClose} style={{ background: "#f5f5f5", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <FaTimes size={13} color="#374151" />
          </button>
        </div>

        {/* DELIVERY STRIP */}
        {cartItems.length > 0 && (
          <div style={{ background: "#f0fdf4", padding: "8px 20px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #bbf7d0" }}>
            <span style={{ fontSize: 16 }}>🛵</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1a9c3e" }}>Delivery in 15 minutes</span>
          </div>
        )}

        {/* ITEMS */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#111", marginBottom: 8 }}>Your cart is empty</div>
              <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 24 }}>Add items to get started!</div>
              <button onClick={onClose} style={{ background: "#1a9c3e", color: "white", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Browse Stores
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cartItems.map(item => (
                <div key={item._id} style={{ background: "white", borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                  {/* Image */}
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "#f5f5f5", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 24 }}>📦</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#1a9c3e" }}>₹{item.price}</div>
                  </div>

                  {/* Controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#1a9c3e", borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => decreaseQty(item._id)} style={{ background: "none", border: "none", color: "white", fontWeight: 700, fontSize: 18, padding: "6px 12px", cursor: "pointer" }}>−</button>
                    <span style={{ color: "white", fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => increaseQty(item._id)} style={{ background: "none", border: "none", color: "white", fontWeight: 700, fontSize: 18, padding: "6px 12px", cursor: "pointer" }}>+</button>
                  </div>

                  {/* Delete */}
                  <button onClick={() => removeItem(item._id)} style={{ background: "#fef2f2", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    <FaTrash size={12} color="#ef4444" />
                  </button>
                </div>
              ))}

              {/* OFFER STRIP */}
              <div style={{ background: "#f0fdf4", border: "1px dashed #86efac", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>%</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#1a9c3e" }}>50% upto ₹150 off</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>USE TRY50 | Above ₹99</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BILL + CHECKOUT */}
        {cartItems.length > 0 && (
          <div style={{ background: "white", padding: "16px 20px", borderTop: "1px solid #f0f0f0" }}>
            {/* Bill summary */}
            <div style={{ marginBottom: 14 }}>
              {[
                { label: "Items Total", val: `₹${itemsTotal.toFixed(2)}` },
                { label: "Delivery", val: `₹${delivery}` },
                { label: "GST (5%)", val: `₹${gst}` },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                  <span>{r.label}</span><span>{r.val}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, color: "#111", borderTop: "1px dashed #e5e7eb", paddingTop: 10, marginTop: 4 }}>
                <span>Grand Total</span><span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button onClick={() => { onClose(); navigate("/checkout"); }}
              style={{ width: "100%", background: "#1a9c3e", color: "white", border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 16px rgba(26,156,62,0.3)" }}>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "2px 10px", fontSize: 13 }}>{totalItems} items</span>
              <span>Proceed to Checkout</span>
              <span>₹{grandTotal}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}