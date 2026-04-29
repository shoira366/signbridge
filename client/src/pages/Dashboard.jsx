import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getAchievements, getLeaderboard } from "../api/achievement";
import { getMySubscription } from "../api/subscription";
import { getMyProgress } from "../api/progress";
import "../styles/Dashboard.css";

// ── Helpers ────────────────────────────────────────────────────────────────

function calcStreak(progress) {
  if (!progress || !progress.length) return 0;

  const days = [
    ...new Set(progress.map((p) => new Date(p.updatedAt).toDateString())),
  ].sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of days) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor - d) / 86400000);

    if (diff === 0 || diff === 1) {
      streak++;
      cursor = d;
    } else {
      break;
    }
  }

  return streak;
}

function getLast7Days(progress) {
  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));

    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
      done: progress.some(
        (p) => new Date(p.updatedAt).toDateString() === d.toDateString()
      ),
      today: i === 6,
    };
  });
}

// Badge rules mapped to actual backend achievements
const getBadgeRules = (backendAchievements = []) => {
  // Create a map of backend achievements by name
  const achievementMap = {};
  backendAchievements.forEach(ach => {
    achievementMap[ach.name] = ach;
  });

  return [
    {
      id: "first",
      icon: "✋",
      label: "First Step",
      description: "Complete your first lesson",
      check: (p, streak, achievements) => achievements?.some(a => a.name === "First Lesson" && a.unlocked) || (p && p.filter(x => x.completed).length >= 1),
      earned: false,
    },
    {
      id: "five",
      icon: "⚡",
      label: "Lesson Master",
      description: "Complete 10 lessons",
      check: (p, streak, achievements) => achievements?.some(a => a.name === "Lesson Master" && a.unlocked) || (p && p.filter((x) => x.completed).length >= 10),
      earned: false,
    },
    {
      id: "perfect",
      icon: "🎯",
      label: "Quiz Champion",
      description: "Score 100% in a quiz",
      check: (p, streak, achievements) => achievements?.some(a => a.name === "Quiz Champion" && a.unlocked) || (p && p.some((x) => x.lastScore === 100)),
      earned: false,
    },
    {
      id: "streak7",
      icon: "🔥",
      label: "7-Day Streak",
      description: "Stay active for 7 days",
      check: (p, streak, achievements) => achievements?.some(a => a.name === "7 Day Streak" && a.unlocked) || streak >= 7,
      earned: false,
    },
    {
      id: "streak30",
      icon: "🏆",
      label: "30-Day Streak",
      description: "Stay active for 30 days",
      check: (p, streak, achievements) => achievements?.some(a => a.name === "30 Day Streak" && a.unlocked) || streak >= 30,
      earned: false,
    },
    {
      id: "signs",
      icon: "✋",
      label: "Sign Collector",
      description: "Learn 50 signs",
      check: (p, streak, achievements) => achievements?.some(a => a.name === "Sign Collector" && a.unlocked),
      earned: false,
    },
    {
      id: "early",
      icon: "🌅",
      label: "Early Bird",
      description: "Complete a lesson before 9 AM",
      check: (p, streak, achievements) => achievements?.some(a => a.name === "Early Bird" && a.unlocked),
      earned: false,
    },
  ];
};

// ── Component ──────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { token } = useAuth();
  const [progress, setProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStreak, setBackendStreak] = useState({ currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const progressData = await getMyProgress(token);
      
      // Handle both old and new response formats
      let progressArray = [];
      let streakData = { currentStreak: 0, longestStreak: 0 };
      
      if (progressData && progressData.progress) {
        // New format: { progress: [], streak: {}, achievementsCount: 0 }
        progressArray = progressData.progress || [];
        streakData = progressData.streak || { currentStreak: 0, longestStreak: 0 };
      } else if (Array.isArray(progressData)) {
        // Old format: just an array
        progressArray = progressData;
      }
      
      setProgress(progressArray);
      setBackendStreak(streakData);
      
      const [achievementsData, subscriptionData, leaderboardData] = await Promise.all([
        getAchievements(token).catch(() => []),
        getMySubscription(token).catch(() => null),
        getLeaderboard(token, "lessons", 5).catch(() => []),
      ]);
      
      setAchievements(achievementsData || []);
      setSubscription(subscriptionData);
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedLessons = useMemo(
    () => progress.filter((item) => item.completed).length,
    [progress]
  );

  const averageScore = useMemo(() => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, item) => sum + (item.lastScore || 0), 0);
    return Math.round(total / progress.length);
  }, [progress]);

  const calculatedStreak = useMemo(() => calcStreak(progress), [progress]);
  
  const streak = useMemo(() => {
    // Use backend streak if available, otherwise calculate
    if (backendStreak.currentStreak > 0) {
      return backendStreak.currentStreak;
    }
    return calculatedStreak;
  }, [calculatedStreak, backendStreak]);

  const weekDays = useMemo(() => getLast7Days(progress), [progress]);

  const totalXP = useMemo(
    () => progress.reduce((sum, item) => sum + (item.bestScore || 0) * 3, 0),
    [progress]
  );

  const level = Math.max(1, Math.floor(totalXP / 300) + 1);
  const levelXP = (level - 1) * 300;
  const nextLevelXP = level * 300;
  const xpProgress = Math.min(((totalXP - levelXP) / (nextLevelXP - levelXP)) * 100, 100);

  const bestScore = progress.length ? Math.max(...progress.map((p) => p.bestScore || 0)) : 0;

  // Get badge rules with backend achievement data
  const badgeRules = useMemo(() => {
    const rules = getBadgeRules(achievements);
    return rules.map(rule => ({
      ...rule,
      earned: rule.check(progress, streak, achievements),
    }));
  }, [progress, streak, achievements]);

  const earnedCount = badgeRules.filter((b) => b.earned).length;

  // Get subscription plan display
  const getSubscriptionBadge = () => {
    if (!subscription) return "FREE";
    switch (subscription.plan) {
      case "MONTHLY": return "💎 PREMIUM";
      case "YEARLY": return "💎 YEARLY";
      case "LIFETIME": return "👑 LIFETIME";
      default: return "FREE";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Learning Dashboard</h1>
          <p className="dashboard-subtitle">
            Track your Uzbek Sign Language learning journey, achievements, and lesson progress.
          </p>
        </div>
        <div className="subscription-badge">
          {getSubscriptionBadge()}
        </div>
      </div>

      {/* Summary cards */}
      <div className="dashboard-summary-grid">
        <div className="summary-card">
          <span className="summary-label">Tracked Lessons</span>
          <strong className="summary-value">{progress.length}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Completed Lessons</span>
          <strong className="summary-value">{completedLessons}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Average Score</span>
          <strong className="summary-value">{averageScore}%</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Best Score</span>
          <strong className="summary-value">{bestScore}%</strong>
        </div>
      </div>

      {/* Main hero */}
      <div className="dashboard-main-grid">
        <div className="dashboard-card dashboard-card-hero">
          <div className="card-header-row">
            <div className="card-header-left">
              <div className="card-icon card-icon-blue">XP</div>
              <div>
                <h2 className="card-title">XP & Level</h2>
                <p className="card-subtext">
                  Your current progress toward the next level
                </p>
              </div>
            </div>
          </div>

          <div className="xp-hero-layout">
            <div className="level-circle">{level}</div>

            <div className="xp-content">
              <div className="xp-top-row">
                <div>
                  <div className="xp-level-text">Level {level}</div>
                  <div className="xp-earned-text">
                    {totalXP.toLocaleString()} XP earned
                  </div>
                </div>

                <div className="xp-next-box">
                  <span className="xp-next-label">To next level</span>
                  <strong className="xp-next-value">
                    {Math.max(nextLevelXP - totalXP, 0)} XP
                  </strong>
                </div>
              </div>

              <div className="xp-bar-wrap">
                <div className="xp-bar">
                  <div
                    className="xp-bar-fill"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>

                <div className="xp-meta-row">
                  <span>Level {level}</span>
                  <span>{Math.round(xpProgress)}% completed</span>
                  <span>Level {level + 1}</span>
                </div>
              </div>

              <div className="mini-stats-grid">
                <div className="mini-stat">
                  <span className="mini-stat-label">Best score</span>
                  <strong className="mini-stat-value">{bestScore}%</strong>
                </div>

                <div className="mini-stat">
                  <span className="mini-stat-label">Completed</span>
                  <strong className="mini-stat-value">{completedLessons}</strong>
                </div>

                <div className="mini-stat">
                  <span className="mini-stat-label">Current streak</span>
                  <strong className="mini-stat-value">{streak} days</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-secondary-grid">
          {/* Streak */}
          <div className="dashboard-card">
            <div className="card-header-row">
              <div className="card-header-left">
                <div className="card-icon card-icon-orange">🔥</div>
                <div>
                  <h2 className="card-title">Daily Streak</h2>
                  <p className="card-subtext">Stay consistent every day</p>
                </div>
              </div>
            </div>

            <div className="streak-number-row">
              <span className="streak-number">{streak}</span>
              <span className="streak-days-text">days</span>
            </div>

            <div className="week-strip">
              {weekDays.map((day, index) => {
                let shouldBeMarked = false;
                
                if (streak > 0) {
                  // Get the position from the end (today is last item)
                  const daysFromEnd = weekDays.length - 1 - index;
                  // Mark if within streak range (streak includes today)
                  shouldBeMarked = daysFromEnd < streak;
                }
                
                return (
                  <div key={index} className="week-day-item">
                    <div
                      className={`week-day-dot ${
                        shouldBeMarked ? "done" : day.isToday ? "today" : ""
                      }`}
                    >
                      {shouldBeMarked ? "✓" : day.isToday ? "🔥" : "•"}
                    </div>
                    <span className="week-day-label">{day.label}</span>
                  </div>
                );
              })}
            </div>

            <p className="streak-message">
              {streak > 0
                ? `Great job! You're on a ${streak}-day streak! 🔥`
                : "No streak yet. Finish one lesson today to start your streak!"}
            </p>
          </div>

          {/* Achievements */}
          <div className="dashboard-card">
            <div className="card-header-row">
              <div className="card-header-left">
                <div className="card-icon card-icon-purple">🏅</div>
                <div>
                  <h2 className="card-title">Achievements</h2>
                  <p className="card-subtext">
                    {earnedCount} of {badgeRules.length} unlocked
                  </p>
                </div>
              </div>

              <div className="achievement-count-badge">
                {earnedCount}/{badgeRules.length}
              </div>
            </div>

            <div className="badge-grid">
              {badgeRules.map((badge) => (
                <div
                  key={badge.id}
                  className={`badge-card ${badge.earned ? "earned" : "locked"}`}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-content">
                    <div className="badge-name">{badge.label}</div>
                    <div className="badge-description">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="dashboard-card">
          <div className="table-header">
            <h2 className="card-title">🏆 Leaderboard</h2>
            <p className="card-subtext">Top learners</p>
          </div>
          <div className="table-wrap">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Achievement</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.userId}>
                    <td>
                      <span className={`rank-badge rank-${entry.rank}`}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td>{entry.user?.fullName || `User ${entry.userId}`}</td>
                    <td>
                      {entry.count} {entry.label === 'lessons' ? 'lessons completed' : 
                                   entry.label === 'days' ? 'day streak' : 
                                   entry.label === 'XP' ? 'XP' : 'points'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progress history */}
      <div className="dashboard-card">
        <div className="table-header">
          <h2 className="card-title">My Progress History</h2>
          <p className="card-subtext">All recorded lesson activity</p>
        </div>

        {progress.length === 0 ? (
          <div className="empty-state">No learning progress recorded yet. Start your first lesson!</div>
        ) : (
          <div className="table-wrap">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Lesson</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Best Score</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((item) => (
                  <tr key={item.id}>
                    <td>{item.lesson?.title || "-"}</td>
                    <td>{item.lesson?.category?.name || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.completed ? "completed" : "in-progress"
                        }`}
                      >
                        {item.completed ? "✅ Completed" : "📖 In Progress"}
                      </span>
                    </td>
                    <td>{item.lastScore ?? 0}%</td>
                    <td>{item.bestScore ?? 0}%</td>
                    <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;