import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import NotificationBell from "./NotificationBell";
import "../styles/MainNavbar.css";

const MainNavbar = () => {
  const { user, logout, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get user name from multiple sources
  const getUserName = () => {
    // First try from context
    if (user?.fullName) {
      return user.fullName.split(" ")[0];
    }
    // Then try from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.fullName) {
          return parsed.fullName.split(" ")[0];
        }
      } catch (e) {}
    }
    return "User";
  };

  const getUserAvatar = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.fullName) {
          return parsed.fullName.charAt(0).toUpperCase();
        }
      } catch (e) {}
    }
    return "U";
  };

  const isLoggedIn = token || localStorage.getItem("token");

  return (
    <nav className="main-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src={logo} alt="SignBridge" />
          <span>SignBridge</span>
        </Link>

        <div className="nav-links">
          {isLoggedIn && (
            <>
              <Link to="/lessons" className="nav-link">Lessons</Link>
              <Link to="/quizzes" className="nav-link">Quizzes</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/achievements" className="nav-link">Achievements</Link>
              <Link to="/subscription" className="nav-link">Premium</Link>
            </>
          )}
        </div>

        <div className="nav-auth">
          {isLoggedIn ? (
            <div className="user-menu">
              <NotificationBell />
              <Link to="/profile" className="nav-user">
                <span className="user-avatar">
                  {getUserAvatar()}
                </span>
                <span className="user-name">
                  {getUserName()}
                </span>
              </Link>
              <button onClick={handleLogout} className="nav-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth" className="nav-btn nav-btn-outline">Sign In</Link>
              <Link to="/auth" className="nav-btn nav-btn-primary">Sign Up</Link>
            </div>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => {
          const mobileMenu = document.querySelector('.mobile-menu');
          mobileMenu?.classList.toggle('open');
        }}>
          ☰
        </button>
      </div>

      <div className="mobile-menu">
        {isLoggedIn ? (
          <>
            <Link to="/lessons" onClick={() => document.querySelector('.mobile-menu')?.classList.remove('open')}>Lessons</Link>
            <Link to="/quizzes" onClick={() => document.querySelector('.mobile-menu')?.classList.remove('open')}>Quizzes</Link>
            <Link to="/dashboard" onClick={() => document.querySelector('.mobile-menu')?.classList.remove('open')}>Dashboard</Link>
            <Link to="/achievements" onClick={() => document.querySelector('.mobile-menu')?.classList.remove('open')}>Achievements</Link>
            <Link to="/subscription" onClick={() => document.querySelector('.mobile-menu')?.classList.remove('open')}>Premium</Link>
            <Link to="/profile" onClick={() => document.querySelector('.mobile-menu')?.classList.remove('open')}>Profile</Link>
            <button onClick={() => {
              handleLogout();
              document.querySelector('.mobile-menu')?.classList.remove('open');
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/auth" onClick={() => document.querySelector('.mobile-menu')?.classList.remove('open')}>Sign In</Link>
            <Link to="/auth" onClick={() => document.querySelector('.mobile-menu')?.classList.remove('open')}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default MainNavbar;