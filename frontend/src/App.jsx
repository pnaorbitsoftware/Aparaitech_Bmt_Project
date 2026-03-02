import { Routes, Route } from "react-router-dom";

/* ================= PAGES ================= */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import AddProduct from "./pages/AddProduct";
import BulkUploadInventory from "./pages/BulkUploadInventory";
import EditProduct from "./pages/EditProduct";
import Billing from "./pages/Billing";

import UserManagement from "./pages/UserManagement";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import StoreAdmins from "./pages/superadmin/StoreAdmins";
import Customers from "./pages/superadmin/Customers";

/* ================= LAYOUT ================= */
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

/* ================= AUTH ================= */
import ProtectedRoute from "./components/common/ProtectedRoute";

/* ================= STYLES ================= */
import "./assets/styles/thermal.css";

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= SUPER ADMIN ================= */}
      <Route
        path="/super-admin-dashboard"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <SuperAdminDashboard />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* All users */}
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <UserManagement />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Store Admins */}
      <Route
        path="/admins"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <UserManagement roleFilter="admin" />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Staff */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <UserManagement roleFilter="staff" />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />
      /* ================= SUPER ADMIN ================= */
<Route
  path="/superadmin/users"
  element={
    <ProtectedRoute roles={["super_admin"]}>
      <SuperAdminLayout>
        <Customers />
      </SuperAdminLayout>
    </ProtectedRoute>
  }
/>

      {/* ================= ADMIN / STAFF / SUPER ADMIN ================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["admin", "staff", "super_admin"]}>
            <LayoutWrapper showTopbar>
              <Dashboard />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute roles={["admin", "staff", "super_admin"]}>
            <LayoutWrapper>
              <Inventory />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/add"
        element={
          <ProtectedRoute roles={["admin", "super_admin"]}>
            <LayoutWrapper>
              <AddProduct />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/edit/:id"
        element={
          <ProtectedRoute roles={["admin", "super_admin"]}>
            <LayoutWrapper>
              <EditProduct />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/bulk-upload"
        element={
          <ProtectedRoute roles={["admin", "super_admin"]}>
            <LayoutWrapper>
              <BulkUploadInventory />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute roles={["admin", "staff", "super_admin"]}>
            <LayoutWrapper>
              <Billing />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute roles={["admin", "staff", "super_admin"]}>
            <LayoutWrapper>
              <Customers />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute roles={["admin", "super_admin"]}>
            <LayoutWrapper>
              <Suppliers />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={["admin", "super_admin"]}>
            <LayoutWrapper>
              <Reports />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

/* ================= REGULAR LAYOUT ================= */
function LayoutWrapper({ children, showTopbar = false }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {showTopbar && <Topbar />}
        <div className={`flex-1 p-6 ${showTopbar ? "mt-16" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= SUPER ADMIN LAYOUT ================= */
function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 mt-16">
          {children}
        </div>
      </div>
    </div>
  );
}

export default App;