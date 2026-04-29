import api from "./axios";

// Get user notifications
export const getNotifications = async (token) => {
  const res = await api.get("/notifications", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, token) => {
  const res = await api.patch(`/notifications/${notificationId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (token) => {
  const res = await api.patch("/notifications/read-all", {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};