import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="ml-64 min-h-screen flex flex-col">

        {/* Fixed Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className="flex-1 p-6 mt-16 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default Layout;
