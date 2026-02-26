import { User, Mail, ShieldCheck, LogOut } from "lucide-react";

function AdminProfile({ admin, onClose, onLogout }) {

  // Safety check
  if (!admin) return null;

  return (
    <div className="absolute right-6 top-16 bg-white rounded-xl shadow-xl w-72 z-50 border">

      {/* Header */}
      <div className="bg-green-500 text-white p-4 rounded-t-xl">
        <h3 className="font-semibold text-lg">Admin Profile</h3>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">

        <div className="flex items-center gap-3">
          <User className="text-green-500" />
          <div>
            <p className="font-semibold">{admin.name}</p>
            <p className="text-sm text-gray-500">{admin.role.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          <Mail className="w-5 h-5" />
          <span className="text-sm">{admin.email}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm">Full Access</span>
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}

export default AdminProfile;
