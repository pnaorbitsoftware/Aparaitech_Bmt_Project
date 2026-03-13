import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import UserTopbar from "../../components/user/UserTopbar";
import { MapPin, Phone, Mail, Clock, ChevronLeft, Tag } from "lucide-react";

const PUBLIC = axios.create({ baseURL: "http://localhost:5000/api" });

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

function getCatColor(cat) {
  return CATEGORY_COLORS[cat] || "bg-slate-100 text-slate-600";
}

export default function ShopPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchStore();
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, [storeId]);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const [storeRes, productsRes] = await Promise.allSettled([
        PUBLIC.get(`/stores/public`),
        PUBLIC.get(`/inventory/public?storeId=${storeId}`),
      ]);

      if (storeRes.status === "fulfilled") {
        const found = (storeRes.value.data?.data || []).find(s => s._id === storeId);
        setStore(found || null);
      }
      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addToCart = (product) => {
    const existing = cart.find(p => p._id === product._id || p.id === product.id);
    const pid = product._id || product.id;
    const newCart = existing
      ? cart.map(p => (p._id || p.id) === pid ? { ...p, quantity: p.quantity + 1 } : p)
      : [...cart, { ...product, _id: pid, quantity: 1, price: product.discount_price || product.price }];
    updateCart(newCart);
    setTimeout(() => window.dispatchEvent(new Event("openCartDrawer")), 100);
  };

  const decreaseQty = (product) => {
    const pid = product._id || product.id;
    const updated = cart
      .map(p => (p._id || p.id) === pid ? { ...p, quantity: p.quantity - 1 } : p)
      .filter(p => p.quantity > 0);
    updateCart(updated);
  };

  const getQty = (id) => {
    const item = cart.find(p => (p._id || p.id) === id);
    return item ? item.quantity : 0;
  };

  const allCategories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = categoryFilter === "All" ? products : products.filter(p => p.category === categoryFilter);

  const address = store?.address
    ? [store.address.street, store.address.city, store.address.state].filter(Boolean).join(", ")
    : null;

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <UserTopbar />
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UserTopbar />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Back */}
        <button onClick={() => navigate("/user-dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-purple-600 text-sm mb-4 transition">
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>

        {/* Store Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black">{store?.name || "Store"}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {(store?.categories || []).map(cat => (
                  <span key={cat} className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">{cat}</span>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-purple-100 text-sm">
                {address && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{address}</p>}
                {store?.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{store.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">15-30 min delivery</span>
            </div>
          </div>
        </div>

        {/* Category filter tabs */}
        {allCategories.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                  categoryFilter === cat
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-purple-300"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl font-semibold">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filtered.map(product => {
              const pid = product._id || product.id;
              const qty = getQty(pid);
              return (
                <div key={pid} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="h-32 bg-purple-50 rounded-xl mb-3 flex items-center justify-center">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-xl" />
                      : <span className="text-4xl">📦</span>
                    }
                  </div>
                  <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-1">{product.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCatColor(product.category)}`}>
                    {product.category}
                  </span>
                  <div className="mt-2 mb-3">
                    {product.discount_price ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-purple-700">₹{product.discount_price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
                      </div>
                    ) : (
                      <span className="font-black text-purple-700">₹{product.price}</span>
                    )}
                  </div>

                  {product.stock === 0 ? (
                    <button disabled className="w-full border border-gray-200 text-gray-400 py-1.5 rounded-full text-sm">
                      Out of Stock
                    </button>
                  ) : qty === 0 ? (
                    <button onClick={() => addToCart(product)}
                      className="w-full border-2 border-purple-500 text-purple-600 py-1.5 rounded-full text-sm font-semibold hover:bg-purple-50 transition">
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-purple-600 text-white rounded-full px-3 py-1.5">
                      <button onClick={() => decreaseQty(product)} className="font-bold text-lg leading-none">−</button>
                      <span className="font-bold text-sm">{qty}</span>
                      <button onClick={() => addToCart(product)} className="font-bold text-lg leading-none">+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}