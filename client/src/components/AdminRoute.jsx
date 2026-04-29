import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!token || user?.role !== "admin") {
    console.log(user.role)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;