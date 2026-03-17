import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaShoppingCart, FaMapMarkerAlt, FaChevronDown, FaFire, FaStar } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import CartDrawer from "../../components/user/CartDrawer";

const PUBLIC = axios.create({ baseURL: "http://localhost:5000/api" });

const CATEGORIES = [
  { label: "Bestsellers", emoji: "⭐", color: "#fff8e1" },
  { label: "Grocery", emoji: "🛒", color: "#e8f5e9" },
  { label: "Pharmacy", emoji: "💊", color: "#fce4ec" },
  { label: "Electronics", emoji: "📱", color: "#e3f2fd" },
  { label: "Clothing & Fashion", emoji: "👗", color: "#f3e5f5" },
  { label: "Food & Beverages", emoji: "🍔", color: "#fff3e0" },
  { label: "Hardware", emoji: "🔧", color: "#efebe9" },
  { label: "Stationery", emoji: "✏️", color: "#f1f8e9" },
  { label: "Beauty & Cosmetics", emoji: "💄", color: "#fce4ec" },
  { label: "Sports & Fitness", emoji: "🏋️", color: "#e0f7fa" },
  { label: "Books", emoji: "📚", color: "#f9fbe7" },
  { label: "Toys & Games", emoji: "🎮", color: "#ede7f6" },
];

const PROMOS = [
  { bg: "linear-gradient(135deg,#1a9c3e,#0d5c24)", title: "50% OFF UNLOCKED", sub: "FREE DELIVERY • Use Code: TRY50", badge: "🎉" },
  { bg: "linear-gradient(135deg,#f59e0b,#d97706)", title: "ORDER ABOVE ₹199", sub: "Get free delivery on your first order!", badge: "🚀" },
  { bg: "linear-gradient(135deg,#6366f1,#4f46e5)", title: "NEW ARRIVALS", sub: "Fresh products added this week!", badge: "✨" },
];

// Skeleton Loader Components
const StoreSkeleton = () => (
  <div style={{ flexShrink: 0, width: 160, background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
    <div style={{ height: 90, background: "#e5e7eb", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
    <div style={{ padding: "10px 12px" }}>
      <div style={{ height: 16, background: "#e5e7eb", borderRadius: 4, marginBottom: 8, width: "80%", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
      <div style={{ height: 20, background: "#e5e7eb", borderRadius: 20, width: "60%", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
    <div style={{ height: 130, background: "#e5e7eb", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
    <div style={{ padding: "10px 12px" }}>
      <div style={{ height: 16, background: "#e5e7eb", borderRadius: 4, marginBottom: 8, width: "80%", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
      <div style={{ height: 20, background: "#e5e7eb", borderRadius: 4, width: "40%", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
    </div>
  </div>
);

export default function UserDashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [location, setLocation] = useState("Detecting...");
  const [search, setSearch] = useState("");
  const [promoIdx, setPromoIdx] = useState(0);
  const [loading, setLoading] = useState({ stores: true, featured: true });
  const [error, setError] = useState({ stores: null, featured: null });
  const searchRef = useRef();

  // Memoize functions to prevent unnecessary re-renders
  const loadCartCount = useCallback(() => {
    try {
      const c = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(Array.isArray(c) ? c.reduce((s, i) => s + (i.quantity || 0), 0) : 0);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartCount(0);
    }
  }, []);

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation("Location unavailable");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(`http://localhost:5000/api/users/geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          if (!r.ok) throw new Error('Geocoding failed');
          const d = await r.json();
          setLocation(d.address?.city || d.address?.town || d.address?.village || "Your City");
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocation("Location found");
        }
      },
      () => setLocation("Location denied"),
      { timeout: 10000 }
    );
  }, []);

  // Get user initial safely
  const getUserInitial = useCallback(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const name = userData?.name || "User";
      return name.charAt(0).toUpperCase();
    } catch (error) {
      console.error("Error parsing user data:", error);
      return "U";
    }
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(prev => ({ ...prev, stores: true }));
        const response = await PUBLIC.get("/stores/public");
        const d = response.data;
        setStores(Array.isArray(d) ? d : d?.stores || d?.data || []);
        setError(prev => ({ ...prev, stores: null }));
      } catch (error) {
        console.error("Error fetching stores:", error);
        setError(prev => ({ ...prev, stores: "Failed to load stores" }));
        setStores([]);
      } finally {
        setLoading(prev => ({ ...prev, stores: false }));
      }
    };

    const fetchFeatured = async () => {
      try {
        setLoading(prev => ({ ...prev, featured: true }));
        const response = await PUBLIC.get("/inventory/public?featured=true");
        const d = response.data;
        setFeatured(Array.isArray(d) ? d : d?.products || d?.data || []);
        setError(prev => ({ ...prev, featured: null }));
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setError(prev => ({ ...prev, featured: "Failed to load featured products" }));
        setFeatured([]);
      } finally {
        setLoading(prev => ({ ...prev, featured: false }));
      }
    };

    fetchStores();
    fetchFeatured();
    loadCartCount();
    getLocation();

    const t = setInterval(() => setPromoIdx(i => (i + 1) % PROMOS.length), 3500);
    
    const onCart = () => loadCartCount();
    const onOpen = () => setCartOpen(true);
    
    window.addEventListener("cartUpdated", onCart);
    window.addEventListener("openCartDrawer", onOpen);
    
    return () => { 
      clearInterval(t); 
      window.removeEventListener("cartUpdated", onCart); 
      window.removeEventListener("openCartDrawer", onOpen); 
    };
  }, [loadCartCount, getLocation]); // Added dependencies

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/category/${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f5f5f0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      {/* Add keyframe animations for skeleton loading */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}
      </style>

      {/* TOP NAV */}
      <div style={{ background: "#1a9c3e", padding: "14px 16px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "white" }}>
              <span style={{ fontWeight: 800, fontSize: 20 }}>10 Minutes</span>
              <IoFlash color="#facc15" size={18} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }}>
              <FaMapMarkerAlt size={11} />
              <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{location}</span>
              <FaChevronDown size={10} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div 
              onClick={() => setCartOpen(true)} 
              style={{ position: "relative", background: "rgba(255,255,255,0.15)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              aria-label="Shopping cart"
            >
              <FaShoppingCart color="white" size={17} />
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cartCount}
                </span>
              )}
            </div>
            <div 
              onClick={() => navigate("/profile")} 
              style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 800, color: "white", fontSize: 16 }}
              aria-label="Profile"
            >
              {getUserInitial()}
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ background: "white", borderRadius: "14px 14px 0 0", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <FaSearch color="#9ca3af" size={15} />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder='Search products, stores...'
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#374151", background: "transparent" }}
            aria-label="Search"
          />
        </div>
      </div>

      {/* PROMO BANNER */}
      <div style={{ margin: "0 16px 16px", marginTop: 12, borderRadius: 16, overflow: "hidden", position: "relative" }}>
        {PROMOS.map((p, index) => (
          <div 
            key={`promo-${index}`} // Added prefix for uniqueness
            style={{
              display: index === promoIdx ? "flex" : "none",
              background: p.bg, padding: "20px 20px", borderRadius: 16,
              alignItems: "center", justifyContent: "space-between", minHeight: 110,
              transition: "all 0.3s"
            }}
          >
            <div>
              <div style={{ color: "#facc15", fontWeight: 900, fontSize: 24, lineHeight: 1.1 }}>{p.title}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 6 }}>{p.sub}</div>
            </div>
            <div style={{ fontSize: 48 }}>{p.badge}</div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
          {PROMOS.map((_, index) => (
            <div 
              key={`promo-dot-${index}`} // Added prefix for uniqueness
              onClick={() => setPromoIdx(index)} 
              style={{ 
                width: index === promoIdx ? 20 : 6, 
                height: 6, 
                borderRadius: 3, 
                background: index === promoIdx ? "#1a9c3e" : "#d1d5db", 
                cursor: "pointer", 
                transition: "all 0.3s" 
              }}
              aria-label={`Go to promo ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* CATEGORIES SCROLL */}
      <div style={{ padding: "0 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <div 
              key={`category-${cat.label}`} // Using label as key since it's unique
              onClick={() => navigate(`/category/${encodeURIComponent(cat.label)}`)}
              style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: cat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                {cat.emoji}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", textAlign: "center", maxWidth: 64, lineHeight: 1.2 }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STORES SECTION */}
      <div style={{ padding: "0 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#111827" }}>Stores Near You</div>
            <div style={{ fontSize: 12, color: "#1a9c3e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <FaFire size={11} /> Trending near you
            </div>
          </div>
          <span 
            onClick={() => navigate("/stores")} 
            style={{ color: "#1a9c3e", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            View all &gt;
          </span>
        </div>
        
        {error.stores && (
          <div style={{ color: "#ef4444", textAlign: "center", padding: "20px" }}>
            {error.stores}
          </div>
        )}
        
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {loading.stores ? (
            // Show skeleton loaders
            <>
              <StoreSkeleton />
              <StoreSkeleton />
              <StoreSkeleton />
            </>
          ) : (
            stores.map(store => (
              <div 
                key={store._id} 
                onClick={() => navigate(`/shop/${store._id}`)}
                style={{ flexShrink: 0, width: 160, background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer" }}
              >
                <div style={{ height: 90, background: "linear-gradient(135deg,#1a9c3e,#0d5c24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                  🏪
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 4 }}>{store.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(store.categories || []).slice(0, 1).map(c => (
                      <span 
                        key={`${store._id}-${c}`} // Using store ID + category for uniqueness
                        style={{ background: "#e8f5e9", color: "#1a9c3e", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                    <FaStar color="#facc15" size={11} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>4.5 • 15 min</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div style={{ padding: "0 16px", marginBottom: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#111827" }}>Featured Products</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Handpicked for you</div>
          </div>
        </div>

        {error.featured && (
          <div style={{ color: "#ef4444", textAlign: "center", padding: "20px" }}>
            {error.featured}
          </div>
        )}

          <div style={{ 
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 12
}}>
          {loading.featured ? (
            // Show skeleton loaders
            <>
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </>
          ) : (
            featured.slice(0, 6).map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </div>

      {/* BOTTOM OFFER BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, zIndex: 40 }}>
        <div style={{ background: "#1a9c3e", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 14, color: "white" }}>%</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#1a9c3e" }}>50% upto ₹150 off</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>USE TRY50 | ABOVE ₹99</div>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const addToCart = (e) => {
    e.stopPropagation();

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const pid = product._id;
      const existing = cart.find(p => p._id === pid);
      const price = product.discount_price || product.price;

      const newCart = existing
        ? cart.map(p =>
            p._id === pid ? { ...p, quantity: (p.quantity || 0) + 1 } : p
          )
        : [
            ...cart,
            {
              ...product,
              _id: pid,
              price,
              quantity: 1,
              name: product.name,
              image: product.image
            }
          ];

      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("cartUpdated"));
      setTimeout(() => window.dispatchEvent(new Event("openCartDrawer")), 100);

    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      style={{
        background: "white",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        cursor: "pointer",
        padding: 10
      }}
    >

      {/* IMAGE */}
      <div
        style={{
          position: "relative",
          height: 90,
          background: "#f9fafb",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {product.image && !imageError ? (
          <img
            src={`http://localhost:5000/uploads/${product.image}`}
            alt={product.name}
            style={{
              width: "100%",
              height: "80px",
              objectFit: "contain"
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <span style={{ fontSize: 28 }}>📦</span>
        )}

        {/* ADD BUTTON */}
        <button
          onClick={addToCart}
          style={{
            position: "absolute",
            bottom: -10,
            right: -10,
            background: "#1a9c3e",
            color: "white",
            border: "none",
            borderRadius: 8,
            width: 28,
            height: 28,
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 3px 8px rgba(0,0,0,0.15)"
          }}
        >
          +
        </button>
      </div>

      {/* PRODUCT INFO */}
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 12,
            color: "#111827",
            height: 32,
            overflow: "hidden"
          }}
        >
          {product.name}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>
            ₹{product.discount_price || product.price}
          </span>

          {product.discount_price && (
            <span
              style={{
                fontSize: 10,
                textDecoration: "line-through",
                color: "#9ca3af"
              }}
            >
              ₹{product.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}