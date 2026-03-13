import { useState, useRef, useEffect } from "react";
import {
  FaUserCircle, FaClipboardList, FaSignOutAlt,
  FaEdit, FaTimes, FaShieldAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API } from "../../services/api";

export default function Profile() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setForm({ name: u.name || "", email: u.email || "", mobile: u.mobile || "" });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMsg("");
      const res = await API.put(`/users/profile`, form);
      const updated = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setMsg("Profile updated!");
      setTimeout(() => { setMsg(""); setShowEdit(false); }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Profile Button */}
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || <FaUserCircle />}
        </div>
        <span className="hidden sm:block text-sm font-medium">{user?.name?.split(" ")[0] || "Account"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b bg-purple-50 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500">{user?.email || user?.mobile || ""}</p>
            </div>
            <button onClick={() => { setShowEdit(true); setOpen(false); }}
              className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-600 transition">
              <FaEdit size={14} />
            </button>
          </div>

          {/* Menu */}
          <div className="flex flex-col py-1">
            <button onClick={() => { navigate("/my-orders"); setOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-slate-700 transition">
              <FaClipboardList className="text-purple-500" /> My Orders
            </button>

            <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-slate-700 transition">
              <FaShieldAlt className="text-purple-500" /> Account Privacy
            </button>

            <button onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 text-sm transition">
              <FaSignOutAlt /> Log Out
            </button>
          </div>

          {/* QR */}
          <div className="border-t p-4 flex items-center gap-3 bg-gray-50">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=smartstore"
              alt="QR" className="w-14 h-14 rounded-lg" />
            <div className="text-xs text-gray-600">
              <p className="font-semibold">Download SmartStore</p>
              <p className="text-gray-400">Scan QR to get the app</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-slate-800">Edit Profile</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <FaTimes />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Mobile", key: "mobile", type: "tel" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">{f.label}</label>
                  <input type={f.type} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              ))}

              {msg && (
                <p className={`text-sm text-center font-semibold ${msg.includes("!") ? "text-green-600" : "text-red-500"}`}>
                  {msg}
                </p>
              )}

              <button onClick={saveProfile} disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}