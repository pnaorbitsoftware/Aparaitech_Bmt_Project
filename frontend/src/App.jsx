import { Routes, Route } from "react-router-dom";

/* ================= PAGES ================= */
import Home from "./pages/Home";
import Login from "./pages/Login";
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

      {/* ================= SUPER ADMIN ROUTES ================= */}
      <Route
        path="/super-admin-dashboard"
        element={
          <ProtectedRoute roles={['super_admin']}>
            <SuperAdminLayout>
              <SuperAdminDashboard />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['super_admin']}>
            <SuperAdminLayout>
              <UserManagement />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN/STAFF ROUTES ================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <LayoutWrapper showTopbar>
              <Dashboard />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <LayoutWrapper>
              <Inventory />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/add"
        element={
          <ProtectedRoute roles={['admin']}>
            <LayoutWrapper>
              <AddProduct />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/edit/:id"
        element={
          <ProtectedRoute roles={['admin']}>
            <LayoutWrapper>
              <EditProduct />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/bulk-upload"
        element={
          <ProtectedRoute roles={['admin']}>
            <LayoutWrapper>
              <BulkUploadInventory />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <LayoutWrapper>
              <Billing />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <LayoutWrapper>
              <Customers />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute roles={['admin']}>
            <LayoutWrapper>
              <Suppliers />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={['admin']}>
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

/* ================= REGULAR LAYOUT WRAPPER ================= */
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
      {/* You can create a different sidebar for super admin if needed */}
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