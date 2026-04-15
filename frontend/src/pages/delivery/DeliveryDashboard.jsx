import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaMotorcycle,
  FaSignOutAlt,
  FaPhone,
  FaStar,
  FaWallet,
  FaHistory,
  FaCheckCircle,
  FaSpinner,
  FaRupeeSign,
  FaClock,
} from "react-icons/fa";
import {
  Truck,
  MapPin,
  Clock,
  CreditCard,
  Navigation,
  Wifi,
  WifiOff,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

/* ─── helpers ─────────────────────────────────────────────── */
const formatAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  return [address.street, address.area, address.city, address.pincode]
    .filter((v) => v && typeof v === "string")
    .join(", ");
};

const getPhone = (address) => {
  if (!address || typeof address === "string") return "";
  return typeof address.phone === "string" ? address.phone : "";
};

/* ─── status config ───────────────────────────────────────── */
const STATUS_CONFIG = {
  Confirmed: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <Clock size={12} />,
    label: "Confirmed",
  },
  Preparing: {
    badge: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: <FaSpinner size={12} />,
    label: "Preparing",
  },
  "Out for Delivery": {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <Truck size={12} />,
    label: "Out for Delivery",
  },
  Delivered: {
    badge: "bg-green-50 text-green-700 border border-green-200",
    icon: <FaCheckCircle size={12} />,
    label: "Delivered",
  },
};

/* ─── mini map ────────────────────────────────────────────── */
function MiniMap({ lat, lng }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const loadAndInit = () =>
      new Promise((resolve) => {
        if (window.L) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });

    loadAndInit().then(() => {
      if (!mapRef.current) return;
      if (!mapInstanceRef.current) {
        const map = window.L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        });
        window.L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        ).addTo(map);
        mapInstanceRef.current = map;
      }
      const icon = window.L.divIcon({
        className: "",
        html: `<div style="background:#3a7fd4;border:3px solid white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(58,127,212,0.35);">🏍️</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = window.L.marker([lat, lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<strong style="color:#3a7fd4;">📍 Your Location</strong>`)
          .openPopup();
      }
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
    });
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      style={{ height: 200, width: "100%", borderRadius: 14, overflow: "hidden" }}
    />
  );
}

/* ─── stat card ───────────────────────────────────────────── */
const StatCard = ({ title, value, icon, iconBg, iconColor }) => (
  <div className="bg-white border border-blue-100 rounded-2xl p-4 hover:shadow-sm transition-shadow duration-200">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-base"
      style={{ background: iconBg, color: iconColor }}
    >
      {icon}
    </div>
    <p className="text-xl font-semibold text-blue-900">{value}</p>
    <p className="text-xs text-blue-400 mt-1">{title}</p>
  </div>
);

/* ─── order card ──────────────────────────────────────────── */
const OrderCard = ({ order, onUpdateStatus, isUpdating, onExpand, isExpanded }) => {
  const phone = getPhone(order.address);
  const addressText = formatAddress(order.address);
  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.Confirmed;
  const isWaiting = order.status === "Preparing";
  const canPickup = order.status === "Confirmed";
  const canOut = order.status === "Preparing";
  const canDeliver = order.status === "Out for Delivery";

  /* icon bg per status */
  const iconBg = {
    Confirmed: "bg-blue-50 text-blue-500",
    Preparing: "bg-orange-50 text-orange-400",
    "Out for Delivery": "bg-blue-100 text-blue-600",
    Delivered: "bg-green-50 text-green-500",
  }[order.status] || "bg-blue-50 text-blue-500";

  const iconEmoji = {
    Confirmed: "📋",
    Preparing: "🍳",
    "Out for Delivery": "🚚",
    Delivered: "✓",
  }[order.status] || "📋";

  return (
    <div className="bg-white border border-blue-100 rounded-2xl mb-3 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* header row */}
      <div
        className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-blue-50/40 transition-colors duration-150"
        onClick={() => onExpand(order._id)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${iconBg}`}>
          {iconEmoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-blue-900">
              #{order._id.slice(-6)}
            </span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${sc.badge}`}>
              {sc.icon} {sc.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-400">
            <MapPin size={11} />
            <span className="truncate">{order.userId?.name || "Customer"}</span>
            <span>·</span>
            <ShoppingBag size={11} />
            <span>{order.items?.length || 0} items</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-blue-900">₹{order.totalAmount}</p>
          <p className="text-xs text-blue-300 mt-0.5">
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <ChevronRight
          size={16}
          className={`text-blue-300 transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
        />
      </div>

      {/* expanded details */}
      {isExpanded && (
        <div className="border-t border-blue-50 bg-blue-50/30 px-4 py-4 space-y-3 animate-slideDown">
          {/* address */}
          <div className="bg-white border border-blue-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
              Delivery Address
            </p>
            <p className="text-sm text-blue-800 leading-relaxed">
              {addressText || "No address provided"}
            </p>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1.5 mt-2.5 text-xs text-blue-500 font-medium hover:text-blue-700 transition-colors"
              >
                <FaPhone size={11} /> Call customer
              </a>
            )}
          </div>

          {/* items */}
          <div className="bg-white border border-blue-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2.5">
              Order Items
            </p>
            <div className="space-y-1.5">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 w-7 text-xs font-medium">{item.quantity}×</span>
                    <span className="text-blue-800">{item.name}</span>
                  </div>
                  <span className="text-blue-700 font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-blue-50 mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-blue-800">Total</span>
              <span className="text-lg font-bold text-blue-600">₹{order.totalAmount}</span>
            </div>
            {order.paymentMethod && (
              <div className="flex items-center gap-1.5 mt-2 pt-1">
                <CreditCard size={12} className="text-blue-300" />
                <span className="text-xs text-blue-400">{order.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* action buttons */}
          <div>
            {/* Pick up — Confirmed */}
            {canPickup && (
              <button
                onClick={() => onUpdateStatus(order._id, "Out for Delivery")}
                disabled={isUpdating === order._id}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#3a7fd4", color: "#fff" }}
              >
                <ShoppingBag size={15} />
                {isUpdating === order._id ? "Processing…" : "Pick up order"}
              </button>
            )}

            {/* Waiting — Preparing */}
            {isWaiting && (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-not-allowed"
                style={{
                  background: "#f0f4ff",
                  color: "#7a9ac0",
                  border: "1.5px solid #dce8ff",
                }}
              >
                <FaSpinner size={14} />
                Waiting for restaurant…
              </button>
            )}

            {/* Mark out for delivery — if you have intermediate step */}
            {canOut && (
              <button
                onClick={() => onUpdateStatus(order._id, "Out for Delivery")}
                disabled={isUpdating === order._id}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                style={{ background: "#5b9ef5", color: "#fff" }}
              >
                <Truck size={15} />
                {isUpdating === order._id ? "Processing…" : "Mark out for delivery"}
              </button>
            )}

            {/* Mark as delivered */}
            {canDeliver && (
              <button
                onClick={() => onUpdateStatus(order._id, "Delivered")}
                disabled={isUpdating === order._id}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: "#eaf3ff",
                  color: "#2563a8",
                  border: "1.5px solid #bdd6f8",
                }}
              >
                <FaCheckCircle size={15} />
                {isUpdating === order._id ? "Processing…" : "Mark as delivered"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── main dashboard ──────────────────────────────────────── */
export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [partner, setPartner] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [myLocation, setMyLocation] = useState(null);
  const [lastPushed, setLastPushed] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({ active: 0, completed: 0, totalEarned: 0 });
  const locationIntervalRef = useRef(null);

  const dpToken = localStorage.getItem("dp_token");

  const API = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${dpToken}` },
  });

  useEffect(() => {
    const dp = localStorage.getItem("dp_user");
    if (!dp || !dpToken) { navigate("/delivery-login"); return; }
    setPartner(JSON.parse(dp));
    fetchOrders();
    return () => stopLocationSharing();
  }, []);

  useEffect(() => {
    const hasActive = orders.some((o) => o.status === "Out for Delivery");
    if (hasActive) startLocationSharing();
    else stopLocationSharing();
  }, [orders]);

  useEffect(() => {
    const active = orders.filter(
      (o) => o.status !== "Delivered" && o.status !== "Cancelled"
    ).length;
    const completed = orders.filter((o) => o.status === "Delivered").length;
    const totalEarned = orders
      .filter((o) => o.status === "Delivered")
      .reduce((s, o) => s + o.totalAmount, 0);
    setStats({ active, completed, totalEarned });
  }, [orders]);

  const startLocationSharing = () => {
    if (locationIntervalRef.current) return;
    if (!navigator.geolocation) { setLocationStatus("error"); return; }
    setLocationStatus("sharing");
    const push = () => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          setMyLocation({ lat: coords.latitude, lng: coords.longitude });
          try {
            await API.put("/delivery-partners/location", {
              lat: coords.latitude,
              lng: coords.longitude,
            });
            setLastPushed(new Date());
          } catch {}
        },
        () => setLocationStatus("error"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };
    push();
    locationIntervalRef.current = setInterval(push, 10000);
  };

  const stopLocationSharing = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setLocationStatus("idle");
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/delivery-partners/my-orders");
      setOrders(res.data?.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/delivery-login");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);
      await API.put(`/delivery-partners/order/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      if (status === "Delivered") setExpandedOrder(null);
    } catch (err) {
      alert("Failed to update: " + err.response?.data?.message);
    } finally {
      setUpdating(null);
    }
  };

  const logout = () => {
    stopLocationSharing();
    localStorage.removeItem("dp_token");
    localStorage.removeItem("dp_user");
    navigate("/delivery-login");
  };

  const activeOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );
  const completedOrders = orders.filter((o) => o.status === "Delivered");

  /* ── render ── */
  return (
    <div className="min-h-screen" style={{ background: "#f0f4ff" }}>
      {/* ── header ── */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">
              🏍
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 leading-tight">
                {partner?.name || "Delivery Partner"}
              </p>
              <p className="text-xs text-blue-400">
                {partner?.vehicleType || "Bike"}
                {partner?.vehicleNumber && ` · ${partner.vehicleNumber}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {locationStatus === "sharing" && (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                <span className="text-xs text-blue-600 font-medium">Live</span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-3 py-1.5 transition-colors"
            >
              <FaSignOutAlt size={11} /> Exit
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-6">
        {/* ── stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            title="Active deliveries"
            value={stats.active}
            icon={<Truck size={17} />}
            iconBg="#e8f0ff"
            iconColor="#3a7fd4"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<FaCheckCircle size={16} />}
            iconBg="#eaf6ef"
            iconColor="#2a7a52"
          />
          <StatCard
            title="Total earned"
            value={`₹${stats.totalEarned}`}
            icon={<FaWallet size={16} />}
            iconBg="#e8f0ff"
            iconColor="#3a7fd4"
          />
          <StatCard
            title="Rating"
            value="4.8 ★"
            icon={<FaStar size={15} />}
            iconBg="#fff8e6"
            iconColor="#c08000"
          />
        </div>

        {/* ── live location banner ── */}
        {locationStatus === "sharing" && (
          <div className="bg-white border border-blue-100 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Navigation size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Live Location Active</p>
                <p className="text-xs text-blue-400">Customers can track you in real-time</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-blue-500">
                <Wifi size={12} /> Updates every 10s
              </div>
              {lastPushed && (
                <p className="text-xs text-blue-300 mt-0.5">
                  Last: {lastPushed.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}

        {locationStatus === "error" && (
          <div className="bg-white border border-red-100 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <WifiOff size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700">Location Access Required</p>
                <p className="text-xs text-red-400">Enable GPS to share live location</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-medium text-white bg-red-400 hover:bg-red-500 px-4 py-2 rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── mini map ── */}
        {myLocation && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-blue-900 flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-400" /> Your Location
              </p>
              <a
                href={`https://www.google.com/maps?q=${myLocation.lat},${myLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
              >
                Open in Maps →
              </a>
            </div>
            <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
              <MiniMap lat={myLocation.lat} lng={myLocation.lng} />
            </div>
          </div>
        )}

        {/* ── active orders ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-blue-900 flex items-center gap-2">
                <Truck size={17} className="text-blue-400" /> Active Deliveries
              </h2>
              <p className="text-xs text-blue-400 mt-0.5">Manage your ongoing orders</p>
            </div>
            <span className="text-xs font-semibold bg-blue-500 text-white rounded-full px-3 py-1">
              {activeOrders.length} active
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-blue-100 rounded-2xl p-5 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-blue-50 rounded w-1/3" />
                      <div className="h-2.5 bg-blue-50 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-blue-50 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="bg-white border border-blue-100 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={28} className="text-blue-300" />
              </div>
              <p className="text-sm font-semibold text-blue-800 mb-1">No Active Deliveries</p>
              <p className="text-xs text-blue-400">New orders will appear here automatically</p>
            </div>
          ) : (
            <div>
              {activeOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onUpdateStatus={updateStatus}
                  isUpdating={updating}
                  onExpand={(id) =>
                    setExpandedOrder(expandedOrder === id ? null : id)
                  }
                  isExpanded={expandedOrder === order._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── delivery history ── */}
        {completedOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                <FaHistory size={14} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-blue-900">Delivery History</h2>
                <p className="text-xs text-blue-400">Last {completedOrders.length} deliveries</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completedOrders.slice(0, 6).map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-blue-100 rounded-2xl p-4 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                        <FaCheckCircle size={13} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          #{order._id.slice(-6)}
                        </p>
                        <p className="text-xs text-blue-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-900">₹{order.totalAmount}</p>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        Delivered
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-400">
                    <MapPin size={11} />
                    <span className="truncate">
                      {formatAddress(order.address) || "No address"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.25s ease-out; }
      `}</style>
    </div>
  );
}