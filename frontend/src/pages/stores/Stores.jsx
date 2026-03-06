import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import {
  Store, Search, MapPin, Phone, Mail, UserCheck,
  ToggleLeft, ToggleRight, ChevronRight, X, CheckCircle,
  Building2, AlertCircle, Tag, Pencil, Trash2, Users,
  Calendar, Eye, Save, ShoppingBag, TrendingUp
} from "lucide-react";

const PRESET_CATEGORIES = [
  "Grocery", "Pharmacy", "Electronics", "Clothing & Fashion",
  "Food & Beverages", "Hardware", "Stationery", "Beauty & Cosmetics",
  "Sports & Fitness", "Books", "Toys & Games",
];

const CATEGORY_COLORS = {
  "Grocery":            "bg-green-100 text-green-700",
  "Pharmacy":           "bg-blue-100 text-blue-700",
  "Electronics":        "bg-purple-100 text-purple-700",
  "Clothing & Fashion": "bg-pink-100 text-pink-700",
  "Food & Beverages":   "bg-orange-100 text-orange-700",
  "Hardware":           "bg-yellow-100 text-yellow-700",
  "Stationery":         "bg-cyan-100 text-cyan-700",
  "Beauty & Cosmetics": "bg-rose-100 text-rose-700",
  "Sports & Fitness":   "bg-teal-100 text-teal-700",
  "Books":              "bg-amber-100 text-amber-700",
  "Toys & Games":       "bg-indigo-100 text-indigo-700",
};

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || "bg-slate-100 text-slate-600";
}

export default function Stores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Detail drawer
  const [drawerStore, setDrawerStore] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [editForm, setEditForm] = useState({
    name: "", phone: "", email: "", adminId: "",
    categories: [], isActive: true,
    street: "", city: "", state: "", pincode: ""
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [storesRes, usersRes] = await Promise.all([
        API.get("/stores"),
        API.get("/users"),
      ]);
      setStores(storesRes.data.data || []);
      setAllAdmins((usersRes.data.data || []).filter(u => u.role === "admin"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Drawer ──
  const openDrawer = async (store) => {
    setDrawerStore(store);
    setDrawerData(null);
    setDrawerLoading(true);
    try {
      const res = await API.get(`/stores/${store._id}`);
      setDrawerData(res.data.data);
    } catch (err) {
      console.error("Failed to load store details:", err);
    } finally {
      setDrawerLoading(false);
    }
  };

  // ── Edit ──
  const openEdit = (store, e) => {
    e.stopPropagation();
    setEditingStore(store);
    setEditForm({
      name: store.name || "",
      phone: store.phone || "",
      email: store.email || "",
      adminId: store.admin?._id || "",
      categories: store.categories || [],
      isActive: store.isActive,
      street: store.address?.street || "",
      city: store.address?.city || "",
      state: store.address?.state || "",
      pincode: store.address?.pincode || "",
    });
    setCustomCategory("");
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    try {
      if (!editForm.name) { alert("Store name is required"); return; }
      setSubmitting(true);
      await API.put(`/stores/${editingStore._id}`, {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        categories: editForm.categories,
        isActive: editForm.isActive,
        adminId: editForm.adminId || undefined,
        address: {
          street: editForm.street,
          city: editForm.city,
          state: editForm.state,
          pincode: editForm.pincode,
        },
      });
      alert("Store updated ✅");
      setShowEdit(false);
      fetchAll();
      if (drawerStore?._id === editingStore._id) openDrawer(editingStore);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update store");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (store, e) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete "${store.name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/stores/${store._id}`);
      alert("Store deleted");
      fetchAll();
      if (drawerStore?._id === store._id) setDrawerStore(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete store");
    }
  };

  // ── Toggle active ──
  const handleToggle = async (store, e) => {
    e.stopPropagation();
    try {
      await API.put(`/stores/${store._id}`, { isActive: !store.isActive });
      fetchAll();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // ── Category helpers ──
  const toggleCat = (cat) => {
    setEditForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const addCustomCat = () => {
    const t = customCategory.trim();
    if (!t || editForm.categories.includes(t)) return;
    setEditForm(prev => ({ ...prev, categories: [...prev.categories, t] }));
    setCustomCategory("");
  };

  // ── Filters ──
  const allCategories = ["All", ...new Set(stores.flatMap(s => s.categories || []).filter(Boolean))];
  const filtered = stores.filter(s => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.categories || []).some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = categoryFilter === "All" || (s.categories || []).includes(categoryFilter);
    return matchSearch && matchCat;
  });

  const activeCount = stores.filter(s => s.isActive).length;
  const uniqueCatCount = new Set(stores.flatMap(s => s.categories || [])).size;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stores</h1>
          <p className="text-sm text-slate-500">View and manage all store locations</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Stores", value: stores.length, icon: <Store className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50" },
          { label: "Active", value: activeCount, icon: <CheckCircle className="w-5 h-5 text-green-500" />, bg: "bg-green-50" },
          { label: "Categories", value: uniqueCatCount, icon: <Tag className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input type="text" placeholder="Search by name, admin, city or category..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
        />
        {searchTerm && <button onClick={() => setSearchTerm("")}><X className="w-4 h-4 text-slate-400" /></button>}
      </div>

      {/* CATEGORY TABS */}
      {allCategories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                categoryFilter === cat
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* STORES GRID */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">No stores found</p>
          <p className="text-sm text-slate-300 mt-1">Stores are created from the Store Admin profile page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(store => (
            <StoreCard
              key={store._id}
              store={store}
              onView={() => openDrawer(store)}
              onEdit={(e) => openEdit(store, e)}
              onDelete={(e) => handleDelete(store, e)}
              onToggle={(e) => handleToggle(store, e)}
              onViewAdmin={() => store.admin?._id && navigate(`/store-admin/${store.admin._id}`)}
            />
          ))}
        </div>
      )}

      {/* ═══════════ EDIT MODAL ═══════════ */}
      {showEdit && editingStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Edit Store</h2>
              </div>
              <button onClick={() => setShowEdit(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Store Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Name *</label>
                <input type="text" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              {/* Change Admin */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Assigned Admin
                  <span className="ml-2 text-xs font-normal text-amber-600">⚠ Changing this reassigns the store</span>
                </label>
                <select value={editForm.adminId}
                  onChange={(e) => setEditForm({ ...editForm, adminId: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  <option value="">Select admin...</option>
                  {allAdmins.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.email}){!a.storeId || a._id === editingStore.admin?._id ? " ✓ available" : " — has store"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                <div className="flex gap-3">
                  {[true, false].map(val => (
                    <button key={String(val)} onClick={() => setEditForm({ ...editForm, isActive: val })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition ${
                        editForm.isActive === val
                          ? val ? "bg-green-500 text-white border-green-500" : "bg-red-500 text-white border-red-500"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}>
                      {val ? "Active" : "Inactive"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Categories <span className="text-xs text-slate-400 font-normal ml-1">Select all that apply</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => toggleCat(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        editForm.categories.includes(cat)
                          ? `${getCategoryColor(cat)} border-transparent`
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}>
                      {editForm.categories.includes(cat) ? "✓ " : ""}{cat}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add custom category..."
                    value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomCat()}
                    className="flex-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                  <button onClick={addCustomCat}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
                    Add
                  </button>
                </div>
                {editForm.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editForm.categories.map(cat => (
                      <span key={cat} className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(cat)}`}>
                        {cat}
                        <button onClick={() => setEditForm(p => ({ ...p, categories: p.categories.filter(c => c !== cat) }))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input type="text" value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                <div className="space-y-2">
                  <input type="text" placeholder="Street" value={editForm.street}
                    onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {["city", "state", "pincode"].map(f => (
                      <input key={f} type="text" placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                        value={editForm[f]} onChange={(e) => setEditForm({ ...editForm, [f]: e.target.value })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={handleUpdate} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50">
                <Save className="w-4 h-4" /> {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setShowEdit(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-semibold transition text-slate-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ DETAIL DRAWER ═══════════ */}
      {drawerStore && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30" onClick={() => setDrawerStore(null)} />

          {/* Drawer panel */}
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">

            {/* Drawer header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setDrawerStore(null)} className="text-white/80 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { setDrawerStore(null); openEdit(drawerStore, e); }}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Store
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{drawerStore.name}</h2>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(drawerStore.categories || []).map(cat => (
                      <span key={cat} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{cat}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {drawerLoading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : drawerData ? (
              <div className="p-6 space-y-6">

                {/* Status + Created */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <span className={`text-sm font-bold ${drawerData.store.isActive ? "text-green-600" : "text-red-500"}`}>
                      {drawerData.store.isActive ? "● Active" : "● Inactive"}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Created</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(drawerData.store.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Perf stats — placeholder until billing API is wired */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" /> Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Orders", value: drawerData.store.totalOrders ?? "—", icon: <ShoppingBag className="w-4 h-4 text-blue-500" /> },
                      { label: "Total Revenue", value: drawerData.store.totalRevenue ? `₹${drawerData.store.totalRevenue}` : "—", icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                        {s.icon}
                        <div>
                          <p className="text-lg font-bold text-slate-800">{s.value}</p>
                          <p className="text-xs text-slate-400">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Contact & Address</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    {drawerData.store.phone && (
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{drawerData.store.phone}</div>
                    )}
                    {drawerData.store.email && (
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />{drawerData.store.email}</div>
                    )}
                    {drawerData.store.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span>{[drawerData.store.address.street, drawerData.store.address.city, drawerData.store.address.state, drawerData.store.address.pincode].filter(Boolean).join(", ") || "No address"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Admin */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-500" /> Assigned Admin
                  </h3>
                  {drawerData.store.admin ? (
                    <div className="flex items-center justify-between bg-indigo-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                          {drawerData.store.admin.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{drawerData.store.admin.name}</p>
                          <p className="text-xs text-slate-500">{drawerData.store.admin.email}</p>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/store-admin/${drawerData.store.admin._id}`)}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 bg-slate-50 rounded-xl p-4">No admin assigned</p>
                  )}
                </div>

                {/* Staff */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" /> Staff
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-1">
                      {drawerData.staff?.length || 0}
                    </span>
                  </h3>
                  {!drawerData.staff?.length ? (
                    <p className="text-sm text-slate-400 bg-slate-50 rounded-xl p-4">No staff members yet</p>
                  ) : (
                    <div className="space-y-2">
                      {drawerData.staff.map(member => (
                        <div key={member._id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                              {member.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                              <p className="text-xs text-slate-400">{member.email}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* History */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs text-slate-500">
                  <p className="font-semibold text-slate-600 text-sm mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> History
                  </p>
                  <p>📅 Created on {new Date(drawerData.store.createdAt).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  {drawerData.store.createdBy && <p>👤 Created by {drawerData.store.createdBy.name}</p>}
                  <p>🔄 Last updated {new Date(drawerData.store.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(drawerStore, e)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-xl font-semibold transition text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete Store Permanently
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ STORE CARD ═══════════ */
function StoreCard({ store, onView, onEdit, onDelete, onToggle, onViewAdmin }) {
  const address = store.address
    ? [store.address.city, store.address.state].filter(Boolean).join(", ")
    : null;

  return (
    <div
      onClick={onView}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{store.name}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${store.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
              {store.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded-lg transition" title="Edit">
            <Pencil className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg transition" title="Delete">
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
          </button>
          <button onClick={onToggle} title={store.isActive ? "Deactivate" : "Activate"}>
            {store.isActive
              ? <ToggleRight className="w-7 h-7 text-green-500" />
              : <ToggleLeft className="w-7 h-7 text-slate-300" />
            }
          </button>
        </div>
      </div>

      {/* Categories */}
      {store.categories?.length > 0 && (
        <div className="px-5 pt-3 flex flex-wrap gap-1.5">
          {store.categories.map(cat => (
            <span key={cat} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(cat)}`}>{cat}</span>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="px-5 py-3 space-y-2">
        {address && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" /><span>{address}</span>
          </div>
        )}
        {store.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" /><span>{store.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium truncate">{store.admin?.name || "No admin"}</span>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={onView} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            <Eye className="w-3.5 h-3.5" /> Details
          </button>
        </div>
      </div>
    </div>
  );
}