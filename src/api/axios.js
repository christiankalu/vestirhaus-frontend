
import axios from "axios";
import { tokenStorage } from "@/utils/storage";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function getCookie(name) {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8000/api";

let csrfRequest = null;

async function ensureCsrfToken() {
  let token = getCookie("csrftoken");

  if (token) return token;

  if (!csrfRequest) {
    csrfRequest = axios
      .get(`${API_BASE_URL.replace(/\/+$/, "")}/csrf/`, {
        withCredentials: true,
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  const response = await csrfRequest;

  // Prefer the cookie. The JSON token is a fallback.
  token = getCookie("csrftoken") ?? response.data?.csrfToken;

  if (!token) {
    throw new Error(
      "Unable to obtain a Django CSRF token. Check the CSRF cookie and CORS settings.",
    );
  }

  return token;
}


api.interceptors.request.use(
  async (config) => {
    const method = (config.method ?? "get").toLowerCase();

    const requiresCsrf = [
      "post",
      "put",
      "patch",
      "delete",
    ].includes(method);

    if (requiresCsrf) {
      const csrfToken = await ensureCsrfToken();

      config.headers = config.headers ?? {};
      config.headers["X-CSRFToken"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);


// Use a separate instance for refresh so the refresh request does not
// recursively trigger the same response interceptor.
const refreshClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let refreshPromise = null;

function clearAuthentication() {
  tokenStorage.clear();

  // Notify the Zustand store without creating an import cycle.
  window.dispatchEvent(new CustomEvent("vestirhaus:auth-expired"));
}

api.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest.url?.includes(
      "/auth/token/refresh/",
    );

    if (
      error.response.status !== 401 ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    // Public requests and anonymous sessions should not attempt refresh.
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post("/auth/token/refresh/", {
            refresh: refreshToken,
          })
          .then(({ data }) => {
            if (!data.access) {
              throw new Error("Refresh response did not contain an access token.");
            }

            tokenStorage.setAccessToken(data.access);

            // SimpleJWT may rotate refresh tokens when configured to do so.
            if (data.refresh) {
              tokenStorage.setTokens({
                access: data.access,
                refresh: data.refresh,
              });
            }

            return data.access;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthentication();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
