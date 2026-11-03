import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatKoboPrice  } from "@/utils/formatPrice";

const shopLinks = [
  { label: "Shop All", to: "/shop" },
  { label: "Men", to: "/shop/men" },
  { label: "Women", to: "/shop/women" },
  { label: "Kids", to: "/shop/kids" },
  { label: "Unisex", to: "/shop/unisex" },
  { label: "New Arrivals", to: "/shop?sort=newest" },
  { label: "Sale", to: "/shop?sale=true" },
];

const collectionLinks = [
  { label: "All Collections", to: "/collections" },
  { label: "Men's Edit", to: "/shop/men" },
  { label: "Women's Edit", to: "/shop/women" },
  { label: "Kids' Edit", to: "/shop/kids" },
  { label: "Unisex Edit", to: "/shop/unisex" },
];

function getCartSummary(store) {
  const cart = store?.cart ?? store ?? {};
  const items = Array.isArray(cart.items) ? cart.items : [];

  const count = items.reduce(
    (total, item) => total + Number(item.quantity ?? 1),
    0,
  );

  return { items, count, total: Number(cart.total ?? cart.subtotal ?? 0) };
}

export default function Navbar() {
  const navigate = useNavigate();
  const cartStore = useCartStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const { items, count, total } = getCartSummary(cartStore);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleSearch(event) {
    event.preventDefault();

    const query = searchTerm.trim();
    if (!query) return;

    setSearchOpen(false);
    setMobileOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 w-full border-b transition-all duration-300",
          scrolled
            ? "border-[#211B18]/10 bg-[#F7F0E6]/90 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-[#F7F0E6]/75 backdrop-blur-md",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[74px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="grid size-10 place-items-center text-[#211B18] md:hidden"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Wordmark */}
          <Link
            to="/"
            aria-label="Vestirhaus home"
            className="shrink-0 text-[#211B18]"
          >
            <span className="font-serif text-[25px] tracking-[-0.07em] sm:text-[28px]">
              vestirhaus
            </span>
            <span className="ml-2 hidden text-[8px] font-medium tracking-[0.26em] text-[#A94F32] sm:inline">
              ROOTED IN CULTURE
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 md:flex lg:gap-9"
          >
            {/* Shop dropdown */}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium tracking-[0.12em] text-[#51453D] transition hover:text-[#A94F32]">
                Shop
                <ChevronDown
                  size={13}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="absolute left-0 top-full z-50 w-56 border border-[#211B18]/10 bg-[#FFFCF7] p-3 pt-5 shadow-xl">
                {shopLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block px-3 py-3 text-xs text-[#51453D] transition hover:bg-[#F0E8DC] hover:text-[#A94F32]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>

            {/* Collections dropdown */}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium tracking-[0.12em] text-[#51453D] transition hover:text-[#A94F32]">
                Collections
                <ChevronDown
                  size={13}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="absolute left-0 top-full z-50 w-56 border border-[#211B18]/10 bg-[#FFFCF7] p-3 pt-5 shadow-xl">
                {collectionLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block px-3 py-3 text-xs text-[#51453D] transition hover:bg-[#F0E8DC] hover:text-[#A94F32]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>

            <Link
              to="/about"
              className="text-[11px] font-medium tracking-[0.12em] text-[#51453D] transition hover:text-[#A94F32]"
            >
              About
            </Link>

            <Link
              to="/blog"
              className="text-[11px] font-medium tracking-[0.12em] text-[#51453D] transition hover:text-[#A94F32]"
            >
              Blog
            </Link>
          </nav>

          {/* Action icons */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="grid size-9 place-items-center text-[#211B18] transition hover:text-[#A94F32]"
            >
              {searchOpen ? (
                <X size={19} strokeWidth={1.5} />
              ) : (
                <Search size={19} strokeWidth={1.5} />
              )}
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden size-9 place-items-center text-[#211B18] transition hover:text-[#A94F32] sm:grid"
            >
              <Heart size={19} strokeWidth={1.5} />
            </Link>

            {/* Cart and desktop mini preview */}
            <div
              className="relative"
              onMouseEnter={() => setCartOpen(true)}
              onMouseLeave={() => setCartOpen(false)}
            >
              <button
                type="button"
                aria-label={`Shopping bag with ${count} items`}
                aria-expanded={cartOpen}
                onClick={() => setCartOpen((open) => !open)}
                className="relative grid size-9 place-items-center text-[#211B18] transition hover:text-[#A94F32]"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                <span className="absolute -right-0.5 -top-0.5 grid size-[17px] place-items-center rounded-full bg-[#A94F32] text-[9px] font-medium text-white">
                  {count > 9 ? "9+" : count}
                </span>
              </button>

              {cartOpen && (
                <div className="absolute right-0 top-full z-50 hidden w-[320px] border border-[#211B18]/10 bg-[#FFFCF7] p-5 shadow-xl md:block">
                  <div className="mb-4 flex items-center justify-between border-b border-[#211B18]/10 pb-3">
                    <p className="font-serif text-lg">Your bag</p>
                    <span className="text-xs text-[#766B63]">
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="py-7 text-center">
                      <ShoppingBag
                        size={24}
                        className="mx-auto mb-3 text-[#A94F32]"
                      />
                      <p className="text-sm">Your bag is waiting.</p>
                      <p className="mt-1 text-xs text-[#766B63]">
                        Discover something made for you.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[260px] space-y-4 overflow-y-auto">
                      {items.slice(0, 3).map((item, index) => {
                        const name =
                          item.product?.name ??
                          item.product_name ??
                          item.name ??
                          "Product";
                        const image =
                          item.product?.image ??
                          item.product_image ??
                          item.image;

                        return (
                          <div
                            key={item.id ?? item.variant_id ?? index}
                            className="flex gap-3"
                          >
                            <div className="size-[65px] shrink-0 bg-[#EEE6DB]">
                              {image && (
                                <img
                                  src={image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm">{name}</p>
                              <p className="mt-1 text-xs text-[#766B63]">
                                Qty: {item.quantity ?? 1}
                              </p>
                              <p className="mt-1 text-sm font-medium">
                                {formatKoboPrice (
                                  Number(
                                    item.unit_price ??
                                      item.variant?.current_price ??
                                      item.product?.current_price ??
                                      item.product?.price ??
                                      item.price ??
                                      0,
                                  ),
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {items.length > 3 && (
                        <p className="text-xs text-[#766B63]">
                          And {items.length - 3} more item(s)
                        </p>
                      )}
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="mt-4 flex justify-between border-t border-[#211B18]/10 pt-4 text-sm">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatKoboPrice (total)}</span>
                    </div>
                  )}

                  <Link
                    to="/cart"
                    onClick={() => setCartOpen(false)}
                    className="vh-button vh-button--primary vh-button--full mt-4"
                  >
                    View bag 
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/account"
              aria-label="My account"
              className="hidden size-9 place-items-center text-[#211B18] transition hover:text-[#A94F32] sm:grid"
            >
              <UserRound size={19} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="border-t border-[#211B18]/10 bg-[#FFFCF7] px-4 py-5 sm:px-6 lg:px-10">
            <form
              onSubmit={handleSearch}
              className="mx-auto flex max-w-3xl items-center gap-3"
            >
              <Search
                size={19}
                className="shrink-0 text-[#766B63]"
              />
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search clothing, collections, and more..."
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[#998D82]"
              />
              <button
                type="submit"
                className="bg-[#211B18] px-4 py-2.5 text-xs text-white transition hover:bg-[#A94F32]"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-[#211B18]/45"
            onClick={closeMobile}
          />

          <aside
            className="absolute inset-y-0 left-0 flex w-[min(88%,380px)] flex-col bg-[#F7F0E6] p-6 shadow-2xl"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b border-[#211B18]/10 pb-5">
              <Link
                to="/"
                onClick={closeMobile}
                className="font-serif text-2xl tracking-[-0.06em]"
              >
                vestirhaus
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMobile}
                className="grid size-10 place-items-center"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="mt-8 flex flex-col overflow-y-auto">
              <details className="border-b border-[#211B18]/10">
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-serif text-2xl">
                  Shop
                  <ChevronDown size={17} />
                </summary>

                <div className="pb-4 pl-3">
                  {shopLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={closeMobile}
                      className="block py-3 text-sm text-[#766B63] transition hover:text-[#A94F32]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </details>

              <details className="border-b border-[#211B18]/10">
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-serif text-2xl">
                  Collections
                  <ChevronDown size={17} />
                </summary>

                <div className="pb-4 pl-3">
                  {collectionLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={closeMobile}
                      className="block py-3 text-sm text-[#766B63] transition hover:text-[#A94F32]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                to="/about"
                onClick={closeMobile}
                className="border-b border-[#211B18]/10 py-5 font-serif text-2xl"
              >
                About
              </Link>

              <Link
                to="/blog"
                onClick={closeMobile}
                className="border-b border-[#211B18]/10 py-5 font-serif text-2xl"
              >
                Blog
              </Link>
            </nav>

            <div className="mt-auto space-y-2 border-t border-[#211B18]/10 pt-5">
              <Link
                to="/wishlist"
                onClick={closeMobile}
                className="flex items-center gap-3 py-3 text-sm"
              >
                <Heart size={18} /> Wishlist
              </Link>
              <Link
                to="/account"
                onClick={closeMobile}
                className="flex items-center gap-3 py-3 text-sm"
              >
                <UserRound size={18} /> My account
              </Link>
              <Link
                to="/cart"
                onClick={closeMobile}
                className="flex items-center gap-3 py-3 text-sm"
              >
                <ShoppingBag size={18} /> Shopping bag ({count})
              </Link>
            </div>

            <p className="pt-6 text-[10px] tracking-[0.2em] text-[#766B63]">
              ROOTED IN CULTURE. MADE FOR TODAY.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}