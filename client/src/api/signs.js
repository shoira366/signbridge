import axios from "axios";
import api from "./axios";

const API_BASE_URL = "http://localhost:3000/api";

export const getSignsByLesson = async (lessonId) => {
  const res = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/signs`);
  return res.data;
};

export const createSign = async (lessonId, formData) => {
  const res = await axios.post(
    `${API_BASE_URL}/signs/lessons/${lessonId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};