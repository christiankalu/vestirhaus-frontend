
import { create } from "zustand";

import api from "@/api/axios";
import { tokenStorage } from "@/utils/storage";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
  isLoading: false,
  initialized: false,

  setUser(user) {
    set({
      user,
      isAuthenticated: Boolean(tokenStorage.getAccessToken()),
    });
  },

  async login(credentials) {
    set({ isLoading: true });

    try {
      const { data } = await api.post("/auth/login/", credentials);

      if (!data.access || !data.refresh) {
        throw new Error("The login response did not contain both JWT tokens.");
      }

      tokenStorage.setTokens({
        access: data.access,
        refresh: data.refresh,
      });

      // The backend may return a user object with the tokens.
      // Otherwise, retrieve the canonical profile from the API.
      const user = data.user ?? (await api.get("/users/me/")).data;

      set({
        user,
        isAuthenticated: true,
        initialized: true,
      });

      return user;
    } finally {
      set({ isLoading: false });
    }
  },

  async fetchCurrentUser() {
    const accessToken = tokenStorage.getAccessToken();

    if (!accessToken) {
      set({
        user: null,
        isAuthenticated: false,
        initialized: true,
      });
      return null;
    }

    try {
      const { data } = await api.get("/users/me/");

      set({
        user: data,
        isAuthenticated: true,
        initialized: true,
      });

      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        tokenStorage.clear();

        set({
          user: null,
          isAuthenticated: false,
          initialized: true,
        });

        return null;
      }

      // Preserve an existing session on network/server errors.
      set({ initialized: true });
      throw error;
    }
  },

  async logout() {
    const refresh = tokenStorage.getRefreshToken();

    try {
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } finally {
      tokenStorage.clear();

      set({
        user: null,
        isAuthenticated: false,
        initialized: true,
      });
    }
  },

  clearAuth() {
    tokenStorage.clear();

    set({
      user: null,
      isAuthenticated: false,
      initialized: true,
    });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("vestirhaus:auth-expired", () => {
    useAuthStore.getState().clearAuth();
  });
}
