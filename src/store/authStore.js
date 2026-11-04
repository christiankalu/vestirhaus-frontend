import { create } from "zustand";

import api from "@/api/axios";
import { tokenStorage } from "@/utils/storage";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
  isLoading: false,
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
        isInitialized: true,
      });

      return user;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/users/me/");

      const payload =
        response.data?.user ??
        response.data?.data ??
        response.data;

      const currentUser = payload?.user ?? payload;

      set({
        user: currentUser,
      });

      return currentUser;
    } catch (error) {
      if (error.response?.status === 401) {
        // Keep your existing token cleanup logic here.
        // For example: clearTokens();
        set({ user: null });
      }

      console.error(
        "Vestirhaus session check failed:",
        error.response?.data ?? error.message,
      );

      return null;
    } finally {
      // This is essential: the route guard must not wait forever.
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
        isInitialized: true,
      });
    }
  },

  clearAuth() {
    tokenStorage.clear();

    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("vestirhaus:auth-expired", () => {
    useAuthStore.getState().clearAuth();
  });
}
