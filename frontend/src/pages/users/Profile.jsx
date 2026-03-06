import { useState, useRef, useEffect } from "react";
import {
  FaUserCircle,
  FaClipboardList,
  FaMapMarkerAlt,
  FaGift,
  FaQuestionCircle,
  FaShieldAlt,
  FaSignOutAlt
} from "react-icons/fa";

export default function Profile() {

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  /* Load user from localStorage */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /* Close dropdown when clicking outside */
  useEffect(() => {

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  /* Logout */
  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

  };

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
      >
        <FaUserCircle size={24} />
        Account
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-72 bg-white rounded-lg shadow-xl border z-50">

          {/* Header */}
          <div className="p-4 border-b">

            <h3 className="font-semibold text-lg">
              My Account
            </h3>

            <p className="text-sm font-medium text-gray-700">
              {user?.name || "User"}
            </p>

            <p className="text-xs text-gray-500">
              {user?.mobile || ""}
            </p>

          </div>

          {/* Menu */}
          <div className="flex flex-col">

            <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
              <FaClipboardList />
              My Orders
            </button>

            <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
              <FaMapMarkerAlt />
              Saved Addresses
            </button>

            <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
              💊 My Prescriptions
            </button>

            <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
              <FaGift />
              E-Gift Cards
            </button>

            <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
              <FaQuestionCircle />
              FAQ's
            </button>

            <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
              <FaShieldAlt />
              Account Privacy
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50"
            >
              <FaSignOutAlt />
              Log Out
            </button>

          </div>

          {/* QR Section */}
          <div className="border-t p-4 flex items-center gap-3">

            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=smartstore"
              alt="QR"
              className="w-16 h-16"
            />

            <div className="text-xs text-gray-600">
              <p className="font-semibold">
                Simple way to get groceries
              </p>
              <p>Scan QR and download SmartStore app</p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}