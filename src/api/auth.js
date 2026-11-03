import api from "@/api/axios";

export const AUTH_ENDPOINTS = {
  login: "/auth/login/",
  register: "/auth/register/",
  logout: "/auth/logout/",
  me: "/users/me/",
  forgotPassword: "/auth/password/reset/",
  resetPassword: "/auth/password/reset/confirm/",
  verifyEmail: (token) =>
    `/auth/verify-email/${encodeURIComponent(token)}/`,
};

export async function registerAccount(data) {
  const nameParts = data.full_name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const response = await api.post(AUTH_ENDPOINTS.register, {
    first_name: firstName,
    last_name: lastName,
    email: data.email,
    phone: data.phone,
    password: data.password,
    confirm_password: data.confirm_password,
  });

  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await api.post(
    AUTH_ENDPOINTS.forgotPassword,
    { email },
  );

  return response.data;
}

export async function confirmPasswordReset(token, data) {
  const response = await api.post(
    AUTH_ENDPOINTS.resetPassword,
    {
      token,
      password: data.password,
      confirm_password: data.confirm_password,
    },
  );

  return response.data;
}

export async function verifyEmailAddress(token) {
  const response = await api.post(
    AUTH_ENDPOINTS.verifyEmail(token),
  );

  return response.data;
}

export async function getCurrentProfile() {
  const response = await api.get(AUTH_ENDPOINTS.me);
  return response.data?.user ?? response.data?.data ?? response.data;
}

export async function updateCurrentProfile(data) {
  const response = await api.patch(AUTH_ENDPOINTS.me, data);
  return response.data?.user ?? response.data?.data ?? response.data;
}

export async function logoutAccount() {
  const response = await api.post(AUTH_ENDPOINTS.logout);
  return response.data;
}