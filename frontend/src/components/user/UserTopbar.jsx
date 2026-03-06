import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaSearch, FaShoppingCart } from "react-icons/fa";
import Profile from "../../pages/users/Profile";

export default function UserTopbar() {
  const [location, setLocation] = useState("Detecting location...");
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    getLocation();
    loadCartCount();
  }, []);

  const loadCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );

          const data = await res.json();

          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Your Location";

          setLocation(city);
        } catch {
          setLocation("Location found");
        }
      },
      () => {
        setLocation("Location denied");
      }
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md flex items-center justify-between px-10 py-4 border-b">

      {/* DELIVERY INFO */}
      <div className="flex flex-col text-sm">

        <span className="font-semibold text-gray-800">
          Delivery in 15 minutes
        </span>

        <div className="flex items-center text-gray-600 gap-2">
          <FaMapMarkerAlt className="text-blue-600" />
          <span className="truncate max-w-[150px]">
            {location}
          </span>
        </div>

      </div>

      {/* SEARCH BAR */}
      <div className="flex-1 flex justify-center px-10">

        <div className="flex items-center bg-gray-100 rounded-xl px-5 py-3 w-full max-w-xl border hover:border-blue-400 transition">

          <FaSearch className="text-gray-400 mr-3 text-lg" />

          <input
            type="text"
            placeholder="Search products, shops, food..."
            className="bg-transparent outline-none w-full text-sm"
          />

        </div>

      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-6">

        {/* Profile */}
        <Profile />

        {/* Cart */}
        <div
          onClick={() => navigate("/cart")}
          className="relative flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition"
        >
          <FaShoppingCart />

          <span className="hidden sm:block">
            Cart
          </span>

          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </div>

      </div>

    </header>
  );
}