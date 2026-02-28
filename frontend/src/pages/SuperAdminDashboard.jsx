import { useEffect, useState } from "react";
import { API } from "../services/api";
import { Link } from "react-router-dom";

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalStaff: 0,
    totalSuperAdmins: 0,
    totalCustomers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersRes, customersRes] = await Promise.allSettled([
        API.get("/users"),
        API.get("/customers")
      ]);

      let users = [];
      if (usersRes.status === "fulfilled") {
        users = usersRes.value.data?.data || usersRes.value.data || [];
      }

      let customerCount = 0;
      if (customersRes.status === "fulfilled") {
        const custData = customersRes.value.data;
        customerCount = Array.isArray(custData) ? custData.length : (custData?.data?.length || 0);
      }

      if (Array.isArray(users)) {
        setStats({
          totalUsers: users.length,
          totalAdmins: users.filter(u => u.role === "admin").length,
          totalStaff: users.filter(u => u.role === "staff").length,
          totalSuperAdmins: users.filter(u => u.role === "super_admin").length,
          totalCustomers: customerCount
        });
        setRecentUsers(users.slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-xl text-gray-500 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
          <button onClick={fetchDashboardData} className="ml-3 underline font-medium">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Super Admins</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalSuperAdmins}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Admins</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalAdmins}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Staff</div>
          <div className="text-3xl font-bold text-green-600">{stats.totalStaff}</div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Customers</div>
          <div className="text-3xl font-bold text-orange-600">{stats.totalCustomers}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/users"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-semibold">Manage Users</h3>
          <p className="text-sm text-gray-500 mt-1">Create, edit, or delete users</p>
        </Link>
        
        <Link
          to="/customers"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-3">👤</div>
          <h3 className="font-semibold">Customers</h3>
          <p className="text-sm text-gray-500 mt-1">View and manage customers</p>
        </Link>
        
        <Link
          to="/inventory"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-semibold">Inventory</h3>
          <p className="text-sm text-gray-500 mt-1">Manage products and stock</p>
        </Link>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-600' :
                      user.role === 'admin' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default SuperAdminDashboard;