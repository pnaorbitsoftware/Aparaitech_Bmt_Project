import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import {
  Store, Search, MapPin, Phone, Mail,
  UserCheck, ToggleLeft, ToggleRight, ChevronRight,
  X, CheckCircle, Building2, AlertCircle, Tag, Pencil
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

function Stores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [editForm, setEditForm] = useState({
    name: "", phone: "", email: "",
    categories: [],
    street: "", city: "", state: "", pincode: ""
  });

  useEffect(() => { fetchStores(); }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await API.get("/stores");
      setStores(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (store) => {
    setEditingStore(store);
    setEditForm({
      name: store.name || "",
      phone: store.phone || "",
      email: store.email || "",
      categories: store.categories || [],
      street: store.address?.street || "",
      city: store.address?.city || "",
      state: store.address?.state || "",
      pincode: store.address?.pincode || "",
    });
    setCustomCategory("");
    setShowEditModal(true);
  };

  const toggleCategory = (cat) => {
    setEditForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    if (editForm.categories.includes(trimmed)) {
      alert("Category already added");
      return;
    }
    setEditForm(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    setCustomCategory("");
  };

  const removeCategory = (cat) => {
    setEditForm(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== cat)
    }));
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
        address: {
          street: editForm.street,
          city: editForm.city,
          state: editForm.state,
          pincode: editForm.pincode,
        },
      });

      alert("Store updated successfully ✅");
      setShowEditModal(false);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update store");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStore = async (store) => {
    try {
      await API.put(`/stores/${store._id}`, { isActive: !store.isActive });
      fetchStores();
    } catch (err) {
      alert("Failed to update store status");
    }
  };

  // All unique categories across all stores for filter tabs
  const allCategories = ["All", ...new Set(stores.flatMap(s => s.categories || []).filter(Boolean))];

  const filtered = stores.filter(s => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.categories || []).some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = categoryFilter === "All" || (s.categories || []).includes(categoryFilter);
    return matchSearch && matchCategory;
  });

  const activeCount = stores.filter(s => s.isActive).length;
  const uniqueCatCount = new Set(stores.flatMap(s => s.categories || [])).size;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER — no Create button */}
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
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stores.length}</p>
            <p className="text-xs text-slate-400 font-medium">Total Stores</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
            <p className="text-xs text-slate-400 font-medium">Active</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{uniqueCatCount}</p>
            <p className="text-xs text-slate-400 font-medium">Categories</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, admin, city or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")}>
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* CATEGORY FILTER TABS */}
      {allCategories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                categoryFilter === cat
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
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
          {filtered.map((store) => (
            <StoreCard
              key={store._id}
              store={store}
              onToggle={handleToggleStore}
              onEdit={openEdit}
              onViewAdmin={() => store.admin?._id && navigate(`/store-admin/${store.admin._id}`)}
            />
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Edit Store</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Store Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Name *</label>
                <input type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              {/* CATEGORIES */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Categories
                  <span className="ml-2 text-xs text-slate-400 font-normal">Select all that apply</span>
                </label>

                {/* Preset category pills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        editForm.categories.includes(cat)
                          ? `${getCategoryColor(cat)} border-transparent`
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {editForm.categories.includes(cat) ? "✓ " : ""}{cat}
                    </button>
                  ))}
                </div>

                {/* Custom category input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom category..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
                    className="flex-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                  <button
                    onClick={addCustomCategory}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                  >
                    Add
                  </button>
                </div>

                {/* Selected categories display */}
                {editForm.categories.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2">Selected ({editForm.categories.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {editForm.categories.map(cat => (
                        <span
                          key={cat}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(cat)}`}
                        >
                          {cat}
                          <button
                            onClick={() => removeCategory(cat)}
                            className="hover:opacity-70 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                <div className="space-y-2">
                  <input type="text" placeholder="Street"
                    value={editForm.street}
                    onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="City"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <input type="text" placeholder="State"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <input type="text" placeholder="Pincode"
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-semibold transition text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== STORE CARD ===================== */
function StoreCard({ store, onToggle, onEdit, onViewAdmin }) {
  const address = store.address
    ? [store.address.street, store.address.city, store.address.state, store.address.pincode].filter(Boolean).join(", ")
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{store.name}</p>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                store.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
              }`}>
                {store.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(store)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
            title="Edit store"
          >
            <Pencil className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
          </button>
          <button onClick={() => onToggle(store)} title={store.isActive ? "Deactivate" : "Activate"}>
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
            <span key={cat} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(cat)}`}>
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="px-5 py-3 space-y-2">
        {address && (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{address}</span>
          </div>
        )}
        {store.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{store.phone}</span>
          </div>
        )}
        {store.email && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{store.email}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium truncate">
            {store.admin?.name || "No admin assigned"}
          </span>
        </div>
        {store.admin?._id && (
          <button
            onClick={onViewAdmin}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition shrink-0"
          >
            View Admin <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Stores;