import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserTopbar from "../../components/user/UserTopbar";
import {
  FaShoppingBasket, FaCapsules, FaMobileAlt, FaTshirt,
  FaHamburger, FaTools, FaBook, FaPumpSoap, FaDumbbell,
  FaGamepad, FaPencilAlt
} from "react-icons/fa";
import { MapPin, Clock, Tag, ChevronRight, Star, Package } from "lucide-react";

const PUBLIC = axios.create({ baseURL: "http://localhost:5000/api" });

const CATEGORY_CONFIG = [
  { name: "Grocery",            icon: <FaShoppingBasket />, bg: "bg-green-100",  text: "text-green-600" },
  { name: "Pharmacy",           icon: <FaCapsules />,       bg: "bg-blue-100",   text: "text-blue-600" },
  { name: "Electronics",        icon: <FaMobileAlt />,      bg: "bg-purple-100", text: "text-purple-600" },
  { name: "Clothing & Fashion", icon: <FaTshirt />,         bg: "bg-pink-100",   text: "text-pink-600" },
  { name: "Food & Beverages",   icon: <FaHamburger />,      bg: "bg-orange-100", text: "text-orange-600" },
  { name: "Hardware",           icon: <FaTools />,          bg: "bg-yellow-100", text: "text-yellow-600" },
  { name: "Stationery",         icon: <FaPencilAlt />,      bg: "bg-cyan-100",   text: "text-cyan-600" },
  { name: "Beauty & Cosmetics", icon: <FaPumpSoap />,       bg: "bg-rose-100",   text: "text-rose-600" },
  { name: "Sports & Fitness",   icon: <FaDumbbell />,       bg: "bg-teal-100",   text: "text-teal-600" },
  { name: "Books",              icon: <FaBook />,           bg: "bg-amber-100",  text: "text-amber-600" },
  { name: "Toys & Games",       icon: <FaGamepad />,        bg: "bg-indigo-100", text: "text-indigo-600" },
];

const CATEGORY_COLORS = {
  "Grocery": "bg-green-100 text-green-700",
  "Pharmacy": "bg-blue-100 text-blue-700",
  "Electronics": "bg-purple-100 text-purple-700",
  "Clothing & Fashion": "bg-pink-100 text-pink-700",
  "Food & Beverages": "bg-orange-100 text-orange-700",
  "Hardware": "bg-yellow-100 text-yellow-700",
  "Stationery": "bg-cyan-100 text-cyan-700",
  "Beauty & Cosmetics": "bg-rose-100 text-rose-700",
  "Sports & Fitness": "bg-teal-100 text-teal-700",
  "Books": "bg-amber-100 text-amber-700",
  "Toys & Games": "bg-indigo-100 text-indigo-700",
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [storesRes, productsRes] = await Promise.allSettled([
        PUBLIC.get("/stores/public"),
        PUBLIC.get("/inventory/public?featured=true"),
      ]);
      if (storesRes.status === "fulfilled") setStores(storesRes.value.data?.data || []);
      if (productsRes.status === "fulfilled") setFeaturedProducts(productsRes.value.data || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (catName) => {
    navigate(`/category/${encodeURIComponent(catName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserTopbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-2xl p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black mb-2">Delivery in 15 minutes 🚀</h1>
            <p className="text-purple-200">Order groceries, food, clothes, electronics in one place</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/20 px-5 py-3 rounded-xl">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">15 min delivery</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-black text-slate-800 mb-4">Shop by Category</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-3">
            {CATEGORY_CONFIG.map(cat => (
              <div key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition">
                <div className={`${cat.bg} ${cat.text} w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm`}>
                  {cat.icon}
                </div>
                <p className="text-xs text-center font-medium text-slate-600 leading-tight">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stores */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-800">Stores Near You</h2>
            <span className="text-sm text-slate-400">{stores.length} stores</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No stores available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map(store => (
                <div key={store._id}
                  onClick={() => navigate(`/shop/${store._id}`)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group">
                  {/* Store header */}
                  <div className="h-32 bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center relative">
                    <span className="text-5xl">🏪</span>
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Open
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-base mb-2 group-hover:text-purple-600 transition">
                      {store.name}
                    </h3>
                    {/* Category badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(store.categories || []).map(cat => (
                        <span key={cat} className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat] || "bg-slate-100 text-slate-600"}`}>
                          {cat}
                        </span>
                      ))}
                    </div>
                    {/* Address */}
                    {store.address?.city && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {store.address.city}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 15-30 min
                      </span>
                      <span className="text-xs text-purple-600 font-semibold flex items-center gap-1">
                        Visit Store <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-slate-800 mb-4">⭐ Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredProducts.map(product => (
                <div key={product.id || product._id}
                  onClick={() => navigate(`/shop/${product.storeId?._id || product.storeId}`)}
                  className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="h-24 bg-purple-50 rounded-xl mb-2 flex items-center justify-center">
                    <span className="text-3xl">📦</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2 mb-1">{product.name}</p>
                  <p className="text-xs font-black text-purple-700">₹{product.discount_price || product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}