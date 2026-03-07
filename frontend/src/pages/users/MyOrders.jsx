import { useEffect, useState } from "react";
import { API } from "../../services/api";
import {
  FaClock,
  FaTruck,
  FaBox,
  FaTimes,
  FaPhone,
  FaCheckCircle
} from "react-icons/fa";

export default function MyOrders() {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {

    try {

      const userId = localStorage.getItem("userId");

      const res = await API.get(`/orders/user/${userId}`);

      setOrders(res.data);

    } catch (err) {
      console.error(err);
    }

  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const statusColor = (status) => {
    if (status === "Delivered") return "text-green-600";
    if (status === "Processing") return "text-blue-600";
    if (status === "Pending") return "text-yellow-600";
    if (status === "Cancelled") return "text-red-600";
    return "text-gray-600";
  };

  return (

    <div className="max-w-5xl mx-auto p-6">

      <div className="flex items-center gap-3 mb-6">

  <img
    src="https://cdn-icons-png.flaticon.com/512/3500/3500833.png"
    alt="orders"
    className="w-10 h-10"
  />

  <h1 className="text-2xl font-bold">
    My Orders
  </h1>

</div>

      {/* Orders List */}

      {orders.map(order => (

        <div
          key={order._id}
          className="bg-white border rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition"
        >

          <div className="flex justify-between mb-3">

            <span className={`font-semibold ${statusColor(order.status)}`}>
              {order.status}
            </span>

            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>

          </div>

          <div className="text-sm text-gray-600 mb-3">
            {order.items.map(i => i.name).join(", ")}
          </div>

          <div className="flex justify-between items-center">

            <div className="font-semibold text-lg">
              ₹{order.totalAmount}
            </div>

            <div className="flex gap-4">

              <button
                onClick={() => openOrder(order)}
                className="text-green-600 font-semibold text-sm"
              >
                View Details
              </button>

              {order.status !== "Delivered" && (
                <button
                  onClick={() => openOrder(order)}
                  className="text-blue-600 font-semibold text-sm"
                >
                  Track Order
                </button>
              )}

            </div>

          </div>

        </div>

      ))}

      {/* POPUP MODAL */}

      {showModal && selectedOrder && (

        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={closeModal}
        >

          <div
            className="bg-white w-[550px] max-h-[85vh] overflow-y-auto rounded-xl shadow-lg p-6 relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close */}

            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-500"
            >
              <FaTimes />
            </button>

            <h2 className="text-xl font-bold mb-4">
              Order Details
            </h2>

            {/* Status */}

            <div className="mb-5">

              <span className={`font-semibold ${statusColor(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>

            </div>

            {/* ORDER TRACKING BAR */}

            <div className="flex justify-between items-center mb-6 text-sm">

              <div className="flex flex-col items-center">
                <FaCheckCircle className="text-green-500"/>
                <span>Placed</span>
              </div>

              <div className="flex flex-col items-center">
                <FaBox className="text-blue-500"/>
                <span>Packed</span>
              </div>

              <div className="flex flex-col items-center">
                <FaTruck className="text-gray-500"/>
                <span>Out</span>
              </div>

              <div className="flex flex-col items-center">
                <FaClock className="text-gray-400"/>
                <span>Delivered</span>
              </div>

            </div>

            {/* ITEMS */}

            <div className="border-t pt-4 mb-4">

              {selectedOrder.items.map((item,index)=>(
                <div
                  key={index}
                  className="flex justify-between items-center py-3 border-b"
                >

                  <div className="flex items-center gap-3">

                    <img
                      src={item.image || "https://via.placeholder.com/50"}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />

                    <div>

                      <p className="font-medium">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>

                    </div>

                  </div>

                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>

                </div>
              ))}

            </div>

            {/* COST BREAKDOWN */}

            <div className="space-y-2 text-sm border-t pt-3">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>₹{selectedOrder.gst}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>₹{selectedOrder.deliveryCharge}</span>
              </div>

            </div>

            {/* TOTAL */}

            <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
              <span>Total</span>
              <span>₹{selectedOrder.totalAmount}</span>
            </div>

            {/* DELIVERY PARTNER */}

            {selectedOrder.deliveryPartner && (

              <div className="mt-6 bg-gray-50 p-4 rounded-lg flex justify-between items-center">

                <div>

                  <h3 className="font-semibold">
                    Delivery Partner
                  </h3>

                  <p className="text-sm text-gray-600">
                    {selectedOrder.deliveryPartner.name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {selectedOrder.deliveryPartner.phone}
                  </p>

                </div>

                <a
                  href={`tel:${selectedOrder.deliveryPartner.phone}`}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <FaPhone/>
                  Call
                </a>

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

}