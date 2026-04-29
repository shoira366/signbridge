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

export const completeLesson = async (lessonId, token) => {
  const res = await api.post(
    `/progress/complete-lesson/${lessonId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// NEW FUNCTIONS FOR ANSWER PERSISTENCE

// Save user answers for a lesson
export const saveUserAnswers = async (lessonId, answers, token) => {
  const res = await api.post(
    `/progress/lessons/${lessonId}/answers`,
    { answers },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// Get user answers for a lesson
export const getUserAnswers = async (lessonId, token) => {
  const res = await api.get(`/progress/lessons/${lessonId}/answers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Clear user answers for a lesson
export const clearUserAnswers = async (lessonId, token) => {
  const res = await api.delete(`/progress/lessons/${lessonId}/answers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};