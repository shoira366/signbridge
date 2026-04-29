import api from "./axios";

// ==================== USER API CALLS ====================

// Get all quizzes with user progress
export const getAllQuizzes = async () => {
  const res = await api.get("/quizzes");
  return res.data;
};

// Get quizzes by lesson (checks lesson completion)
export const getQuizzesByLesson = async (lessonId) => {
  const res = await api.get(`/quizzes/lessons/${lessonId}`);
  return res.data;
};

// Get quiz questions (with premium filtering)
export const getQuizQuestions = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}/questions`);
  return res.data;
};

// Submit quiz answers
export const submitQuiz = async (quizId, answers) => {
  const res = await api.post(`/quizzes/${quizId}/submit`, { answers });
  return res.data;
};

// Get single quiz
export const getQuizById = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}`);
  return res.data;
};

// ==================== ADMIN API CALLS ====================

// Admin: Get all quizzes (no filters)
export const adminGetAllQuizzes = async () => {
  const res = await api.get("/quizzes/admin/all");
  return res.data;
};

// Admin: Get quizzes by lesson (no completion check)
export const adminGetQuizzesByLesson = async (lessonId) => {
  const res = await api.get(`/quizzes/lessons/${lessonId}`);
  return res.data;
};

// Admin: Get quiz by ID (no completion check)
export const adminGetQuizById = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}`);
  return res.data;
};

// Admin: Create quiz
export const adminCreateQuiz = async (lessonId, data) => {
  const res = await api.post(`/quizzes/lessons/${lessonId}`, data);
  return res.data;
};

// Admin: Update quiz
export const adminUpdateQuiz = async (quizId, data) => {
  const res = await api.put(`/quizzes/${quizId}`, data);
  return res.data;
};

// Admin: Delete quiz
export const adminDeleteQuiz = async (quizId) => {
  const res = await api.delete(`/quizzes/${quizId}`);
  return res.data;
};

// Admin: Create quiz question
export const adminCreateQuizQuestion = async (quizId, data) => {
  const res = await api.post(`/quizzes/${quizId}/questions`, data);
  return res.data;
};

// Admin: Update quiz question
export const adminUpdateQuizQuestion = async (questionId, data) => {
  const res = await api.put(`/quizzes/questions/${questionId}`, data);
  return res.data;
};

// Admin: Delete quiz question
export const adminDeleteQuizQuestion = async (questionId) => {
  const res = await api.delete(`/quizzes/questions/${questionId}`);
  return res.data;
};