import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import { 
  Store, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  Package,
  TrendingUp,
  ArrowLeft,
  UserCircle,
  Briefcase,
  MapPin
} from "lucide-react";

function StoreAdminProfile() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [staff, setStaff] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchAdminData();
  }, [adminId]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin details
      const adminRes = await API.get(`/users/admins/${adminId}`);
      const adminData = adminRes.data.data;
      setAdmin(adminData);
      
      // Fetch staff under this admin
      const staffRes = await API.get(`/users/admin/${adminId}/staff`);
      setStaff(staffRes.data.data || []);
      
      // Fetch store details (if admin has a store)
      if (adminData.storeId) {
        const storeRes = await API.get(`/stores/${adminData.storeId}`);
        setStore(storeRes.data.data);
      }
      
      // Fetch store stats
      const statsRes = await API.get(`/dashboard/store-stats/${adminId}`);
      setStats(statsRes.data.data || {
        totalStaff: staffRes.data.data?.length || 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
      });
      
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="text-gray-500">Loading admin profile...</div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="p-6">
        <div className="text-red-500">Admin not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store-admins")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Store Admin Profile</h1>
      </div>

      {/* Admin Info Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {admin.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{admin.name}</h2>
              <p className="text-indigo-100 flex items-center gap-2 mt-1">
                <Briefcase className="w-4 h-4" />
                Store Administrator
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <UserCircle className="w-4 h-4" /> Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{admin.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{admin.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Store Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Store className="w-4 h-4" /> Store Information
            </h3>
            {store ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-600">
                  <Store className="w-4 h-4" />
                  <span className="font-semibold">{store.name}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{store.address || "Address not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{store.phone || "Phone not provided"}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No store assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Staff</p>
              <p className="text-3xl font-bold mt-1">{stats.totalStaff || staff.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Products</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{stats.totalRevenue}</p>
            </div>
            <Package className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" /> Staff Members ({staff.length})
          </h3>
        </div>
        
        {staff.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No staff members found under this admin
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {staff.map((member) => (
              <div key={member._id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-indigo-600">
                      {member.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreAdminProfile;