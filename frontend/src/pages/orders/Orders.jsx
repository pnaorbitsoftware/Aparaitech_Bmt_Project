import { useEffect, useState } from "react";
import { API } from "../../services/api";

export default function Orders() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {

    const res = await API.get("/orders/all");

    setOrders(res.data);

  };

  return (

    <div>

      <h1 className="text-2xl font-bold mb-6">All Orders</h1>

      <table className="w-full bg-white shadow rounded">

        <thead>

          <tr className="bg-gray-100">
            <th>User</th>
            <th>Total</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {orders.map(order => (

            <tr key={order._id} className="border-t">

              <td>{order.userId?.full_name}</td>
              <td>₹{order.totalAmount}</td>
              <td>{order.status}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}