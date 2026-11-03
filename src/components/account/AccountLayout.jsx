import { Outlet, useNavigate } from "react-router-dom";

import AccountSidebar from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/authStore";

export default function AccountLayout() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", {
        replace: true,
        state: { notice: "You have signed out successfully." },
      });
    }
  }

  return (
    <main className="min-h-[70vh] bg-[#F7F0E6] text-[#211B18]">
      <div className="mx-auto max-w-[1500px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
          <AccountSidebar user={user} onLogout={handleLogout} />

          <section className="min-w-0">
            <Outlet />
          </section>
        </div>

        <div className="mt-8 border-t border-[#211B18]/10 pt-5 md:hidden">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-[#A94F32]"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}