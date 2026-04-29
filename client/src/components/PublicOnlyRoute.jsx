import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicOnlyRoute = ({ children }) => {
  const { token, role } = useAuth();

  if (token) {
    return <Navigate to={role === "admin" ? "/admin" : "/lessons"} replace />;
  }

  return children;
};

export default PublicOnlyRoute;