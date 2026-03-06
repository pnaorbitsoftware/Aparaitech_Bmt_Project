import UserSidebar from "../../components/user/UserSidebar";
import UserTopbar from "../../components/user/UserTopbar";
import { useNavigate } from "react-router-dom";

import {
  FaShoppingBasket,
  FaCarrot,
  FaAppleAlt,
  FaCapsules,
  FaHamburger,
  FaPizzaSlice,
  FaGlassWhiskey,
  FaTshirt,
  FaMobileAlt,
  FaBook,
  FaBreadSlice,
  FaIceCream,
  FaPumpSoap,
  FaBroom,
  FaSearch,
  FaMapMarkerAlt
} from "react-icons/fa";

export default function UserDashboard() {

  const navigate = useNavigate();

  const categories = [
    { name: "Groceries", icon: <FaShoppingBasket />, color: "bg-green-100" },
    { name: "Vegetables", icon: <FaCarrot />, color: "bg-orange-100" },
    { name: "Fruits", icon: <FaAppleAlt />, color: "bg-red-100" },
    { name: "Medicines", icon: <FaCapsules />, color: "bg-blue-100" },

    { name: "Restaurants", icon: <FaHamburger />, color: "bg-yellow-100" },
    { name: "Fast Food", icon: <FaPizzaSlice />, color: "bg-pink-100" },
    { name: "Juice Center", icon: <FaGlassWhiskey />, color: "bg-purple-100" },
    { name: "Desserts", icon: <FaIceCream />, color: "bg-indigo-100" },

    { name: "Bakery", icon: <FaBreadSlice />, color: "bg-amber-100" },
    { name: "Clothes", icon: <FaTshirt />, color: "bg-cyan-100" },
    { name: "Electronics", icon: <FaMobileAlt />, color: "bg-slate-100" },
    { name: "Stationery", icon: <FaBook />, color: "bg-teal-100" },

    { name: "Personal Care", icon: <FaPumpSoap />, color: "bg-rose-100" },
    { name: "Cleaning Supplies", icon: <FaBroom />, color: "bg-lime-100" }
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      <UserSidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">

        <UserTopbar />

        <main className="p-6 space-y-8">

          {/* Offer Banner */}
          <div className="bg-gradient-to-r from-blue-400 to-emerald-500 text-white p-6 rounded-xl shadow flex justify-between items-center">

            <div>
              <h2 className="text-xl font-bold">
                Free Delivery Today 🚀
              </h2>
              <p className="text-sm">
                Order groceries, food, clothes, electronics in one order
              </p>
            </div>

            <button
              onClick={() => navigate("/shops")}
              className="bg-white text-green-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              Explore
            </button>

          </div>

          {/* Categories */}
          <div>

            <h1 className="text-2xl font-bold mb-5">
              Explore Categories
            </h1>

            <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">

              {categories.map((cat, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/shops?category=${cat.name}`)}
                  className={`p-6 rounded-xl shadow hover:shadow-xl cursor-pointer transition transform hover:-translate-y-1 ${cat.color}`}
                >

                  <div className="flex flex-col items-center gap-3">

                    <div className="text-3xl text-gray-700">
                      {cat.icon}
                    </div>

                    <h3 className="font-semibold text-gray-800">
                      {cat.name}
                    </h3>

                  </div>

                </div>
              ))}

            </div>

          </div>

          {/* Popular Shops Section */}
          <div>

            <h2 className="text-2xl font-bold mb-5">
              Popular Shops Near You
            </h2>

            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">

              {[1,2,3,4].map((shop) => (
                <div
                  key={shop}
                  onClick={() => navigate(`/shop/${shop}`)}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
                >

                  <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>

                  <h3 className="font-semibold">
                    Shop Name
                  </h3>

                  <p className="text-sm text-gray-500">
                    Groceries • 15 mins delivery
                  </p>

                </div>
              ))}

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}