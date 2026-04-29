import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const StreakCounter = () => {
  const { token } = useAuth();
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const res = await api.get("/streak/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStreak(res.data);
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (!streak) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      borderRadius: "12px",
      padding: "12px 20px",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      gap: "12px"
    }}>
      <span style={{ fontSize: "24px" }}>🔥</span>
      <div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>Current Streak</div>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>
          {streak.currentStreak} days
        </div>
      </div>
      <div style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.3)" }} />
      <div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>Longest Streak</div>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          {streak.longestStreak} days
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;