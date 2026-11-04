import { NavLink } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  TicketPercent,
  Users,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    to: "/admin-panel",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Products",
    to: "/admin-panel/products",
    icon: Package,
  },
  {
    label: "Orders",
    to: "/admin-panel/orders",
    icon: BarChart3,
  },
  {
    label: "Customers",
    to: "/admin-panel/customers",
    icon: Users,
  },
  {
    label: "Coupons",
    to: "/admin-panel/coupons",
    icon: TicketPercent,
  },
];

export default function AdminSidebar({
  open,
  onClose,
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#211B18]/50 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col",
          "bg-[#211B18] text-[#F7F0E6] transition-transform duration-300",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
          <div>
            <p className="font-serif text-3xl tracking-[-0.06em]">
              vestirhaus
            </p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-[#D6AF72]">
              Administration
            </p>
          </div>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="grid size-9 place-items-center text-white/70 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-6 pb-3 pt-8">
          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/40">
            Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex min-h-12 items-center gap-3 px-4 text-xs transition",
                  isActive
                    ? "bg-[#A94F32] text-white"
                    : "text-white/65 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <Icon size={17} strokeWidth={1.7} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-5">
          <p className="text-[9px] uppercase tracking-[0.14em] text-white/45">
            Vestirhaus Admin
          </p>
          <p className="mt-2 text-xs text-white/70">
            Store management workspace
          </p>
        </div>
      </aside>
    </>
  );
}