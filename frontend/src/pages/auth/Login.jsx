import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaStore, FaUser, FaMotorcycle } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";

const API_BASE = axios.create({ baseURL: "http://localhost:5000/api" });

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (tab === "delivery") {
      if (!phone || !password) { setError("Enter phone and password"); return; }
    } else {
      if (!email || !password) { setError("Enter email and password"); return; }
    }
    try {
      setLoading(true);
      if (tab === "delivery") {
        const res = await API_BASE.post("/delivery-partners/login", { phone, password });
        localStorage.setItem("dp_token", res.data.token);
        localStorage.setItem("dp_user", JSON.stringify(res.data.partner));
        navigate("/delivery-dashboard");
      } else {
        const res = await API_BASE.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        const role = res.data.user?.role;
        if (role === "user") navigate("/user-dashboard");
        else if (role === "super_admin") navigate("/super-admin-dashboard");
        else navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "user", label: "User", icon: <FaUser size={13} /> },
    { id: "store", label: "Store", icon: <FaStore size={13} /> },
    { id: "delivery", label: "Delivery", icon: <FaMotorcycle size={13} /> },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg,#1a9c3e,#0d5c24)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(26,156,62,0.3)" }}>
            <IoFlash color="#facc15" size={32} />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: "#111", margin: 0 }}>SmartStore</h1>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>10 minute delivery ⚡</p>
        </div>

        {/* CARD */}
        <div style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: "#111", marginBottom: 4, marginTop: 0 }}>Welcome back 👋</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 20, marginTop: 0 }}>Sign in to continue</p>

          {/* TABS */}
          <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setError(""); setEmail(""); setPassword(""); setPhone(""); }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 9, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", background: tab === t.id ? "white" : "transparent", color: tab === t.id ? "#1a9c3e" : "#6b7280", boxShadow: tab === t.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* FIELDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {tab === "delivery" ? (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="10 digit phone" type="tel"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#1a9c3e"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#1a9c3e"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" type={showPass ? "text" : "password"}
                  style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#1a9c3e"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", background: loading ? "#9ca3af" : "linear-gradient(135deg,#1a9c3e,#0d5c24)", color: "white", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(26,156,62,0.3)", marginBottom: 16 }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          {tab === "user" && (
            <div style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              New to SmartStore?{" "}
              <span onClick={() => navigate("/register")} style={{ color: "#1a9c3e", fontWeight: 700, cursor: "pointer" }}>Create Account</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 20, background: "white", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ background: "#1a9c3e", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, flexShrink: 0, fontWeight: 700 }}>%</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#1a9c3e" }}>50% upto ₹150 off on first order</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>USE TRY50 | Above ₹99</div>
          </div>
        </div>
      </div>
    </div>
  );
}