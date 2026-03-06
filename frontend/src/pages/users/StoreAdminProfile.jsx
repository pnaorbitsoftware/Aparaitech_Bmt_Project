import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import {
  Store, Users, Mail, Phone, Calendar, ArrowLeft,
  UserCircle, Briefcase, MapPin, Shield, Plus, X, CheckCircle
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

function StoreAdminProfile() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [staff, setStaff] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assign store modal
  const [showAssignStore, setShowAssignStore] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [storeForm, setStoreForm] = useState({
    name: "", phone: "", email: "",
    categories: [],
    street: "", city: "", state: "", pincode: ""
  });

  useEffect(() => { fetchAdminData(); }, [adminId]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/admins/${adminId}`);
      const json = res.data;
      if (!json.success) throw new Error(json.message);
      setAdmin(json.data.admin);
      setStore(json.data.store);
      setStaff(json.data.staff || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setStoreForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    if (storeForm.categories.includes(trimmed)) { alert("Already added"); return; }
    setStoreForm(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    setCustomCategory("");
  };

  const removeCategory = (cat) => {
    setStoreForm(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
  };

  const handleAssignStore = async () => {
    try {
      if (!storeForm.name) { alert("Store name is required"); return; }
      setAssigning(true);

      const res = await API.post("/stores", {
        name: storeForm.name,
        categories: storeForm.categories,
        phone: storeForm.phone,
        email: storeForm.email,
        address: {
          street: storeForm.street,
          city: storeForm.city,
          state: storeForm.state,
          pincode: storeForm.pincode,
        },
        adminId: adminId,
      });

      if (!res.data.success) throw new Error(res.data.message);
      alert("Store assigned successfully ✅");
      setShowAssignStore(false);
      setStoreForm({ name: "", phone: "", email: "", categories: [], street: "", city: "", state: "", pincode: "" });
      setCustomCategory("");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to assign store");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );
  if (error) return <div className="p-6 text-center text-red-500 font-medium">{error}</div>;
  if (!admin) return <div className="p-6 text-center text-slate-500">Admin not found.</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">

      {/* BACK */}
      <button onClick={() => navigate("/store-admins")} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Store Admins
      </button>

      {/* ADMIN HEADER CARD */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{admin.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-white flex-1">
              <h2 className="text-2xl font-bold">{admin.name}</h2>
              <p className="text-indigo-100 flex items-center gap-2 mt-1">
                <Briefcase className="w-4 h-4" /> Store Administrator
              </p>
              <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full ${admin.isActive ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                {admin.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CONTACT */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <UserCircle className="w-4 h-4" /> Contact Information
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /><span>{admin.email}</span></div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400" /><span>{admin.mobile || "Not provided"}</span></div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Joined {new Date(admin.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* STORE INFO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Store className="w-4 h-4" /> Store Information
              </h3>
              {!store && (
                <button
                  onClick={() => setShowAssignStore(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Store
                </button>
              )}
            </div>

            {store ? (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-gray-800">{store.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${store.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                    {store.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {/* Categories */}
                {store.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {store.categories.map(cat => (
                      <span key={cat} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(cat)}`}>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                {store.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span>{[store.address.street, store.address.city, store.address.state, store.address.pincode].filter(Boolean).join(", ") || "Address not provided"}</span>
                  </div>
                )}
                {store.phone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400" /><span>{store.phone}</span></div>}
                {store.email && <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /><span>{store.email}</span></div>}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Store className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400 font-medium">No store assigned yet</p>
                <p className="text-xs text-slate-300 mt-1">Click "Assign Store" to create one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <p className="text-blue-100 text-xs">Total Staff</p>
          <p className="text-3xl font-bold mt-1">{staff.length}</p>
          <Users className="w-6 h-6 text-blue-200 mt-2" />
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <p className="text-green-100 text-xs">Permissions</p>
          <p className="text-3xl font-bold mt-1">{admin.permissions?.length || 0}</p>
          <Shield className="w-6 h-6 text-green-200 mt-2" />
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <p className="text-purple-100 text-xs">Store Status</p>
          <p className="text-lg font-bold mt-1">{store ? (store.isActive ? "Active" : "Inactive") : "Not Assigned"}</p>
          <Store className="w-6 h-6 text-purple-200 mt-2" />
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <p className="text-orange-100 text-xs">Account</p>
          <p className="text-lg font-bold mt-1">{admin.isActive ? "Active" : "Inactive"}</p>
          <UserCircle className="w-6 h-6 text-orange-200 mt-2" />
        </div>
      </div>

      {/* STAFF LIST */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" /> Staff Members
          </h3>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
            {staff.length} members
          </span>
        </div>
        {staff.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No staff members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {staff.map((member) => (
              <div key={member._id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-indigo-600">{member.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(member.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSIGN STORE MODAL */}
      {showAssignStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">Assign Store to {admin.name}</h2>
              <button onClick={() => setShowAssignStore(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Name *</label>
                <input type="text" placeholder="e.g. SmartStore Pune"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* CATEGORIES */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Categories
                  <span className="ml-2 text-xs text-slate-400">Select all that apply</span>
                </label>

                {/* Preset pills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        storeForm.categories.includes(cat)
                          ? `${getCategoryColor(cat)} border-transparent`
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {storeForm.categories.includes(cat) ? "✓ " : ""}{cat}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
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

                {/* Selected tags */}
                {storeForm.categories.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2">Selected ({storeForm.categories.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {storeForm.categories.map(cat => (
                        <span key={cat} className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(cat)}`}>
                          {cat}
                          <button onClick={() => removeCategory(cat)} className="hover:opacity-70">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Phone</label>
                <input type="text" placeholder="Store contact number"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Email</label>
                <input type="email" placeholder="store@example.com"
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <div className="space-y-2">
                  <input type="text" placeholder="Street"
                    value={storeForm.street}
                    onChange={(e) => setStoreForm({ ...storeForm, street: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="City"
                      value={storeForm.city}
                      onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input type="text" placeholder="State"
                      value={storeForm.state}
                      onChange={(e) => setStoreForm({ ...storeForm, state: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <input type="text" placeholder="Pincode"
                    value={storeForm.pincode}
                    onChange={(e) => setStoreForm({ ...storeForm, pincode: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAssignStore}
                disabled={assigning}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {assigning ? "Assigning..." : "Assign Store"}
              </button>
              <button
                onClick={() => setShowAssignStore(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-lg font-semibold transition"
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

export default StoreAdminProfile;