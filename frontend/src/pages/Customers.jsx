import { useEffect, useState } from "react";
import { API } from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  // Load customers
  const loadCustomers = async () => {
    try {
      const res = await API.get("/customers");
      setCustomers(res.data);
    } catch {
      alert("Failed to load customers ❌");
    }
  };

  // Enroll customer
  const handleEnroll = async () => {
    if (!name || !phone) {
      alert("Name and Mobile required");
      return;
    }

    try {
      await API.post("/customers", { name, phone, email });
      alert("Customer enrolled successfully ✅");

      setName("");
      setPhone("");
      setEmail("");
      setShowModal(false);

      loadCustomers();
    } catch {
      alert("Failed to enroll customer ❌");
    }
  };

  // 🗑 DELETE CUSTOMER
  const handleDeleteCustomer = async (id, name) => {
    const confirm = window.confirm(
      `Are you sure you want to delete "${name}"?\nThis action cannot be undone.`
    );

    if (!confirm) return;

    try {
      await API.delete(`/customers/${id}`);
      alert("Customer deleted successfully 🗑️");
      loadCustomers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Cannot delete customer (linked with transactions)"
      );
    }
  };

  // Search filter
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customer Central</h1>
          <p className="text-gray-500">
            Loyalty points, purchase history, and enrollment
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-green-700 shadow"
        >
          + Enroll Customer
        </button>
      </div>

      {/* Search */}
      <input
        className="border p-3 rounded-xl w-full"
        placeholder="Search mobile number or name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-3xl border p-6 shadow hover:shadow-xl transition"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center font-bold text-green-600 text-xl">
                {customer.name.charAt(0)}
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase">
                  Reward Balance
                </p>
                <p className="font-bold text-green-600">
                  {customer.points} pts
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-1">{customer.name}</h3>
            <p className="text-gray-500 mb-4">📞 {customer.phone}</p>

            <div className="flex justify-between items-center border-t pt-4">
              <div>
                <p className="text-xs text-gray-400 uppercase">
                  Life-time Spent
                </p>
                <p className="font-bold">₹{customer.total_spent}</p>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-green-100 text-green-600 font-semibold">
                  Details
                </button>

                <button
                  onClick={() =>
                    handleDeleteCustomer(customer.id, customer.name)
                  }
                  className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enroll Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Enroll Customer</h2>

            <input
              className="border p-3 rounded-lg w-full mb-3"
              placeholder="Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="border p-3 rounded-lg w-full mb-3"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="border p-3 rounded-lg w-full mb-4"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleEnroll}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Enroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
