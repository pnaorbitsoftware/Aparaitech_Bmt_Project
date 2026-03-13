import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import UserTopbar from "../../components/user/UserTopbar";

const PUBLIC = axios.create({ baseURL: "http://localhost:5000/api" });

export default function Category() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, [decodedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Check if it's a known category or a search term
      const knownCategories = ["Grocery", "Pharmacy", "Electronics", "Clothing & Fashion", 
        "Food & Beverages", "Hardware", "Stationery", "Beauty & Cosmetics", 
        "Sports & Fitness", "Books", "Toys & Games"];
      
      let res;
      if (knownCategories.includes(decodedCategory)) {
        // Known category — filter by category
        res = await PUBLIC.get(`/products/category/${encodeURIComponent(decodedCategory)}`);
      } else {
        // Search term — search by product name
        res = await PUBLIC.get(`/inventory/public?search=${encodeURIComponent(decodedCategory)}`);
      }
      setProducts(res.data || []);
    } catch (error) {
      console.error(error);
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
    const existing = cart.find(p => p._id === product._id);
    const newCart = existing
      ? cart.map(p => p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p)
      : [...cart, { ...product, quantity: 1 }];
    updateCart(newCart);
    setTimeout(() => window.dispatchEvent(new Event("openCartDrawer")), 100);
  };

  const decreaseQty = (product) => {
    const updated = cart
      .map(p => p._id === product._id ? { ...p, quantity: p.quantity - 1 } : p)
      .filter(p => p.quantity > 0);
    updateCart(updated);
  };

  const getQty = (id) => {
    const item = cart.find(p => p._id === id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserTopbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800">{decodedCategory}</h1>
          <p className="text-slate-500 mt-1">{products.length} products found</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-xl mb-3" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-xl font-semibold">No products in {decodedCategory} yet</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => {
              const qty = getQty(product._id);
              return (
                <div key={product._id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  {/* Product image */}
                  <div className="h-32 bg-purple-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-xl" />
                      : <span className="text-4xl">📦</span>
                    }
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-xs text-slate-400 mb-2">{product.sku}</p>

                  {/* Price */}
                  <div className="mb-3">
                    {product.discount_price ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-purple-700">₹{product.discount_price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
                      </div>
                    ) : (
                      <span className="font-black text-purple-700">₹{product.price}</span>
                    )}
                  </div>

                  {/* Stock warning */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <p className="text-xs text-orange-500 mb-2">Only {product.stock} left!</p>
                  )}
                  {product.stock === 0 && (
                    <p className="text-xs text-red-500 mb-2 font-semibold">Out of stock</p>
                  )}

                  {/* Add to cart */}
                  {product.stock === 0 ? (
                    <button disabled className="w-full border border-gray-200 text-gray-400 py-1.5 rounded-full text-sm cursor-not-allowed">
                      Unavailable
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