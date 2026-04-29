import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // ✅ BLOCK RENDER UNTIL AUTH RESTORED
  if (loading) {
    return <div style={{ padding: 40 }}>Checking authentication...</div>;
  }

  // ❌ Not logged in
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        state={{ redirectTo: location.pathname }}
        replace
      />
    );
  }

  // ❌ Role mismatch
  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allowed
  return children;
};

export default ProtectedRoute;
