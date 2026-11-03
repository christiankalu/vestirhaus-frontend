import { create } from "zustand";

import api from "@/api/axios";
import { tokenStorage } from "@/utils/storage";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
  isLoading: false,
  initialized: false,
  isInitialized: false,

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

  fetchCurrentUser: async () => {
    set({ isLoading: true });

    try {
      // Keep your existing API request and response mapping here.
      // The Phase 6 endpoint was /users/me/.
      const response = await api.get("/users/me/");

      const user =
        response.data?.user ??
        response.data?.data ??
        response.data;

      set({
        user,
        isInitialized: true,
      });

      return user;
    } catch (error) {
      // Keep your existing token cleanup here if you have it.
      set({
        user: null,
        isInitialized: true,
      });

      return null;
    } finally {
      set({
        isLoading: false,
        isInitialized: true,
      });
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
