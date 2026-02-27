import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaStore,
  FaUserShield,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { API } from "../services/api";

function Login() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [userType, setUserType] = useState("normal"); // normal | store
  const [role, setRole] = useState("super_admin"); // only for store users
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
        userType, // normal | store
        role: userType === "store" ? role : "user",
      });

      const { token, user } = res.data;

      if (!token || !user) {
        setError("Invalid login response");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err.response?.data?.message || "Server not reachable"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-400">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-emerald-500 p-3 rounded-xl shadow-lg text-white">
            <FaStore size={22} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            SmartStore
          </h1>
        </div>

        <p className="text-center text-gray-500 mb-6">
          Secure login portal
        </p>

        {/* ================= USER TYPE TOGGLE ================= */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setUserType("normal")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition
              ${
                userType === "normal"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
          >
            <FaUser /> Normal User
          </button>

          <button
            type="button"
            onClick={() => setUserType("store")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition
              ${
                userType === "store"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
          >
            <FaUsers /> Store User
          </button>
        </div>

        {/* ================= STORE ROLE TOGGLE ================= */}
        {userType === "store" && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("super_admin")}
              className={`py-2 rounded-xl text-sm font-semibold transition
                ${
                  role === "super_admin"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Super Admin
            </button>

            <button
              type="button"
              onClick={() => setRole("store_admin")}
              className={`py-2 rounded-xl text-sm font-semibold transition
                ${
                  role === "store_admin"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Store Admin
            </button>

            <button
              type="button"
              onClick={() => setRole("staff")}
              className={`py-2 rounded-xl text-sm font-semibold transition
                ${
                  role === "staff"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Staff
            </button>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* ================= FORM ================= */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-400 outline-none"
              required
            />
          </div>

          <div className="relative">
            <label className="text-sm text-gray-600">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-400 outline-none"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 cursor-pointer text-gray-500 hover:text-emerald-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition"
          >
            {loading ? "Logging in..." : "Continue"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 SmartStore. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;