import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTruck,
  FaChartBar,
  FaUserCircle
} from "react-icons/fa";

function Sidebar() {
  /* ================= SAFE USER PARSE ================= */
  let role = "unknown";

  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      role = String(user.role || "unknown").toLowerCase();
    }
  } catch (err) {
    console.error("Sidebar user parse error", err);
    role = "unknown";
  }

  const isAdmin = role === "admin";
  const isStaff = role === "staff";

  /* ================= ROLE LABEL ================= */
  const roleLabel =
    isAdmin ? "Administrator" :
    isStaff ? "Staff User" :
    "Unknown Role";

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#0b1220] to-[#020617] text-white px-6 py-8 flex flex-col shadow-2xl z-50">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-green-500 text-white p-3 rounded-xl text-xl shadow-lg">
          🏪
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Apna Store</h1>
          <p className="text-xs text-green-400 uppercase">
            {roleLabel}
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-3 flex-1">

        {/* COMMON */}
        <SidebarItem to="/dashboard" icon={<FaHome />} label="Dashboard" />
        <SidebarItem to="/billing" icon={<FaShoppingCart />} label="Billing" />
        <SidebarItem to="/inventory" icon={<FaBox />} label="Inventory" />
        <SidebarItem to="/customers" icon={<FaUsers />} label="Customers" />

        {/* ADMIN ONLY */}
        {isAdmin && (
          <>
            <SidebarItem to="/suppliers" icon={<FaTruck />} label="Suppliers" />
            <SidebarItem to="/reports" icon={<FaChartBar />} label="Reports" />
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-700 pt-4 flex items-center gap-3">
        <FaUserCircle className="text-3xl text-green-400" />
        <div>
          <p className="text-sm font-semibold capitalize">
            {role !== "unknown" ? role : "Not Authenticated"}
          </p>
          <p className="text-xs text-gray-400">Logged in</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        © 2026 SmartStore
      </p>
    </div>
  );
}

function SidebarItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 px-6 py-3 rounded-2xl transition-all
        ${
          isActive
            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
            : "text-gray-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export default Sidebar;
