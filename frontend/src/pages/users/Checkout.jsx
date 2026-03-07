import { useEffect, useState } from "react";

export default function Checkout() {

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  const itemsTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const delivery = 40;
  const gst = itemsTotal * 0.05;
  const grandTotal = itemsTotal + delivery + gst;

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Checkout
      </h1>

      {cartItems.map((item, index) => (
        <div
          key={index}
          className="flex justify-between bg-white p-4 rounded-lg shadow mb-3"
        >
          <p>{item.name}</p>
          <p>₹{item.price} × {item.quantity}</p>
        </div>
      ))}

      <div className="bg-white p-6 rounded-xl shadow mt-6">

        <div className="flex justify-between mb-2">
          <span>Items Total</span>
          <span>₹{itemsTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span>Delivery</span>
          <span>₹{delivery}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span>GST (5%)</span>
          <span>₹{gst.toFixed(2)}</span>
        </div>

        <hr className="my-3"/>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>

        <button
          className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
        >
          Place Order
        </button>

      </div>

    </div>
  );
}