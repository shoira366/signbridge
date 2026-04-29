import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/user";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(true); // Changed to true initially

  const login = (token, userData) => {

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setLoading(true);

    getMe(storedToken)
      .then((userData) => {
        setUser(userData);
        // Also update localStorage if needed
        localStorage.setItem("user", JSON.stringify(userData));
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
        // If token is invalid, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper to check if user is admin
  const isAdmin = user?.role === "admin";
  
  // Helper to check if user is authenticated
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        role: user?.role,
        isAdmin, // Add this
        isAuthenticated, // Add this
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};