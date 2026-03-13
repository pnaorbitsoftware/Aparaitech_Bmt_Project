import { useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, ClipboardList } from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Order Placed! 🎉</h1>
        <p className="text-slate-500 mb-8">
          Your order has been placed successfully. You'll receive it soon!
        </p>
        <div className="space-y-3">
          <button onClick={() => navigate("/my-orders")}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
            <ClipboardList className="w-5 h-5" /> View My Orders
          </button>
          <button onClick={() => navigate("/user-dashboard")}
            className="w-full flex items-center justify-center gap-2 border-2 border-purple-200 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-50 transition">
            <ShoppingBag className="w-5 h-5" /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}