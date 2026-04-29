import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeSubscriptions: 0,
    totalLessonsCompleted: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
      alert(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update user role");
    }
  };

  const handleResetProgress = async (userId) => {
    if (window.confirm("Are you sure you want to reset this user's progress?")) {
      try {
        await api.delete(`/admin/users/${userId}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("User progress reset successfully");
      } catch (error) {
        console.error("Failed to reset progress:", error);
        alert("Failed to reset progress");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-container">
      {/* Sidebar - Full height */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>SignBridge Admin</h2>
        </div>
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span>📊</span> Overview
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span>👥</span> Users
          </button>
          <Link to="/admin/categories" className="admin-nav-item">
            <span>📁</span> Categories
          </Link>
          <Link to="/admin/lessons" className="admin-nav-item">
            <span>📚</span> Lessons
          </Link>
          <button 
            className={`admin-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <span>💎</span> Subscriptions
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span>📈</span> Analytics
          </button>
        </nav>
        
        {/* Logout at bottom of sidebar */}
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-user">
            <span>Welcome, {user?.fullName}</span>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="admin-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🆕</div>
                <div className="stat-info">
                  <h3>{stats.newUsersToday}</h3>
                  <p>New Users Today</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💎</div>
                <div className="stat-info">
                  <h3>{stats.activeSubscriptions}</h3>
                  <p>Premium Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.totalLessonsCompleted}</h3>
                  <p>Lessons Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>${stats.totalRevenue}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="table-header">
              <h3>All Users</h3>
              <input type="text" placeholder="Search users..." className="search-input" />
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Subscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="role-select"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`subscription-badge ${user.subscription?.plan?.toLowerCase()}`}>
                          {user.subscription?.plan || "FREE"}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleResetProgress(user.id)}
                          className="action-btn reset-btn"
                          title="Reset Progress"
                        >
                          🔄
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;