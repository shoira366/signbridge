import api from "./axios";

export const saveProgress = async (data, token) => {
  const res = await api.post("/progress", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getMyProgress = async (token) => {
  const res = await api.get("/progress/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getLessonProgress = async (lessonId, token) => {
  const res = await api.get(`/progress/lesson/${lessonId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};