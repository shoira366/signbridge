import api from "./axios";

export const createQuiz = async (lessonId, payload, token) => {
    console.log(lessonId)
  const res = await api.post(`/quizzes/lessons/${lessonId}/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getQuizzesByLesson = async (lessonId) => {
  const res = await api.get(`/quizzes/lessons/${lessonId}/`);
  return res.data;
};

export const createQuizQuestion = async (quizId, payload, token) => {
  const res = await api.post(`/quizzes/${quizId}/questions`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const deleteQuiz = async (quizId, token) => {
  const res = await api.delete(`/quizzes/${quizId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const deleteQuizQuestion = async (questionId, token) => {
  const res = await api.delete(`/quizzes/questions/${questionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getQuizQuestions = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}/questions`);
  return res.data;
};