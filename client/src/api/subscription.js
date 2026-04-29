// ==================== SUBSCRIPTION API ====================

import api from "./axios";

// Get user's current subscription
export const getMySubscription = async (token) => {
  const res = await api.get("/subscriptions/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Create/upgrade subscription
export const createSubscription = async (plan, token) => {
  const res = await api.post(
    "/subscriptions/create",
    { plan },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// Cancel subscription
export const cancelSubscription = async (token) => {
  const res = await api.post(
    "/subscriptions/cancel",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// Check if user has access to premium lesson
export const checkPremiumAccess = async (lessonId, token) => {
  const res = await api.get(`/subscriptions/check/${lessonId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};