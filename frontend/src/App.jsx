import { Routes, Route } from "react-router-dom";

/* ================= PAGES ================= */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";

// Users
import UserManagement from "./pages/users/UserManagement";
import AdminStaff from "./pages/users/AdminStaff";
import StoreAdmins from "./pages/users/StoreAdmins";
import StoreAdminProfile from "./pages/users/StoreAdminProfile";
import MyStaff from "./pages/users/MyStaff";
import CategoryPage from "./pages/users/Category";


// Stores
import Stores from "./pages/stores/Stores";

// Customers
import Customers from "./pages/customers/Customers";
import RegisteredCustomers from "./pages/customers/RegisteredCustomers";

import Inventory from "./pages/inventory/Inventory";
import AddProduct from "./pages/inventory/AddProduct";
import EditProduct from "./pages/inventory/EditProduct";
import BulkUploadInventory from "./pages/inventory/BulkUploadInventory";

import Billing from "./pages/billing/Billing";
import Suppliers from "./pages/suppliers/Suppliers";
import Reports from "./pages/reports/Reports";
import DeliveryPartners from "./pages/delivery/DeliveryPartners";
import Home from "./pages/Home";

/* ================= LAYOUT ================= */
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./assets/styles/thermal.css";

function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= USER ================= */}

      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute roles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* CATEGORY PAGE */}
      <Route
        path="/category/:category"
        element={
          <ProtectedRoute roles={["user"]}>
            <CategoryPage />
          </ProtectedRoute>
        }
      />

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
        path="/store-admins"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <StoreAdmins />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

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

      <Route
        path="/delivery"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <DeliveryPartners />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/stores"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <SuperAdminLayout>
              <Stores />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ================= */}

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

      {/* ================= MULTI ROLE ================= */}

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

      <Route path="*" element={<Home />} />

    </Routes>
  );
}

/* ================= LAYOUTS ================= */

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