import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const homeByRole = {
      user: "/user-dashboard",
      super_admin: "/super-admin-dashboard",
      admin: "/dashboard",
      staff: "/dashboard",
    };
    return <Navigate to={homeByRole[user.role] || "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
