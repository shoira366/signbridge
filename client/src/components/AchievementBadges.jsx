// src/components/AchievementBadges.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AchievementBadges = () => {
  const { token } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await api.get("/achievements/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAchievements(res.data);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading achievements...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>🏆 Your Achievements</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: achievement.unlocked ? "2px solid #fbbf24" : "1px solid #e2e8f0",
              background: achievement.unlocked ? "#fef3c7" : "#f8fafc",
              textAlign: "center",
              transition: "transform 0.2s",
              cursor: "pointer",
              opacity: achievement.unlocked ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (achievement.unlocked) e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>
              {achievement.unlocked ? "🏆" : "🔒"}
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
              {achievement.name}
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b" }}>{achievement.description}</p>
            {!achievement.unlocked && achievement.requiredLessons > 0 && (
              <p style={{ fontSize: "11px", color: "#f59e0b", marginTop: "8px" }}>
                Complete {achievement.requiredLessons} lessons to unlock
              </p>
            )}
            {achievement.unlocked && achievement.unlockedAt && (
              <p style={{ fontSize: "11px", color: "#10b981", marginTop: "8px" }}>
                Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges;