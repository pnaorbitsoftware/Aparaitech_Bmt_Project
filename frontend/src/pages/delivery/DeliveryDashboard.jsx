import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMotorcycle, FaSignOutAlt, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { Package, CheckCircle, Clock, Truck } from "lucide-react";

const STATUS_COLORS = {
  Confirmed:          "bg-yellow-100 text-yellow-700",
  Preparing:          "bg-orange-100 text-orange-700",
  "Out for Delivery": "bg-blue-100 text-blue-700",
  Delivered:          "bg-green-100 text-green-700",
};

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [partner, setPartner] = useState(null);

  const dpToken = localStorage.getItem("dp_token");
  const API = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${dpToken}` }
  });

  useEffect(() => {
    const dp = localStorage.getItem("dp_user");
    if (!dp || !dpToken) { navigate("/delivery-login"); return; }
    setPartner(JSON.parse(dp));
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/delivery-partners/my-orders");
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/delivery-login");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);
      await API.put(`/delivery-partners/order/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("dp_token");
    localStorage.removeItem("dp_user");
    navigate("/delivery-login");
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  });

  const activeOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled");
  const completedOrders = orders.filter(o => o.status === "Delivered");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-orange-500 text-white px-4 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaMotorcycle size={18} />
            </div>
            <div>
              <p className="font-bold text-base">{partner?.name}</p>
              <p className="text-orange-100 text-xs">{partner?.vehicleType} • {partner?.vehicleNumber}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-orange-500">{activeOrders.length}</p>
            <p className="text-xs text-slate-400 mt-1">Active</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-green-500">{completedOrders.length}</p>
            <p className="text-xs text-slate-400 mt-1">Delivered</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-slate-800">{orders.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total</p>
          </div>
        </div>

        {/* Active Orders */}
        <div>
          <h2 className="font-black text-slate-800 text-lg mb-3">
            🚀 Active Orders ({activeOrders.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-slate-400">
              <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No active orders right now</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Order header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="p-4 border-b bg-slate-50">
                    <p className="font-semibold text-slate-700 flex items-center gap-2 mb-1">
                      <FaPhone className="text-orange-400" size={12} />
                      {order.userId?.name || "Customer"}
                      {order.address?.phone && ` • ${order.address.phone}`}
                    </p>
                    {order.address && (
                      <p className="text-sm text-slate-500 flex items-start gap-2">
                        <FaMapMarkerAlt className="text-red-400 mt-0.5 shrink-0" size={12} />
                        {[order.address.street, order.address.city, order.address.pincode]
                          .filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="p-4 border-b">
                    <p className="text-xs text-slate-400 mb-2">Items</p>
                    {order.items?.map((item, i) => (
                      <p key={i} className="text-sm text-slate-600">
                        {item.name} × {item.quantity}
                      </p>
                    ))}
                    <p className="font-black text-slate-800 mt-2">₹{order.totalAmount}</p>
                    <p className="text-xs text-slate-400">{order.paymentMethod || "COD"}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="p-4 flex gap-3">
                    {order.status === "Confirmed" || order.status === "Preparing" ? (
                      <button
                        onClick={() => updateStatus(order._id, "Out for Delivery")}
                        disabled={updating === order._id}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50">
                        <Truck className="w-4 h-4" />
                        {updating === order._id ? "Updating..." : "Pick Up / Out for Delivery"}
                      </button>
                    ) : order.status === "Out for Delivery" ? (
                      <button
                        onClick={() => updateStatus(order._id, "Delivered")}
                        disabled={updating === order._id}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" />
                        {updating === order._id ? "Updating..." : "Mark as Delivered"}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="font-black text-slate-800 text-lg mb-3">
              ✅ Completed ({completedOrders.length})
            </h2>
            <div className="space-y-3">
              {completedOrders.slice(0, 5).map(order => (
                <div key={order._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-700">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₹{order.totalAmount}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}