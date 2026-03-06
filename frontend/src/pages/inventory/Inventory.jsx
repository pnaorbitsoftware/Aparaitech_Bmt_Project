import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { Plus, Upload, Search, Star, AlertTriangle, X, Save, PackageOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LOW_STOCK_THRESHOLD = 5;

function Inventory() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  /* ── state ── */
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [storeFilter, setStoreFilter] = useState(""); // super_admin only
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const emptyForm = { name: "", sku: "", category: "", price: "", discount_price: "", stock: "", reorder_level: "5", expiryDate: "", is_featured: false };
  const [form, setForm] = useState(emptyForm);

  /* ── load ── */
  useEffect(() => {
    loadProducts();
    if (isSuperAdmin) loadStores();
  }, [storeFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const url = storeFilter ? `/inventory?storeId=${storeFilter}` : "/inventory";
      const res = await API.get(url);
      setProducts(res.data.map(p => ({ ...p, price: Number(p.price), stock: Number(p.stock) })));
    } catch {
      alert("Failed to load inventory ❌");
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      const res = await API.get("/stores");
      setStores(res.data.data || []);
    } catch { console.error("Failed to load stores"); }
  };

  /* ── derived ── */
  const allCategories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  const lowStockCount = products.filter(p => p.isLowStock).length;

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchLow = !showLowStockOnly || p.isLowStock;
    return matchSearch && matchCat && matchLow;
  });

  /* ── CRUD ── */
  const handleAdd = async () => {
    try {
      if (!form.name || !form.sku || !form.category || !form.price || !form.stock) {
        alert("Please fill all required fields"); return;
      }
      await API.post("/inventory", {
        ...form,
        price: Number(form.price),
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        stock: Number(form.stock),
        reorder_level: Number(form.reorder_level) || 5,
        expiryDate: form.expiryDate || null,
      });
      setShowAdd(false);
      setForm(emptyForm);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Add product failed ❌");
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/inventory/${editProduct.id}`, {
        ...editProduct,
        price: Number(editProduct.price),
        discount_price: editProduct.discount_price ? Number(editProduct.discount_price) : null,
        stock: Number(editProduct.stock),
        reorder_level: Number(editProduct.reorder_level) || 5,
        expiryDate: editProduct.expiryDate || null,
      });
      setShowEdit(false);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this product?")) return;
    try {
      await API.delete(`/inventory/${id}`);
      loadProducts();
    } catch { alert("Delete failed ❌"); }
  };

  const handleToggleFeatured = async (p) => {
    try {
      await API.put(`/inventory/${p.id}`, {
        name: p.name, sku: p.sku, category: p.category,
        price: p.price, stock: p.stock,
        is_featured: !p.is_featured
      });
      loadProducts();
    } catch { alert("Failed to update featured status"); }
  };

  return (
    <div className="space-y-6 p-2">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSuperAdmin ? "All stores' products" : "Your store's products"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button onClick={() => navigate("/inventory/bulk-upload")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">
              <Upload size={16} /> Bulk Upload
            </button>
            <button onClick={() => { setForm(emptyForm); setShowAdd(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
              <Plus size={16} /> Add Product
            </button>
          </div>
        )}
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length} color="indigo" />
        <StatCard label="Categories" value={allCategories.length - 1} color="purple" />
        <StatCard
          label="Low Stock" value={lowStockCount} color="red"
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          active={showLowStockOnly}
        />
        <StatCard label="Featured" value={products.filter(p => p.is_featured).length} color="yellow" />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by name or SKU..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="outline-none text-sm flex-1 text-slate-700 placeholder:text-slate-400"
          />
          {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-slate-400" /></button>}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                categoryFilter === cat
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-green-300"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Super admin: store filter */}
        {isSuperAdmin && (
          <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">All Stores</option>
            {stores.map(s => (
              <option key={s._id} value={s._id}>{s.name} — {s.admin?.name || "No admin"}</option>
            ))}
          </select>
        )}

        {/* Low stock toggle */}
        {lowStockCount > 0 && (
          <button onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showLowStockOnly
                ? "bg-red-500 text-white border-red-500"
                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {lowStockCount} Low Stock
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No products found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">Disc. Price</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Expiry</th>
                {isSuperAdmin && <th className="p-4 text-left">Store</th>}
                {isAdmin && <th className="p-4 text-center">Featured</th>}
                {isAdmin && <th className="p-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={`border-t hover:bg-slate-50 transition ${p.isLowStock ? "bg-red-50/50" : ""}`}>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      {p.name}
                      {p.isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500" title="Low stock" />}
                    </div>
                    <div className="text-xs text-slate-400">{p.sku}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">{p.category}</span>
                  </td>
                  <td className="p-4 text-right font-semibold">₹{Number(p.price).toFixed(2)}</td>
                  <td className="p-4 text-right text-green-600 font-semibold">
                    {p.discount_price ? `₹${Number(p.discount_price).toFixed(2)}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-bold text-sm ${p.isLowStock ? "text-red-600" : "text-slate-700"}`}>{p.stock}</span>
                    {p.isLowStock && <div className="text-xs text-red-400">Min: {p.reorder_level}</div>}
                  </td>
                  <td className="p-4 text-center"><ExpiryBadge expiryDate={p.expiryDate} /></td>
                  {isSuperAdmin && (
                    <td className="p-4 text-sm text-slate-500">{p.storeId?.name || <span className="text-slate-300">—</span>}</td>
                  )}
                  {isAdmin && (
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggleFeatured(p)} title={p.is_featured ? "Remove featured" : "Mark featured"}
                        className={`transition ${p.is_featured ? "text-yellow-500" : "text-slate-300 hover:text-yellow-400"}`}>
                        <Star className="w-5 h-5" fill={p.is_featured ? "currentColor" : "none"} />
                      </button>
                    </td>
                  )}
                  {isAdmin && (
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setEditProduct(p); setShowEdit(true); }}
                          className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="text-xs font-medium text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition">
                          🗑 Archive
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <ProductModal title="Add Product" onClose={() => setShowAdd(false)}>
          <ProductForm product={form} setProduct={setForm} onSubmit={handleAdd} submitLabel="Add Product" />
        </ProductModal>
      )}

      {/* EDIT MODAL */}
      {showEdit && editProduct && (
        <ProductModal title="Edit Product" onClose={() => setShowEdit(false)}>
          <ProductForm product={editProduct} setProduct={setEditProduct} onSubmit={handleUpdate} submitLabel="Save Changes" />
        </ProductModal>
      )}
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, color, onClick, active }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600", purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600", yellow: "bg-yellow-50 text-yellow-600"
  };
  return (
    <div onClick={onClick}
      className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${onClick ? "cursor-pointer hover:shadow-md transition" : ""} ${active ? "ring-2 ring-red-400" : "border-slate-200"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <span className="text-xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );
}

/* ── Expiry Badge ── */
function ExpiryBadge({ expiryDate }) {
  if (!expiryDate) return <span className="text-slate-300 text-xs">—</span>;
  const days = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
  if (days <= 0) return <span className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-600 font-semibold">Expired</span>;
  if (days <= 7) return <span className="px-2.5 py-1 text-xs rounded-full bg-orange-100 text-orange-600 font-semibold">Near Expiry</span>;
  return <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-600 font-semibold">Safe</span>;
}

/* ── Modal wrapper ── */
function ProductModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Product Form ── */
function ProductForm({ product, setProduct, onSubmit, submitLabel }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [storeCategories, setStoreCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (user?.role === "admin") {
          const res = await API.get("/stores/my-store");
          setStoreCategories(res.data?.data?.categories || []);
        } else if (user?.role === "super_admin") {
          const res = await API.get("/stores");
          const cats = [...new Set((res.data.data || []).flatMap(s => s.categories || []))];
          setStoreCategories(cats);
        }
      } catch {
        setStoreCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const FALLBACK_CATEGORIES = [
    "Fruits", "Vegetables", "Dairy", "Bakery", "Pantry",
    "Beverages", "Snacks", "Frozen", "Stationery", "Personal Care"
  ];

  // Use store categories if available, else fallback
  const categories = storeCategories.length > 0 ? storeCategories : FALLBACK_CATEGORIES;

  return (
    <div className="space-y-3">
      {[
        { label: "Product Name *", key: "name", placeholder: "e.g. Basmati Rice 1kg" },
        { label: "SKU *", key: "sku", placeholder: "e.g. RICE-BAS-1KG" },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
          <input className="border border-slate-200 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
            placeholder={f.placeholder} value={product[f.key]}
            onChange={e => setProduct({ ...product, [f.key]: e.target.value })}
          />
        </div>
      ))}

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
        <input list="cat-options"
          className="border border-slate-200 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
          placeholder="Select or type category"
          value={product.category}
          onChange={e => setProduct({ ...product, category: e.target.value })}
        />
        <datalist id="cat-options">
          {categories.map(c => <option key={c} value={c} />)}
        </datalist>
        {storeCategories.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">⚠ No store categories set — showing defaults. Add categories to your store first.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Price (₹) *", key: "price", placeholder: "0.00" },
          { label: "Discount Price (₹)", key: "discount_price", placeholder: "optional" },
          { label: "Stock *", key: "stock", placeholder: "0" },
          { label: "Low Stock Alert at", key: "reorder_level", placeholder: "5" },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
            <input type="number" min="0"
              className="border border-slate-200 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder={f.placeholder} value={product[f.key] ?? ""}
              onChange={e => setProduct({ ...product, [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date</label>
        <input type="date"
          className="border border-slate-200 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
          value={product.expiryDate ? product.expiryDate.substring(0, 10) : ""}
          onChange={e => setProduct({ ...product, expiryDate: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
        <input type="checkbox" id="featured" checked={product.is_featured || false}
          onChange={e => setProduct({ ...product, is_featured: e.target.checked })}
          className="w-4 h-4 accent-yellow-500"
        />
        <label htmlFor="featured" className="text-sm font-medium text-yellow-700 flex items-center gap-1.5 cursor-pointer">
          <Star className="w-4 h-4" fill="currentColor" /> Mark as Featured Product
        </label>
      </div>

      <button onClick={onSubmit}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition">
        <Save className="w-4 h-4" /> {submitLabel}
      </button>
    </div>
  );
}

export default Inventory;