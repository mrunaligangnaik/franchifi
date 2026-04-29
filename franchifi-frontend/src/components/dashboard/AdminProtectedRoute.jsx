import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in at all
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but not admin
  if (String(user.role).toLowerCase() !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
