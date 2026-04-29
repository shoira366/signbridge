import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, role, loading } = useAuth();

  // Prevent redirect flicker
  if (loading) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/lessons" replace />;
  }

  return children;
};

export default ProtectedRoute;