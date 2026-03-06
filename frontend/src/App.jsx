import { Routes, Route } from "react-router-dom";

/* ================= PAGES ================= */
// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";

// Users
import UserManagement from "./pages/users/UserManagement";
import AdminStaff from "./pages/users/AdminStaff";
import StoreAdmins from "./pages/users/StoreAdmins";
import StoreAdminProfile from "./pages/users/StoreAdminProfile";
import MyStaff from "./pages/users/MyStaff";
import CategoryPage from "./pages/users/CategoryPage";


// Customers
import Customers from "./pages/customers/Customers";
import RegisteredCustomers from "./pages/customers/RegisteredCustomers";

// Inventory
import Inventory from "./pages/inventory/Inventory";
import AddProduct from "./pages/inventory/AddProduct";
import EditProduct from "./pages/inventory/EditProduct";
import BulkUploadInventory from "./pages/inventory/BulkUploadInventory";

// Billing & Suppliers
import Billing from "./pages/billing/Billing";
import Suppliers from "./pages/suppliers/Suppliers";

// Reports
import Reports from "./pages/reports/Reports";

// Home
import Home from "./pages/Home";

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
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* ================= USER DASHBOARD ================= */}
      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute roles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/category/:category"
  element={
    <ProtectedRoute roles={["user"]}>
      <UserDashboard>
        <CategoryPage />
      </UserDashboard>
    </ProtectedRoute>
  }
/>

      {/* ================= SUPER ADMIN ONLY ROUTES ================= */}
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

      {/* User Management */}
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

      {/* Store Admins (filtered view) */}
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

      {/* Staff (filtered view) */}
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

      {/* Staff under specific admin */}
      <Route
        path="/admin/:adminId/staff"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <AdminStaff />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

<Route
  path="/my-staff"
  element={
    <ProtectedRoute roles={["admin"]}>
      <LayoutWrapper>
        <MyStaff />
      </LayoutWrapper>
    </ProtectedRoute>
  }
/>

      {/* Store Admins list */}
      <Route
        path="/store-admins"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <StoreAdmins />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Store Admin Profile */}
      <Route
        path="/store-admin/:adminId"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <StoreAdminProfile />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Registered Customers */}
      <Route
        path="/registered-customers"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <RegisteredCustomers />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= MULTI-ROLE ROUTES ================= */}
      {/* Dashboard - accessible by all roles */}
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

      {/* Inventory - accessible by all roles */}
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

      {/* Add Product - admin and super_admin only */}
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

      {/* Edit Product - admin and super_admin only */}
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

      {/* Bulk Upload - admin and super_admin only */}
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

      {/* Billing - all roles */}
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

      {/* Customers - all roles */}
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

      {/* Suppliers - admin and super_admin only */}
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

      {/* Reports - admin and super_admin only */}
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

      {/* ================= FALLBACK ROUTE ================= */}
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