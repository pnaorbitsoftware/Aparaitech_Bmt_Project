import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEye, FaEyeSlash, FaStore, FaUser, FaUsers, FaMotorcycle
} from "react-icons/fa";
import { API } from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("store");
  const [role, setRole] = useState("super_admin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("superadmin@example.com");
  const [password, setPassword] = useState("SuperAdmin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      /* ── DELIVERY PARTNER LOGIN ── */
      if (userType === "delivery") {
        const res = await axios.post("http://localhost:5000/api/delivery-partners/login", {
          phone: email.trim(),
          password: password.trim(),
        });
        const { token, partner } = res.data;
        localStorage.setItem("dp_token", token);
        localStorage.setItem("dp_user", JSON.stringify(partner));
        window.location.href = "/delivery-dashboard";
        return;
      }

      /* ── NORMAL / STORE LOGIN ── */
      const loginData = {
        email: email.trim(),
        password: password.trim(),
        role: userType === "store" ? role : "user",
      };

      console.log("📤 Sending login data:", loginData);
      const res = await API.post("/auth/login", loginData);
      console.log("📥 Login response:", res.data);

      const { token, user } = res.data;

      if (!token || !user) {
        setError("Invalid login response");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const userId = user?._id || user?.id;
      if (userId) localStorage.setItem("userId", userId);

      console.log("👤 User role:", user.role);

      setTimeout(() => {
        if (user.role === "super_admin") {
          window.location.href = "/super-admin-dashboard";
        } else if (user.role === "admin" || user.role === "staff") {
          window.location.href = "/dashboard";
        } else if (user.role === "user") {
          window.location.href = "/user-dashboard";
        } else {
          window.location.href = "/";
        }
      }, 100);

    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Auto-clear fields when switching tabs ── */
  const switchTab = (type) => {
    setUserType(type);
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-400">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-emerald-500 p-3 rounded-xl shadow-lg text-white">
            <FaStore size={22} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SmartStore</h1>
        </div>
        <p className="text-center text-gray-500 mb-6">Secure login portal</p>

        {/* USER TYPE TOGGLE */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button type="button" onClick={() => switchTab("normal")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium text-sm transition ${
              userType === "normal" ? "bg-emerald-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
            }`}>
            <FaUser /> User
          </button>

          <button type="button" onClick={() => switchTab("store")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium text-sm transition ${
              userType === "store" ? "bg-emerald-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
            }`}>
            <FaUsers /> Store
          </button>

          <button type="button" onClick={() => switchTab("delivery")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium text-sm transition ${
              userType === "delivery" ? "bg-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
            }`}>
            <FaMotorcycle /> Delivery
          </button>
        </div>

        {/* STORE ROLE TOGGLE */}
        {userType === "store" && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {["super_admin", "admin", "staff"].map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`py-2 rounded-xl text-sm font-semibold transition ${
                  role === r ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {r.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* DELIVERY INFO BANNER */}
        {userType === "delivery" && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-sm text-orange-700">
            🏍️ Login with your <strong>phone number</strong> and password set by your admin
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">
              {userType === "delivery" ? "Phone Number" : "Email"}
            </label>
            <input
              type={userType === "delivery" ? "tel" : "email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={userType === "delivery" ? "Enter your phone number" : "Enter your email"}
              className="w-full mt-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-400 outline-none"
              required
            />
          </div>

          <div className="relative">
            <label className="text-sm text-gray-600">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-400 outline-none"
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 cursor-pointer text-gray-500 hover:text-emerald-500">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" disabled={loading}
            className={`w-full mt-2 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition ${
              userType === "delivery"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}>
            {loading ? "Logging in..." : "Continue"}
          </button>

          {userType === "normal" && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <span onClick={() => navigate("/register")}
                  className="text-emerald-600 font-semibold cursor-pointer hover:underline">
                  Register
                </span>
              </p>
            </div>
          )}
        </form>

        {/* DEMO CREDENTIALS */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-emerald-600">Demo Credentials:</p>
          {userType === "delivery" ? (
            <p>Use phone number + password set by admin</p>
          ) : (
            <>
              <p>Super Admin: superadmin@example.com / SuperAdmin@123</p>
              <p>Admin: admin@example.com / password123</p>
              <p>Staff: staff@example.com / staff123</p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 SmartStore. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;