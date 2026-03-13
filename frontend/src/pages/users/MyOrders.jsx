import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { useNavigate } from "react-router-dom";
import UserTopbar from "../../components/user/UserTopbar";
import { Package, Clock, ChevronRight, MapPin, X } from "lucide-react";

const STATUS_COLORS = {
  Placed:     "bg-blue-100 text-blue-700",
  Confirmed:  "bg-yellow-100 text-yellow-700",
  Preparing:  "bg-orange-100 text-orange-700",
  "Out for Delivery": "bg-purple-100 text-purple-700",
  Delivered:  "bg-green-100 text-green-700",
  Cancelled:  "bg-red-100 text-red-700",
};

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
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <UserTopbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-slate-800 mb-6">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl font-bold text-slate-400 mb-2">No orders yet</p>
            <button onClick={() => navigate("/user-dashboard")}
              className="mt-4 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id}
                onClick={() => setSelected(order)}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(order.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {order.items?.length} item{order.items?.length > 1 ? "s" : ""} •{" "}
                      {order.items?.slice(0, 2).map(i => i.name).join(", ")}
                      {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ""}
                    </p>
                    {order.address?.city && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {order.address.city}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800">₹{order.totalAmount}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-black text-slate-800">Order Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[selected.status] || "bg-slate-100 text-slate-600"}`}>
                  {selected.status}
                </span>
                <span className="text-xs text-slate-400">{formatDate(selected.createdAt)}</span>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Items</h3>
                <div className="space-y-2">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.name} × {item.quantity}</span>
                      <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              {selected.address && (
                <div>
                  <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Delivery Address
                  </h3>
                  <p className="text-sm text-slate-500">
                    {[selected.address.name, selected.address.street, selected.address.city,
                      selected.address.state, selected.address.pincode].filter(Boolean).join(", ")}
                  </p>
                  {selected.address.phone && <p className="text-sm text-slate-500">📞 {selected.address.phone}</p>}
                </div>
              )}

              {/* Payment */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment</span>
                <span className="font-semibold">{selected.paymentMethod || "COD"}</span>
              </div>

              {/* Price breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Items Total</span><span>₹{selected.itemsTotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span><span>₹{selected.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST</span><span>₹{selected.gst?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-800 text-base border-t border-slate-200 pt-2">
                  <span>Total</span><span>₹{selected.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}