import api from "./axios";

export const getMe = async (token) => {
  const res = await api.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateProfile = async (token, data) => {
  const res = await api.put("/users/me", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const changePassword = async (token, data) => {
  const res = await api.put("/users/change-password", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};