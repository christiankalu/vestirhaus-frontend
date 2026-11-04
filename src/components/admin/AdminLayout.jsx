import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, Store } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.assign("/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#211B18] lg:flex">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#211B18]/10 bg-[#FFFCF7]/95 px-4 backdrop-blur-md sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
              className="grid size-10 place-items-center border border-[#211B18]/10 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#A94F32]">
                Vestirhaus
              </p>
              <p className="text-sm font-medium">
                Store management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/"
              className="hidden items-center gap-2 text-xs text-[#766B63] hover:text-[#A94F32] sm:flex"
            >
              <Store size={15} /> View store
            </Link>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium">
                {user?.first_name ?? user?.email ?? "Administrator"}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#8B7D72]">
                Administrator
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="vh-button vh-button--secondary vh-button--small"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1800px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-11">
          <Outlet />
        </main>
      </div>
    </div>
  );
}