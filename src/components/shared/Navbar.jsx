import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, UserRound } from "lucide-react";

import { useCartStore } from "@/store/cartStore";

const navigation = [
  { label: "New Arrivals", to: "/shop?sort=newest" },
  { label: "Men", to: "/categories/men" },
  { label: "Women", to: "/categories/women" },
  { label: "Kids", to: "/categories/kids" },
  { label: "Accessories", to: "/shop?category=accessories" },
];

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce(
    (count, item) => count + Number(item.quantity || 0),
    0,
  );

  return (
    <header className="sticky top-0 z-50 border-b border-brand-cream bg-brand-ivory/95 backdrop-blur">
      <div className="container-editorial flex h-[76px] items-center justify-between gap-4">
        <Link
          to="/"
          className="font-heading text-3xl font-semibold tracking-tight"
          aria-label="Vestirhaus home"
        >
          vestirhaus<span className="text-brand-terracotta">.</span>
        </Link>

        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors hover:text-brand-terracotta ${
                  isActive ? "font-semibold text-brand-terracotta" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/account"
            aria-label="My account"
            className="rounded-full p-2 hover:bg-brand-cream"
          >
            <UserRound size={20} strokeWidth={1.6} />
          </Link>

          <Link
            to="/cart"
            aria-label={`Shopping bag, ${cartCount} items`}
            className="relative rounded-full p-2 hover:bg-brand-cream"
          >
            <ShoppingBag size={20} strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-terracotta px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
