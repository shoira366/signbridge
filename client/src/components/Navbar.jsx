import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <div className="brand-mark">S</div>
          <span>SignBridge</span>
        </Link>

        <nav className="nav-links">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/categories">Categories</Link>
          <Link className="nav-link" to="/lessons">Lessons</Link>
        {token && role !== "admin" && (
          <Link className="nav-link" to="/dashboard">My Dashboard</Link>
        )}

          {role === "admin" && (
            <>
              <Link className="nav-link" to="/admin">Admin</Link>
              <Link className="nav-link" to="/admin/categories">Manage Categories</Link>
              <Link className="nav-link" to="/admin/lessons">Manage Lessons</Link>
            </>
          )}

          {!token ? (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/register">Get Started</Link>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;