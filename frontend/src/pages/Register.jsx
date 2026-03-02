import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { API } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [otpParts, setOtpParts] = useState(["", "", ""]);
  const [otpSent, setOtpSent] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= SEND OTP ================= */
  const handleSendOtp = async () => {
    setError("");

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/send-otp", { mobile });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP INPUT HANDLER ================= */
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otpParts];
    updated[index] = value.slice(0, 2);
    setOtpParts(updated);

    if (value.length === 2 && index < 2) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  /* ================= VERIFY OTP & REGISTER ================= */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const otp = otpParts.join("");

    if (otp.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/verify-otp-register", {
        name,
        email,
        mobile,
        password,
        otp,
        role: "user", // ✅ matches schema
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-400">

        {/* HEADER */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-emerald-500 p-3 rounded-xl shadow-lg text-white">
            <FaUserPlus size={22} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Register</h1>
        </div>

        <p className="text-center text-gray-500 mb-6">
          Verify mobile number to create account
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="Mobile Number"
              className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-400"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
              required
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpSent || loading}
              className="bg-emerald-500 text-white px-4 rounded-xl font-semibold disabled:opacity-60"
            >
              {otpSent ? "OTP Sent" : "Send OTP"}
            </button>
          </div>

          {/* OTP INPUTS */}
          {otpSent && (
            <div className="flex justify-between gap-3">
              {otpParts.map((part, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={part}
                  onChange={(e) =>
                    handleOtpChange(e.target.value, index)
                  }
                  className="w-full text-center px-4 py-3 rounded-xl border text-lg font-semibold
                  focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder="--"
                  required
                />
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 cursor-pointer text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={!otpSent || loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Verifying..." : "Verify & Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-emerald-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;