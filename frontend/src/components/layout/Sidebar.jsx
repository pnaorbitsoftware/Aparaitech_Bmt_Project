import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTruck,
  FaChartBar,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import {
  LayoutDashboard,
  Store,
  UserCheck,
  Users,
  UserCircle,
  Truck,
  Layers,
  Package,
  ShoppingCart,
  CreditCard,
  Wallet,
  BarChart2,
  Settings,
  ChevronRight,
} from "lucide-react";

/* ===================== SUPER ADMIN MENU ===================== */
const superAdminMenu = [
  { label: "Dashboard", path: "/super-admin-dashboard", icon: LayoutDashboard },
  { label: "Stores", path: "/stores", icon: Store },
  { label: "Store Admins", path: "/admins", icon: UserCheck },
  
  { label: "Customers", path: "/customers", icon: UserCircle },
  { label: "Delivery Partners", path: "/delivery", icon: Truck },
  { label: "Categories", path: "/categories", icon: Layers },
  { label: "Products", path: "/products", icon: Package },
  { label: "Orders", path: "/orders", icon: ShoppingCart },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Payouts", path: "/payouts", icon: Wallet },
  { label: "Analytics", path: "/analytics", icon: BarChart2 },
  { label: "Settings", path: "/settings", icon: Settings },
];

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
    console.error("Sidebar parse error", err);
  }

  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin";
  const isStaff = role === "staff";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ===================== SUPER ADMIN SIDEBAR ===================== */
  if (isSuperAdmin) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col overflow-hidden">

        {/* LOGO */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Package className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">
              SmartStore
            </h1>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">
              Super Admin
            </p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-6 mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Main Menu
            </p>
          </div>

          {superAdminMenu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-6 py-3 transition-all duration-200 group
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-4.5 h-4.5 transition ${
                        isActive
                          ? "text-indigo-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>

                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-indigo-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-5 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <UserCircle className="w-9 h-9 text-indigo-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {userName || "Super Admin"}
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>
    );
  }

  /* ===================== ADMIN / STAFF SIDEBAR ===================== */
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#0b1220] to-[#020617] text-white px-6 py-8 flex flex-col shadow-2xl z-50">

      {/* LOGO */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-green-500 p-3 rounded-xl text-xl shadow-lg">🏪</div>
        <div>
          <h1 className="text-2xl font-bold">SmartStore</h1>
          <p className="text-xs text-green-400 uppercase">{role}</p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-3">
        <SidebarItem to="/dashboard" icon={<FaHome />} label="Dashboard" />
        <SidebarItem to="/billing" icon={<FaShoppingCart />} label="Billing" />

        {isAdmin && (
          <>
            <SidebarItem to="/inventory" icon={<FaBox />} label="Inventory" />
            <SidebarItem to="/suppliers" icon={<FaTruck />} label="Suppliers" />
            <SidebarItem to="/reports" icon={<FaChartBar />} label="Reports" />
          </>
        )}

        {isStaff && (
          <SidebarItem to="/customers" icon={<FaUsers />} label="Customers" />
        )}
      </nav>

      {/* USER */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <FaUserCircle className="text-3xl text-green-400" />
          <div>
            <p className="text-sm font-semibold">{userName || "User"}</p>
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
    </aside>
  );
}

/* ===================== SHARED ITEM ===================== */
function SidebarItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200
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