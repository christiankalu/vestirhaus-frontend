
const ACCESS_KEY = "vestirhaus_access_token";
const REFRESH_KEY = "vestirhaus_refresh_token";

export const tokenStorage = {
  getAccessToken() {
    return sessionStorage.getItem(ACCESS_KEY);
  },

  getRefreshToken() {
    return sessionStorage.getItem(REFRESH_KEY);
  },

  setTokens({ access, refresh }) {
    if (access) sessionStorage.setItem(ACCESS_KEY, access);
    if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
  },

  setAccessToken(access) {
    sessionStorage.setItem(ACCESS_KEY, access);
  },

  clear() {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};
