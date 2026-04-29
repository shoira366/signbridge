// ==================== ACHIEVEMENTS API ====================

import api from "./axios";

// Get user's achievements with unlock status
export const getAchievements = async (token) => {
  const res = await api.get("/achievements/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Check and unlock achievements
export const checkAchievements = async (token) => {
  const res = await api.post(
    "/achievements/check",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// Get leaderboard
export const getLeaderboard = async (token, type = "lessons", limit = 10) => {
  const res = await api.get(`/achievements/leaderboard?type=${type}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};