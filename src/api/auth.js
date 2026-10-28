import api from "@/api/axios";

export const authApi = {
  register: (payload) => api.post("/auth/register/", payload),
  login: (payload) => api.post("/auth/login/", payload),
  logout: (refresh) => api.post("/auth/logout/", { refresh }),
  verifyEmail: (payload) => api.post("/auth/verify-email/", payload),
  forgotPassword: (payload) => api.post("/auth/forgot-password/", payload),
  resetPassword: (payload) => api.post("/auth/reset-password/", payload),
  getProfile: () => api.get("/users/me/"),
  updateProfile: (payload) => api.put("/users/me/", payload),
  getAddresses: () => api.get("/users/me/addresses/"),
};
