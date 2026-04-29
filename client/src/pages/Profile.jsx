import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/user";
import { getMySubscription, cancelSubscription } from "../api/subscription";
import { getMyProgress } from "../api/progress";
import "../styles/Profile.css";

const Profile = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [achievementsCount, setAchievementsCount] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { user, logout, token, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchSubscription();
      fetchStreakAndAchievements();
    }
  }, [token]);

  const fetchSubscription = async () => {
    try {
      const data = await getMySubscription(token);
      setSubscription(data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      setSubscription({ plan: "FREE", status: "ACTIVE" });
    }
  };

  const fetchStreakAndAchievements = async () => {
    try {
      // Use the existing getMyProgress function
      const data = await getMyProgress(token);
      
      // Handle different response formats
      let progressArray = [];
      let streakData = { currentStreak: 0, longestStreak: 0 };
      let achievementsCountData = 0;
      
      if (data && data.progress) {
        // New format: { progress: [], streak: {}, achievementsCount: 0 }
        progressArray = data.progress || [];
        streakData = data.streak || { currentStreak: 0, longestStreak: 0 };
        achievementsCountData = data.achievementsCount || 0;
      } else if (Array.isArray(data)) {
        // Old format: just an array
        progressArray = data;
      }
      
      setStreak(streakData);
      setAchievementsCount(achievementsCountData);
    } catch (error) {
      console.error("Failed to fetch streak:", error);
      // Set default values on error
      setStreak({ currentStreak: 0, longestStreak: 0 });
      setAchievementsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const displayName = useMemo(() => {
    return user?.fullName || "User";
  }, [user]);

  const displayEmail = useMemo(() => {
    return user?.email || "No email";
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(token);
      await fetchSubscription();
      setShowCancelConfirm(false);
      setSubscriptionOpen(false);
      alert("Subscription cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription");
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    // Here you would integrate with Stripe/Payment gateway
    alert(`Selected ${plan.name} plan - Payment integration coming soon!`);
  };

  const getPlanDisplay = () => {
    if (!subscription) return "FREE";
    switch (subscription.plan) {
      case "MONTHLY": return "PREMIUM MONTHLY";
      case "YEARLY": return "PREMIUM YEARLY";
      case "LIFETIME": return "LIFETIME PREMIUM";
      default: return "FREE";
    }
  };

  const getPlanColor = () => {
    if (!subscription) return "#64748b";
    switch (subscription.plan) {
      case "MONTHLY": return "#3b82f6";
      case "YEARLY": return "#8b5cf6";
      case "LIFETIME": return "#f59e0b";
      default: return "#64748b";
    }
  };

  // Generate week days with streak data
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    
    // Start from 6 days ago and go to today
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date,
        isToday: i === 0  // When i = 0, that's today
      });
    }
    return days;
  };

  // Edit form
  const [form, setForm] = useState({});
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const [emailPassword, setEmailPassword] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handleProfileSave = async () => {
    try {
      const emailChanged = form.email !== user?.email;

      if (emailChanged && !emailPassword) {
        alert("Enter your password to change email");
        return;
      }

      const payload = {
        fullName: form.fullName,
        email: form.email,
      };

      if (emailChanged) {
        payload.currentPassword = emailPassword;
      }

      const updated = await updateProfile(token, payload);
      setUser(updated.user);
      setEditOpen(false);
      setEmailPassword("");
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      setPasswordOpen(false);
      setPasswords({
        currentPassword: "",
        newPassword: "",
      });
      alert("Password changed successfully");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to change password");
    }
  };

  const actionItems = [
    {
      section: "Account",
      items: [
        {
          title: "Edit personal data",
          subtitle: "Update your profile information",
          onClick: () => setEditOpen(true),
          icon: "👤",
        },
        {
          title: "Change password",
          subtitle: "Update your account password",
          onClick: () => setPasswordOpen(true),
          icon: "🔒",
        },
      ],
    },
    {
      section: "Subscription",
      items: [
        {
          title: "Manage Subscription",
          subtitle: subscription?.plan === "FREE" 
            ? "Upgrade to premium for more features" 
            : `${getPlanDisplay()} - Active`,
          onClick: () => navigate("/subscription"),
          icon: "💎",
          badge: subscription?.plan !== "FREE" ? "Active" : "Upgrade",
        },
      ],
    },
    {
      section: "Learning progress",
      items: [
        {
          title: "Download certificate",
          subtitle: "Get your learning certificate when available",
          onClick: () => alert("Certificate feature coming soon"),
          icon: "📜",
        },
        {
          title: "Reset all progress",
          subtitle: "Clear your saved learning history",
          onClick: () => {
            if (window.confirm("Are you sure? This action cannot be undone.")) {
              alert("Reset progress feature coming soon");
            }
          },
          icon: "↺",
          danger: true,
        },
      ],
    },
    {
      section: "Support",
      items: [
        {
          title: "Help Center",
          subtitle: "Get support and guidance",
          onClick: () => alert("Help page coming soon"),
          icon: "🛟",
        },
        {
          title: "About SignBridge",
          subtitle: "Version 1.0.0",
          onClick: () => alert("SignBridge - Learn Uzbek Sign Language"),
          icon: "ℹ️",
        },
      ],
    },
  ];

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-hero-card">
          <div className="profile-top-stats">
            <div className="profile-mini-stat">
              <span className="profile-mini-icon">🏆</span>
              <span className="profile-mini-value">{achievementsCount}</span>
            </div>

            <div className="profile-mini-stat">
              <span className="profile-mini-icon">🔥</span>
              <span className="profile-mini-value">{streak.currentStreak}</span>
            </div>
          </div>

          <div className="profile-avatar-wrap">
            <div className="profile-avatar-circle">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          <h1 className="profile-name">{displayName}</h1>
          <p className="profile-email">{displayEmail}</p>

          <div className="profile-streak-card">
            <div className="profile-streak-icon">🔥</div>
            <h2>{streak.currentStreak} day streak</h2>
            <p className="profile-streak-subtitle">
              Longest: {streak.longestStreak} days
            </p>

            <div className="profile-week-row">
            {weekDays.map((day, i) => {
              let shouldBeMarked = false;
              
              if (streak.currentStreak > 0) {
                const daysFromEnd = weekDays.length - 1 - i;
                shouldBeMarked = daysFromEnd < streak.currentStreak;
              }
              
              return (
                <div key={i} className={`profile-day ${day.isToday ? 'today' : ''}`}>
                  <div className={`profile-day-dot ${shouldBeMarked ? 'done' : ''}`}>
                    {shouldBeMarked ? '✓' : day.isToday ? '🔥' : '•'}
                  </div>
                  <span className="profile-day-label">{day.name}</span>
                </div>
              );
            })}
          </div>
          </div>

          <button
            className="profile-upgrade-btn"
            style={{ background: getPlanColor() }}
            onClick={() => navigate("/subscription")}
          >
            {subscription?.plan === "FREE" ? "✨ Upgrade to Premium" : getPlanDisplay()}
          </button>
        </div>

        {actionItems.map((section) => (
          <div key={section.section} className="profile-section">
            <h3 className="profile-section-title">{section.section}</h3>

            <div className="profile-card-list">
              {section.items.map((item) => (
                <button
                  key={item.title}
                  className={`profile-list-item ${item.danger ? "danger" : ""}`}
                  onClick={item.onClick}
                >
                  <div className="profile-list-left">
                    <div className="profile-list-icon">{item.icon}</div>

                    <div className="profile-list-text">
                      <div className="profile-list-title-row">
                        <span className="profile-list-title">{item.title}</span>
                        {item.badge ? (
                          <span className={`profile-list-badge ${subscription?.plan !== "FREE" ? "premium" : ""}`}>
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <span className="profile-list-subtitle">{item.subtitle}</span>
                    </div>
                  </div>

                  <div className="profile-list-arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Edit Profile Modal */}
        {editOpen && (
          <div className="modal-overlay" onClick={() => setEditOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Profile</h3>

              <label className="modal-label" htmlFor="fullname">Full Name</label>
              <input
                id="fullname"
                className="modal-input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Full name"
              />

              <label className="modal-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="modal-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
              />

              <label className="modal-label" htmlFor="password">Current password</label>
              <span style={{ color: "grey", fontSize: "13px" }}>
                Enter your password to update your email
              </span>
              <input
                id="password"
                className="modal-input"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
              />

              <button className="modal-save" onClick={handleProfileSave}>Save Changes</button>
              <button className="modal-cancel" onClick={() => setEditOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {passwordOpen && (
          <div className="modal-overlay" onClick={() => setPasswordOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Change Password</h3>

              <label className="modal-label" htmlFor="currentPass">Current password</label>
              <input
                id="currentPass"
                className="modal-input"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
              />

              <label className="modal-label" htmlFor="newPass">New password</label>
              <input
                id="newPass"
                className="modal-input"
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    newPassword: e.target.value,
                  })
                }
                placeholder="New password (min 6 characters)"
              />

              <button className="modal-save" onClick={handlePasswordChange}>Update Password</button>
              <button className="modal-cancel" onClick={() => setPasswordOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="profile-logout-wrap">
          <button className="profile-logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;