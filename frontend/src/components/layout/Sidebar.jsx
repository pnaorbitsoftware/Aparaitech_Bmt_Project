import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTruck,
  FaChartBar,
  FaUserCircle,
  FaUserShield,
  FaSignOutAlt
} from "react-icons/fa";

function Sidebar() {

  let role = "unknown";
  let userName = "";

  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      role = String(user.role || "unknown").toLowerCase();
      userName = user.name || "";
    }
  } catch (err) {
    console.error("Sidebar user parse error", err);
    role = "unknown";
  }

  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || role === "super_admin";

  const roleLabel =
    isSuperAdmin ? "Super Administrator" :
    role === "admin" ? "Administrator" :
    role === "staff" ? "Staff User" :
    "Unknown Role";

  const dashboardPath = isSuperAdmin ? "/super-admin-dashboard" : "/dashboard";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#0b1220] to-[#020617] text-white px-6 py-8 flex flex-col shadow-2xl z-50">

      <div className="flex items-center gap-3 mb-12">
        <div className="bg-green-500 text-white p-3 rounded-xl text-xl shadow-lg">
          🏪
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wide">SmartStore</h1>
          <p className="text-xs text-green-400 uppercase">
            {roleLabel}
          </p>
        </div>
      </div>

      <nav className="space-y-3 flex-1">
        <SidebarItem to={dashboardPath} icon={<FaHome />} label="Dashboard" />
        <SidebarItem to="/billing" icon={<FaShoppingCart />} label="Billing" />
        <SidebarItem to="/inventory" icon={<FaBox />} label="Inventory" />
        <SidebarItem to="/customers" icon={<FaUsers />} label="Customers" />

        {isSuperAdmin && (
          <SidebarItem to="/users" icon={<FaUserShield />} label="User Management" />
        )}

        {isAdmin && (
          <>
            <SidebarItem to="/suppliers" icon={<FaTruck />} label="Suppliers" />
            <SidebarItem to="/reports" icon={<FaChartBar />} label="Reports" />
          </>
        )}
      </nav>

      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <FaUserCircle className="text-3xl text-green-400" />
          <div>
            <p className="text-sm font-semibold">
              {userName || (role !== "unknown" ? role : "Not Authenticated")}
            </p>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
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