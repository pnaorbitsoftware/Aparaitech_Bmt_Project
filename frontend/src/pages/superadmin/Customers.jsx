import { useEffect, useState } from "react";
import { FaPhoneAlt, FaPlus } from "react-icons/fa";
import { API } from "../../services/api";
import toast from "react-hot-toast";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH NORMAL USERS ONLY ================= */
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customers/superadmin/users");
      setCustomers(res.data);
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= DELETE CUSTOMER ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await API.delete(`/customers/${id}`);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  /* ================= UI ================= */
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Customer Central</h1>
          <p className="text-gray-500">
            Only normal users (POS & Loyalty excluded)
          </p>
        </div>

        <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
          <FaPlus /> Enroll Customer
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search mobile number or name..."
        className="w-full mb-6 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-green-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CONTENT */}
      {loading ? (
        <p className="text-center text-gray-500">Loading customers...</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="text-center text-gray-500">No users found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-sm p-5 border"
            >
              {/* TOP */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold">{c.name}</h2>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <FaPhoneAlt className="text-pink-500" />
                      {c.mobile}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">REWARD BALANCE</p>
                  <p className="text-green-600 font-semibold">
                    {c.reward_points || 0} pts
                  </p>
                </div>
              </div>

              <hr className="mb-4" />

              {/* BOTTOM */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">LIFE-TIME SPENT</p>
                  <p className="font-semibold">
                    ₹{Number(c.lifetime_spent || 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
                    Details
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-4 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}