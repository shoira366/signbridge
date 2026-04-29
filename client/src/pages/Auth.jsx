import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: loginForm.email,
        password: loginForm.password,
      });

      const { token, user } = response.data;
      
      // Store both token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Update auth context
      login(token, user);
      
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/lessons");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (registerForm.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const registerRes = await api.post("/auth/register", {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
      });

      if (registerRes?.data?.token && registerRes?.data?.user) {
        const { token, user } = registerRes.data;
        localStorage.setItem("token", token);
        login(token, user.role);
        
        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/lessons");
        }
        return;
      }

      // If registration doesn't return token, try login
      const loginRes = await api.post("/auth/login", {
        email: registerForm.email,
        password: registerForm.password,
      });

      const { token, user } = loginRes.data;
      localStorage.setItem("token", token);
      login(token, user.role);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/lessons");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage = error?.response?.data?.message || "Registration failed. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-v2">
      <div className="auth-layout">
        <div className="auth-left-panel">
          <div className="auth-brand-row">
            <div className="auth-brand-icon">🤟</div>
            <div className="auth-brand-text">SignBridge</div>
          </div>

          <div className="auth-left-content">
            <span className="auth-chip">Uzbek Sign Language</span>

            <h1 className="auth-hero-title">
              Start learning with a cleaner, guided experience
            </h1>

            <p className="auth-hero-subtitle">
              Study lesson content first, unlock practice next, and track your
              progress as you improve step by step.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">✓</div>
                <div>
                  <strong>Structured lessons</strong>
                  <p>Learn signs with visuals, meaning, and explanation.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">✓</div>
                <div>
                  <strong>Interactive practice</strong>
                  <p>Unlock quizzes and sign tasks after lesson completion.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">✓</div>
                <div>
                  <strong>Progress tracking</strong>
                  <p>See your completed lessons and scores in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-card-v2">
            <div className="auth-toggle">
              <button
                type="button"
                className={`auth-toggle-btn ${mode === "login" ? "active" : ""}`}
                onClick={() => setMode("login")}
              >
                Login
              </button>

              <button
                type="button"
                className={`auth-toggle-btn ${mode === "register" ? "active" : ""}`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            {mode === "login" ? (
              <>
                <div className="auth-card-head">
                  <h2>Welcome back</h2>
                  <p>Login to continue your learning journey.</p>
                </div>

                <form className="auth-form-v2" onSubmit={handleLoginSubmit}>
                  <div className="auth-field">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <button
                    className="auth-submit-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Login"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="auth-card-head">
                  <h2>Create account</h2>
                  <p>Register now and go straight into your lessons.</p>
                </div>

                <form className="auth-form-v2" onSubmit={handleRegisterSubmit}>
                  <div className="auth-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={registerForm.fullName}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <button
                    className="auth-submit-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Register"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;