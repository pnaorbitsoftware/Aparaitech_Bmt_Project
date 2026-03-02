import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  TrendingUp,
  ChevronRight,
  UserCircle
} from "lucide-react";

function RegisteredCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    withTransactions: 0,
    totalPoints: 0,
    averageSpent: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customers");
      const customersData = res.data || [];
      
      setCustomers(customersData);
      
      // Calculate stats
      const withTransactions = customersData.filter(c => c.lifetime_spent > 0).length;
      const totalPoints = customersData.reduce((sum, c) => sum + (c.points || 0), 0);
      const totalSpent = customersData.reduce((sum, c) => sum + (c.lifetime_spent || 0), 0);
      
      setStats({
        total: customersData.length,
        withTransactions,
        totalPoints,
        averageSpent: customersData.length ? (totalSpent / customersData.length).toFixed(2) : 0
      });
      
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.loyalty_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Registered Customers</h1>
          <p className="text-gray-500 mt-1">View and manage all registered customers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">With Transactions</p>
              <p className="text-3xl font-bold mt-1">{stats.withTransactions}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Total Points</p>
              <p className="text-3xl font-bold mt-1">{stats.totalPoints}</p>
            </div>
            <Award className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Avg. Lifetime Spent</p>
              <p className="text-3xl font-bold mt-1">₹{stats.averageSpent}</p>
            </div>
            <Mail className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, email or loyalty ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Customers Found</h3>
          <p className="text-gray-500">
            {searchTerm ? "Try a different search term" : "No registered customers yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer border border-gray-100"
              onClick={() => handleViewDetails(customer)}
            >
              <div className="p-6">
                {/* Header with initial */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">
                        {customer.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.email || 'No email'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.loyalty_id && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span className="font-mono">{customer.loyalty_id}</span>
                    </div>
                  )}
                </div>

                {/* Footer stats */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Lifetime Spent</p>
                    <p className="font-bold text-green-600">₹{customer.lifetime_spent}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Points</p>
                    <p className="font-bold text-purple-600">{customer.points}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Customer Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-gray-500">{selectedCustomer.email || 'No email'}</p>
                  <p className="text-sm text-gray-400">Member since {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold">{selectedCustomer.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Loyalty ID</p>
                  <p className="font-mono text-sm">{selectedCustomer.loyalty_id}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-indigo-600 mb-1">Points</p>
                  <p className="text-xl font-bold text-indigo-700">{selectedCustomer.points}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600 mb-1">Lifetime Spent</p>
                  <p className="text-xl font-bold text-green-700">₹{selectedCustomer.lifetime_spent}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-purple-600 mb-1">Transactions</p>
                  <p className="text-xl font-bold text-purple-700">{selectedCustomer.total_purchases || 0}</p>
                </div>
              </div>

              {/* Address & GST */}
              {(selectedCustomer.address || selectedCustomer.gst_number) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedCustomer.address && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p>{selectedCustomer.address}</p>
                    </div>
                  )}
                  {selectedCustomer.gst_number && (
                    <div>
                      <p className="text-sm text-gray-500">GST Number</p>
                      <p>{selectedCustomer.gst_number}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Transactions */}
              {selectedCustomer.recent_transactions?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recent Transactions</h4>
                  <div className="space-y-2">
                    {selectedCustomer.recent_transactions.map((t, index) => (
                      <div key={t.id || index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-mono text-sm">{t.bill_no}</p>
                          <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                        </div>
                        <p className="font-bold text-green-600">₹{t.total}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisteredCustomers;