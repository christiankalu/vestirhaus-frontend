import { NavLink } from "react-router-dom";
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  UserRound,
} from "lucide-react";

const links = [
  {
    label: "Profile",
    to: "/account",
    icon: UserRound,
    end: true,
  },
  {
    label: "Orders",
    to: "/account/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    to: "/account/wishlist",
    icon: Heart,
  },
  {
    label: "Addresses",
    to: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Settings",
    to: "/account/settings",
    icon: Settings,
  },
];

export default function AccountSidebar({ onLogout, user }) {
  return (
    <aside className="min-w-0">
      <div className="border-b border-[#211B18]/10 pb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#A94F32]">
          My Vestirhaus
        </p>

        <h2 className="mt-3 break-words font-serif text-2xl text-[#211B18]">
          {user?.first_name
            ? `Hello, ${user.first_name}.`
            : "Your account."}
        </h2>

        <p className="mt-2 break-all text-xs text-[#766B63]">
          {user?.email ?? ""}
        </p>
      </div>

      <nav
        aria-label="Account navigation"
        className="mt-5 flex gap-2 overflow-x-auto pb-3 md:flex-col md:overflow-visible md:pb-0"
      >
        {links.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className="account-sidebar-link flex min-h-10 shrink-0 items-center gap-3 px-4 py-3 text-xs transition-colors duration-200"
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#211B18" : "transparent",
              color: isActive ? "#FFFFFF" : "#766B63",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  style={{
                    color: isActive ? "#FFFFFF" : "#766B63",
                    flexShrink: 0,
                    opacity: 1,
                  }}
                />

                <span
                  style={{
                    color: isActive ? "#FFFFFF" : "#766B63",
                    display: "inline-block",
                    opacity: 1,
                    visibility: "visible",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-5 hidden w-full items-center gap-3 border-t border-[#211B18]/10 pt-6 text-left text-xs text-[#766B63] transition hover:text-[#A94F32] md:flex"
      >
        <LogOut size={16} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}