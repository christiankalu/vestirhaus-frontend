import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { fetchCategories, fetchProducts } from "@/api/products";
import { addVariantToCart } from "@/api/cart";
import ProductCard from "@/components/products/ProductCard";
import { formatPrice } from "@/utils/formatPrice";

const PRICE_LIMIT = 500000;
const PAGE_SIZE = 12;

const FALLBACK_CATEGORIES = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
  { label: "Unisex", value: "unisex" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const COLORS = [
  { name: "Black", hex: "#211B18" },
  { name: "Ivory", hex: "#F5EFE5" },
  { name: "Terracotta", hex: "#A94F32" },
  { name: "Brown", hex: "#79513B" },
  { name: "Olive", hex: "#777A4E" },
  { name: "Blue", hex: "#4E6F91" },
];

const EMPTY_FILTERS = {
  category: "",
  gender: "",
  minPrice: 0,
  maxPrice: PRICE_LIMIT,
  sizes: [],
  color: "",
  inStock: false,
};

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function FilterPanel({
  filters,
  setFilters,
  categories,
  onClose,
}) {
  const update = (patch) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Filters</h2>
        <button
          type="button"
          onClick={() => setFilters({ ...EMPTY_FILTERS })}
          className="text-xs text-[#8B7D72] underline underline-offset-4 hover:text-[#A94F32]"
        >
          Clear all
        </button>
      </div>

      {/* Department */}
      <section className="border-b border-[#211B18]/10 pb-6">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
          Department
        </h3>

        <select
          value={filters.gender}
          onChange={(event) => update({ gender: event.target.value })}
          aria-label="Filter by department"
          className="w-full border border-[#211B18]/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#A94F32]"
        >
          <option value="">All departments</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
          <option value="unisex">Unisex</option>
        </select>
      </section>

      {/* Category */}
      <section className="border-b border-[#211B18]/10 pb-6">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
          Category
        </h3>

        <select
          value={filters.category}
          onChange={(event) => update({ category: event.target.value })}
          aria-label="Filter by category"
          className="w-full border border-[#211B18]/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#A94F32]"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option
              key={`${category.value}-${category.label}`}
              value={category.value}
            >
              {category.label}
            </option>
          ))}
        </select>
      </section>

      {/* Price */}
      <section className="border-b border-[#211B18]/10 pb-6">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
          Price range
        </h3>

        <div className="mb-5 flex items-center justify-between text-xs">
          <span>{formatPrice(filters.minPrice)}</span>
          <span className="text-[#8B7D72]">to</span>
          <span>{formatPrice(filters.maxPrice)}</span>
        </div>

        <label className="mb-2 block text-[10px] text-[#766B63]">
          Minimum price
        </label>
        <input
          type="range"
          min="0"
          max={PRICE_LIMIT}
          step="5000"
          value={filters.minPrice}
          onChange={(event) =>
            update({
              minPrice: Math.min(
                Number(event.target.value),
                filters.maxPrice,
              ),
            })
          }
          aria-label="Minimum price"
          className="w-full accent-[#A94F32]"
        />

        <label className="mb-2 mt-4 block text-[10px] text-[#766B63]">
          Maximum price
        </label>
        <input
          type="range"
          min="0"
          max={PRICE_LIMIT}
          step="5000"
          value={filters.maxPrice}
          onChange={(event) =>
            update({
              maxPrice: Math.max(
                Number(event.target.value),
                filters.minPrice,
              ),
            })
          }
          aria-label="Maximum price"
          className="w-full accent-[#A94F32]"
        />

        <p className="mt-3 text-[10px] text-[#8B7D72]">
          Prices are in Nigerian naira (₦).
        </p>
      </section>

      {/* Size */}
      <section className="border-b border-[#211B18]/10 pb-6">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
          Size
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => {
            const active = filters.sizes.includes(size);

            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  update({ sizes: toggleValue(filters.sizes, size) })
                }
                className={[
                  "flex min-h-10 items-center justify-center border text-xs transition",
                  active
                    ? "border-[#211B18] bg-[#211B18] text-white"
                    : "border-[#211B18]/15 hover:border-[#211B18]",
                ].join(" ")}
              >
                {size}
              </button>
            );
          })}
        </div>
      </section>

      {/* Color */}
      <section className="border-b border-[#211B18]/10 pb-6">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
          Colour
        </h3>

        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => {
            const active = filters.color === color.name;

            return (
              <button
                key={color.name}
                type="button"
                title={color.name}
                aria-label={color.name}
                aria-pressed={active}
                onClick={() =>
                  update({
                    color: active ? "" : color.name,
                  })
                }
                className={[
                  "grid size-8 place-items-center rounded-full border",
                  active
                    ? "border-[#211B18]"
                    : "border-transparent hover:border-[#211B18]/35",
                ].join(" ")}
              >
                <span
                  className="grid size-6 place-items-center rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                >
                  {active && (
                    <Check
                      size={13}
                      className={
                        ["Black", "Brown", "Blue", "Terracotta"].includes(
                          color.name,
                        )
                          ? "text-white"
                          : "text-[#211B18]"
                      }
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {filters.color && (
          <p className="mt-3 text-xs text-[#766B63]">
            Selected: {filters.color}
          </p>
        )}
      </section>

      {/* Stock */}
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span>
          <span className="block text-sm">In stock only</span>
          <span className="mt-1 block text-xs text-[#8B7D72]">
            Hide unavailable items
          </span>
        </span>

        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(event) => update({ inStock: event.target.checked })}
          className="size-4 accent-[#A94F32]"
        />
      </label>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#211B18] px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white hover:bg-[#A94F32]"
        >
          Show results
        </button>
      )}
    </div>
  );
}

function FilterChip({ children, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 border border-[#211B18]/15 px-3 py-2 text-xs hover:border-[#A94F32] hover:text-[#A94F32]"
    >
      {children}
      <X size={13} />
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-[#E9DFD2]" />
      <div className="mt-4 h-3 w-1/3 bg-[#E9DFD2]" />
      <div className="mt-3 h-4 w-3/4 bg-[#E9DFD2]" />
      <div className="mt-3 h-3 w-1/4 bg-[#E9DFD2]" />
    </div>
  );
}

export default function ShopPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { gender: routeGender } = useParams();

    const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
    const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
    const [sort, setSort] = useState("-created_at");
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [notice, setNotice] = useState("");
    const [retryKey, setRetryKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // Read category/search parameters when arriving from another page.
  useEffect(() => {
    const category = searchParams.get("category") ?? "";
    const gender =
      routeGender ??
      searchParams.get("gender") ??
      "";

    const search = searchParams.get("search") ?? "";
    const sortQuery = searchParams.get("sort") ?? "";

    setFilters((previous) => ({
      ...previous,
      category,
      gender,
    }));

    if (sortQuery === "newest") {
      setSort("-created_at");
    }

    if (search) {
      navigate(`/search?q=${encodeURIComponent(search)}`, {
        replace: true,
      });
    }

    setPage(1);
  }, [routeGender, searchParams, navigate]);

  useEffect(() => {
    const controller = new AbortController();

    fetchCategories({ signal: controller.signal })
      .then((items) => {
        if (items.length) setCategories(items);
      })
      .catch(() => {
        // Keep the fallback list when the categories endpoint is absent.
      });

    return () => controller.abort();
  }, []);

  const requestParams = useMemo(() => {
    const params = {
      page,
      page_size: PAGE_SIZE,
      ordering: sort,
    };

    if (filters.category) params.category = filters.category;
    if (filters.gender) params.gender = filters.gender;
    if (filters.minPrice > 0) params.min_price = filters.minPrice;
    if (filters.maxPrice < PRICE_LIMIT) {
      params.max_price = filters.maxPrice;
    }
    if (filters.sizes.length) params.size = filters.sizes.join(",");
    if (filters.color) params.color = filters.color;
    if (filters.inStock) params.in_stock = "true";

    if (searchParams.get("sale") === "true") {
      params.sale = "true";
    }

    return params;
  }, [filters, page, sort]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchProducts(requestParams, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setProducts(result.results);
        setCount(result.count);
      } catch (err) {
        if (controller.signal.aborted) return;

        setProducts([]);
        setCount(0);
        setError(
          "We couldn't load the collection. Check your connection and try again.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [requestParams, retryKey]);

  // Close the drawer with Escape.
  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileFiltersOpen]);

  const selectedCategory = categories.find(
    (category) => category.value === filters.category,
  );

  const handleFilterChange = useCallback((updater) => {
    setFilters(updater);
    setPage(1);
  }, []);

  const activeChips = useMemo(() => {
    const chips = [];

    if (filters.category) {
      chips.push({
        key: "category",
        label: selectedCategory?.label ?? filters.category,
        remove: () => handleFilterChange((current) => ({
          ...current,
          category: "",
        })),
      });
    }

    if (filters.minPrice > 0) {
      chips.push({
        key: "minPrice",
        label: `From ${formatPrice(filters.minPrice)}`,
        remove: () => handleFilterChange((current) => ({
          ...current,
          minPrice: 0,
        })),
      });
    }

    if (filters.gender) {
      chips.push({
        key: "gender",
        label:
          filters.gender.charAt(0).toUpperCase() +
          filters.gender.slice(1),
        remove: () =>
          handleFilterChange((current) => ({
            ...current,
            gender: "",
          })),
      });
    }

    if (filters.maxPrice < PRICE_LIMIT) {
      chips.push({
        key: "maxPrice",
        label: `Up to ${formatPrice(filters.maxPrice)}`,
        remove: () => handleFilterChange((current) => ({
          ...current,
          maxPrice: PRICE_LIMIT,
        })),
      });
    }

    filters.sizes.forEach((size) => {
      chips.push({
        key: `size-${size}`,
        label: `Size ${size}`,
        remove: () => handleFilterChange((current) => ({
          ...current,
          sizes: current.sizes.filter((value) => value !== size),
        })),
      });
    });

    if (filters.color) {
      chips.push({
        key: "color",
        label: filters.color,
        remove: () => handleFilterChange((current) => ({
          ...current,
          color: "",
        })),
      });
    }

    if (filters.inStock) {
      chips.push({
        key: "inStock",
        label: "In stock",
        remove: () => handleFilterChange((current) => ({
          ...current,
          inStock: false,
        })),
      });
    }

    return chips;
  }, [filters, selectedCategory]);

  async function handleQuickAdd(product, selectedColor) {
    const availableVariants = product.variants.filter(
      (variant) => variant.inStock && variant.id != null,
    );

    if (!availableVariants.length) {
      setNotice(`${product.name} has no currently available options.`);
      return;
    }

    const colorMatches = availableVariants.filter(
      (variant) => variant.color === selectedColor,
    );
    const candidates = colorMatches.length
      ? colorMatches
      : availableVariants;

    const availableSizes = [
      ...new Set(candidates.map((variant) => variant.size).filter(Boolean)),
    ];

    // Never guess a clothing size. Let the shopper select their variant.
    if (availableSizes.length > 1) {
      navigate(`/products/${product.slug}`);
      return;
    }

    try {
      const variant = candidates[0];
      await addVariantToCart(variant.id, 1);
      setNotice(`${product.name} added to your bag.`);
    } catch (err) {
      setNotice(
        err?.response?.data?.detail ??
          "We couldn't add this item. Please try again.",
      );
    }
  }

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#F7F0E6] text-[#211B18]">
      <div className="mx-auto max-w-[1600px] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-12 lg:pt-16">
        <div className="mb-10 border-b border-[#211B18]/10 pb-8 sm:mb-12">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A94F32]">
            The Vestirhaus collection
          </p>
          <h1 className="font-serif text-5xl tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            Shop all.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#766B63]">
            Considered pieces, expressive details, and everyday favourites
            for every kind of wardrobe.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-[#211B18]/10 pb-5">
          <p className="text-xs text-[#766B63]" aria-live="polite">
            {loading ? "Finding your pieces…" : `${count} products`}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 border border-[#211B18]/15 px-3 py-2.5 text-xs md:hidden"
            >
              <Filter size={15} /> Filters
              {activeChips.length > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-[#A94F32] text-[10px] text-white">
                  {activeChips.length}
                </span>
              )}
            </button>

            <label className="flex items-center gap-2 text-xs">
              <SlidersHorizontal
                size={15}
                className="hidden text-[#766B63] sm:block"
              />
              <span className="hidden text-[#766B63] sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                aria-label="Sort products"
                className="max-w-[165px] bg-transparent py-2 text-xs outline-none"
              >
                <option value="-created_at">Newest</option>
                <option value="price">Price: low to high</option>
                <option value="-price">Price: high to low</option>
                <option value="-popularity">Most popular</option>
              </select>
            </label>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[#211B18]/10 py-4">
            {activeChips.map((chip) => (
              <FilterChip key={chip.key} onRemove={chip.remove}>
                {chip.label}
              </FilterChip>
            ))}

            <button
              type="button"
              onClick={() => handleFilterChange({ ...EMPTY_FILTERS })}
              className="px-2 py-2 text-xs text-[#766B63] underline underline-offset-4"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid gap-8 pt-7 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          {/* Desktop filter sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                setFilters={handleFilterChange}
                categories={categories}
              />
            </div>
          </aside>

          {/* Results */}
          <section aria-label="Product results" aria-busy={loading}>
            {notice && (
              <div
                role="status"
                className="mb-5 flex items-start justify-between gap-3 border border-[#A94F32]/25 bg-white/50 px-4 py-3 text-xs"
              >
                <span>{notice}</span>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss message"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {error && (
              <div role="alert" className="py-14 text-center">
                <p className="font-serif text-2xl">Something went wrong.</p>
                <p className="mt-3 text-sm text-[#766B63]">{error}</p>
                <button
                  type="button"
                  onClick={() => setRetryKey((value) => value + 1)}
                  className="mt-5 underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            )}

            {!error && loading && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-serif text-3xl">No pieces found.</p>
                <p className="mt-3 text-sm text-[#766B63]">
                  Try adjusting your filters to discover more.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleFilterChange({ ...EMPTY_FILTERS });
                    setSort("-created_at");
                  }}
                  className="mt-6 border-b border-[#211B18] pb-2 text-xs"
                >
                  Clear filters
                </button>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id ?? product.slug}
                    product={product}
                    onAddToCart={handleQuickAdd}
                  />
                ))}
              </div>
            )}

            {!error && totalPages > 1 && (
              <nav
                aria-label="Product pages"
                className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-[#211B18]/10 pt-8"
              >
                <button
                  type="button"
                  disabled={page === 1 || loading}
                  onClick={() => goToPage(page - 1)}
                  aria-label="Previous page"
                  className="grid size-10 place-items-center border border-[#211B18]/15 disabled:opacity-35"
                >
                  <ArrowLeft size={15} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (pageNumber) =>
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - page) <= 1,
                  )
                  .map((pageNumber, index, visiblePages) => (
                    <span key={pageNumber} className="contents">
                      {index > 0 &&
                        pageNumber - visiblePages[index - 1] > 1 && (
                          <span className="px-1 text-sm text-[#8B7D72]">
                            …
                          </span>
                        )}
                      <button
                        type="button"
                        aria-current={page === pageNumber ? "page" : undefined}
                        disabled={loading}
                        onClick={() => goToPage(pageNumber)}
                        className={[
                          "grid size-10 place-items-center border text-xs",
                          page === pageNumber
                            ? "border-[#211B18] bg-[#211B18] text-white"
                            : "border-[#211B18]/15 hover:border-[#211B18]",
                        ].join(" ")}
                      >
                        {pageNumber}
                      </button>
                    </span>
                  ))}

                <button
                  type="button"
                  disabled={page === totalPages || loading}
                  onClick={() => goToPage(page + 1)}
                  aria-label="Next page"
                  className="grid size-10 place-items-center border border-[#211B18]/15 disabled:opacity-35"
                >
                  <ArrowRight size={15} />
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-[#211B18]/45"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-2xl bg-[#F7F0E6] px-5 pb-8 pt-5"
          >
            <div className="mb-6 flex items-center justify-between border-b border-[#211B18]/10 pb-4">
              <div>
                <p className="font-serif text-2xl" id="mobile-filter-title">
                  Refine your edit
                </p>
                <p className="mt-1 text-xs text-[#766B63]">
                  Find the right fit for you.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="grid size-10 place-items-center"
              >
                <X size={20} />
              </button>
            </div>

            <FilterPanel
              filters={filters}
              setFilters={handleFilterChange}
              categories={categories}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </section>
        </div>
      )}
    </div>
  );
}