import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { FaEye, FaTimes } from "react-icons/fa";

export default function Orders() {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {

    try {

      const res = await API.get("/orders/all");

      setOrders(res.data);

    } catch (error) {
      console.error("Error fetching orders", error);
    }

  };

  const statusColor = (status) => {

    if (status === "Delivered")
      return "bg-green-100 text-green-700";

    if (status === "Processing")
      return "bg-blue-100 text-blue-700";

    if (status === "Placed")
      return "bg-yellow-100 text-yellow-700";

    if (status === "Cancelled")
      return "bg-red-100 text-red-700";

    return "bg-gray-100 text-gray-700";
  };

  return (

    <div className="p-6">

      {/* Page Title */}

      <h1 className="text-2xl font-bold mb-6">
        All Orders
      </h1>

      {/* Orders Table */}

      <div className="overflow-x-auto">

        <table className="w-full bg-white shadow rounded-lg">

          <thead>

            <tr className="bg-gray-100 text-left">

              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>

            </tr>

          </thead>

          <tbody>

            {orders.map(order => (

              <tr
                key={order._id}
                className="border-t hover:bg-gray-50"
              >

                {/* Order ID */}

                <td className="p-3 text-sm font-medium">
                  {order._id.slice(-6)}
                </td>

                {/* Customer Name */}

                <td className="p-3">
                  {order.userId?.name || "N/A"}
                </td>

                {/* Mobile */}

                <td className="p-3">
                  {order.userId?.mobile || "N/A"}
                </td>

                {/* Items Count */}

                <td className="p-3">
                  {order.items?.length}
                </td>

                {/* Total */}

                <td className="p-3 font-semibold">
                  ₹{order.totalAmount}
                </td>

                {/* Status */}

                <td className="p-3">

                  <span className={`px-3 py-1 rounded-full text-sm ${statusColor(order.status)}`}>
                    {order.status}
                  </span>

                </td>

                {/* Date */}

                <td className="p-3 text-sm text-gray-500">

                  {new Date(order.createdAt).toLocaleDateString()}

                </td>

                {/* Action */}

                <td className="p-3">

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

          <div className="bg-white w-[500px] rounded-lg p-6 shadow-lg relative">

            {/* Close Button */}

            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-gray-500"
            >
              <FaTimes />
            </button>

            <h2 className="text-xl font-bold mb-4">
              Order Details
            </h2>

            {/* Customer Info */}

            <p className="mb-2">
              <b>Customer:</b> {selectedOrder.userId?.name}
            </p>

            <p className="mb-2">
              <b>Mobile:</b> {selectedOrder.userId?.mobile}
            </p>

            <p className="mb-4">
              <b>Status:</b> {selectedOrder.status}
            </p>

            {/* Items */}

            <div className="border-t pt-3">

              {selectedOrder.items.map((item,index)=>(

                <div
                  key={index}
                  className="flex justify-between py-2"
                >

                  <span>
                    {item.name} x{item.quantity}
                  </span>

                  <span>
                    ₹{item.price * item.quantity}
                  </span>

                </div>

              ))}

            </div>

            {/* Total */}

            <div className="flex justify-between border-t pt-3 mt-3 font-bold text-lg">

              <span>Total</span>

              <span>₹{selectedOrder.totalAmount}</span>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}