import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

export default function AdminRoute() {
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

  // Start the session check if application startup hasn't done it.
  useEffect(() => {
    if (
      !isInitialized &&
      !isLoading &&
      typeof fetchCurrentUser === "function"
    ) {
      fetchCurrentUser();
    }
  }, [
    isInitialized,
    isLoading,
    fetchCurrentUser,
  ]);

  // Wait only while the session is actually being checked.
  if (!isInitialized || isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F0E6]">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-[#D8C7B7] border-t-[#A94F32]" />

          <p className="mt-4 text-xs text-[#766B63]">
            Verifying administrator access…
          </p>
        </div>
      </main>
    );
  }

  // Not signed in: return to login and preserve the destination.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
          },
          message: "Please sign in to access the administration panel.",
        }}
      />
    );
  }

  // Signed in, but not a staff member.
  if (user.is_staff !== true) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}