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

      {/* ================= DASHBOARD ================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <LayoutWrapper showTopbar>
              <Dashboard />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ================= INVENTORY ================= */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <LayoutWrapper>
              <Inventory />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/add"
        element={
          <ProtectedRoute roles={["admin"]}>
            <LayoutWrapper>
              <AddProduct />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/edit/:id"
        element={
          <ProtectedRoute roles={["admin"]}>
            <LayoutWrapper>
              <EditProduct />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/bulk-upload"
        element={
          <ProtectedRoute roles={["admin"]}>
            <LayoutWrapper>
              <BulkUploadInventory />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ================= BILLING ================= */}
      <Route
        path="/billing"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <LayoutWrapper>
              <Billing />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ================= CUSTOMERS ================= */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <LayoutWrapper>
              <Customers />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ================= SUPPLIERS ================= */}
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute roles={["admin"]}>
            <LayoutWrapper>
              <Suppliers />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ================= REPORTS ================= */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={["admin"]}>
            <LayoutWrapper>
              <Reports />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

/* ================= LAYOUT WRAPPER ================= */
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

export default App;