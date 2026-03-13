import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { useNavigate } from "react-router-dom";
import UserTopbar from "../../components/user/UserTopbar";
import { MapPin, CreditCard, Wallet, Banknote, ChevronLeft, CheckCircle, ShoppingBag } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    name: "", phone: "", street: "", city: "", state: "", pincode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
    // Pre-fill name and phone from user
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
      alert("Order failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-gray-50">
      <UserTopbar />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <ShoppingBag className="w-16 h-16 text-slate-200" />
        <p className="text-xl font-bold text-slate-400">Your cart is empty</p>
        <button onClick={() => navigate("/user-dashboard")}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition">
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UserTopbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-purple-600 text-sm mb-6 transition">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-black text-slate-800 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT - Address + Payment */}
          <div className="md:col-span-2 space-y-5">

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-600" /> Delivery Address
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Full Name *", key: "name", placeholder: "Your name" },
                  { label: "Phone *", key: "phone", placeholder: "10-digit number" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} value={address[f.key]}
                      onChange={e => setAddress({ ...address, [f.key]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Street Address *</label>
                  <input type="text" placeholder="House no, street, area" value={address.street}
                    onChange={e => setAddress({ ...address, street: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                {[
                  { label: "City *", key: "city" },
                  { label: "State", key: "state" },
                  { label: "Pincode *", key: "pincode" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{f.label}</label>
                    <input type="text" placeholder={f.label.replace(" *", "")} value={address[f.key]}
                      onChange={e => setAddress({ ...address, [f.key]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-600" /> Payment Method
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "COD", label: "Cash on Delivery", icon: <Banknote className="w-5 h-5" /> },
                  { id: "UPI", label: "UPI", icon: <Wallet className="w-5 h-5" /> },
                  { id: "Card", label: "Card", icon: <CreditCard className="w-5 h-5" /> },
                ].map(p => (
                  <button key={p.id} onClick={() => setPaymentMethod(p.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                      paymentMethod === p.id
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-slate-200 text-slate-500 hover:border-purple-300"
                    }`}>
                    {p.icon}
                    <span className="text-xs font-semibold">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">
                Order Items ({cartItems.length})
              </h2>
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item._id || item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-xl">📦</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT - Price Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-slate-800 mb-4">Price Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items Total</span><span>₹{itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span><span>₹{delivery}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (5%)</span><span>₹{gst}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-lg text-slate-800">
                  <span>Total</span><span>₹{grandTotal}</span>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={placing}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50">
                <CheckCircle className="w-5 h-5" />
                {placing ? "Placing Order..." : `Pay ₹${grandTotal}`}
              </button>

              <p className="text-xs text-slate-400 text-center mt-3">
                {paymentMethod === "COD" ? "💵 Pay when your order arrives" : `📱 Pay via ${paymentMethod}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}