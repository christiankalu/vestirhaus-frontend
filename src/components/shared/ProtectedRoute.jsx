import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute() {
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );
  const isLoading = useAuthStore(
    (state) => state.isLoading,
  );
  const fetchCurrentUser = useAuthStore(
    (state) => state.fetchCurrentUser,
  );

  useEffect(() => {
    if (!isInitialized && !isLoading && fetchCurrentUser) {
      fetchCurrentUser();
    }
  }, [isInitialized, isLoading, fetchCurrentUser]);

  // Avoid redirecting while the app is still checking the saved session.
  if (!isInitialized || isLoading) {
    return (
      <main className="grid min-h-[55vh] place-items-center bg-[#F7F0E6]">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-[#D8C7B7] border-t-[#A94F32]" />
          <p className="mt-4 text-xs text-[#766B63]">
            Checking your account…
          </p>
        </div>
      </main>
    );
  }

  // Preserve the original destination so the user can return after login.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
          message: "Please sign in to access that page.",
        }}
      />
    );
  }

  return <Outlet />;
}