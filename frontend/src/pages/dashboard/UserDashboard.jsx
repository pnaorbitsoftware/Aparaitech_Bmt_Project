import { useNavigate } from "react-router-dom";
import UserTopbar from "../../components/user/UserTopbar";

import {
  FaShoppingBasket,
  FaCapsules,
  FaMobileAlt,
  FaTshirt,
  FaHamburger,
  FaBroom,
  FaBook,
  FaPumpSoap,
  FaCarrot,
  FaAppleAlt
} from "react-icons/fa";

export default function UserDashboard() {

  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/category/${encodeURIComponent(category)}`);
  };

  const categories = [
    { name: "Grocery", icon: <FaShoppingBasket /> },
    { name: "Pharmacy", icon: <FaCapsules /> },
    { name: "Electronics", icon: <FaMobileAlt /> },
    { name: "Clothing", icon: <FaTshirt /> },
    { name: "Food", icon: <FaHamburger /> },
    { name: "Hardware", icon: <FaBroom /> },
    { name: "Stationery", icon: <FaBook /> },
    { name: "Beauty", icon: <FaPumpSoap /> },
    { name: "Fitness", icon: <FaCarrot /> },
    { name: "Books", icon: <FaBook /> },
    { name: "Toys", icon: <FaAppleAlt /> }
  ];

  return (

    <div className="min-h-screen bg-gray-100">

      {/* Topbar */}
      <UserTopbar />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-10">

        {/* Categories */}
        <div>

          <h2 className="text-xl font-bold mb-4">
            Shop by Category
          </h2>

          <div className="flex gap-8 overflow-x-auto pb-3 scroll-smooth no-scrollbar">

            {categories.map((cat, index) => (

              <div
                key={index}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center min-w-[70px] cursor-pointer hover:scale-105 transition"
              >

                <div className="bg-purple-100 p-4 rounded-full text-purple-600 text-xl">
                  {cat.icon}
                </div>

                <p className="text-xs mt-2 text-center font-medium">
                  {cat.name}
                </p>

              </div>

            ))}

          </div>

        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-xl flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-bold">
              Free Delivery Today 🚀
            </h2>

            <p className="text-sm">
              Order groceries, food, clothes, electronics in one place
            </p>

          </div>

          <button
            onClick={() => navigate("/shops")}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
          >
            Explore
          </button>

        </div>

        {/* Popular Shops */}
        <div>

          <h2 className="text-xl font-bold mb-5">
            Popular Shops Near You
          </h2>

          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">

            {[1,2,3,4].map((shop) => (

              <div
                key={shop}
                onClick={() => navigate(`/shop/${shop}`)}
                className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
              >

                <div className="h-36 bg-gray-200 rounded-t-xl"></div>

                <div className="p-4">

                  <h3 className="font-semibold">
                    Shop Name
                  </h3>

                  <p className="text-sm text-gray-500">
                    15 mins delivery
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </main>

    </div>
  );
}