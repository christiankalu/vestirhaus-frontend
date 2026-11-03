import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";

import { fetchProducts } from "@/api/products";
import { addVariantToCart } from "@/api/cart";
import ProductCard from "@/components/products/ProductCard";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const navigate = useNavigate();

  const [term, setTerm] = useState(urlQuery);
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Keep the input consistent with back/forward navigation.
  useEffect(() => {
    setTerm(urlQuery);
  }, [urlQuery]);

  // Update the URL after the user stops typing briefly.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextQuery = term.trim();
      const nextParams = new URLSearchParams(searchParams);

      if (nextQuery) {
        nextParams.set("q", nextQuery);
      } else {
        nextParams.delete("q");
      }

      if (nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true });
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [term, searchParams, setSearchParams]);

  // Fetch results whenever the debounced URL query changes.
  useEffect(() => {
    const query = urlQuery.trim();

    if (!query) {
      setProducts([]);
      setCount(0);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function runSearch() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchProducts(
          {
            search: query,
            page: 1,
            page_size: 12,
            ordering: "-created_at",
          },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;

        setProducts(result.results);
        setCount(result.count);
      } catch {
        if (controller.signal.aborted) return;

        setProducts([]);
        setCount(0);
        setError("We couldn't complete your search. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    runSearch();

    return () => controller.abort();
  }, [urlQuery]);

  async function handleQuickAdd(product, selectedColor) {
    const variants = (product.variants ?? []).filter(
      (variant) => variant.inStock && variant.id != null,
    );

    if (!variants.length) {
      setNotice("Choose product options on the product page.");
      navigate(`/products/${product.slug}`);
      return;
    }

    const matchingColors = variants.filter(
      (variant) => variant.color === selectedColor,
    );
    const candidates = matchingColors.length ? matchingColors : variants;
    const uniqueSizes = [
      ...new Set(candidates.map((variant) => variant.size).filter(Boolean)),
    ];

    if (uniqueSizes.length > 1) {
      window.location.assign(`/products/${product.slug}`);
      return;
    }

    try {
      await addVariantToCart(candidates[0].id, 1);
      setNotice(`${product.name} added to your bag.`);
    } catch (err) {
      setNotice(
        err?.response?.data?.detail ??
          "We couldn't add this item. Please try again.",
      );
    }
  }

  return (
    <main className="min-h-[60vh] bg-[#F7F0E6] text-[#211B18]">
      <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A94F32]">
          Find your next favourite
        </p>

        <h1 className="font-serif text-5xl tracking-[-0.06em] sm:text-6xl">
          Search.
        </h1>

        <form
          onSubmit={(event) => event.preventDefault()}
          role="search"
          className="mt-8 flex max-w-2xl items-center gap-3 border-b border-[#211B18]/35 pb-3"
        >
          <Search size={20} className="shrink-0 text-[#766B63]" />

          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="What are you looking for?"
            autoComplete="off"
            aria-label="Search Vestirhaus products"
            className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[#998D82] sm:text-lg"
          />

          {term && (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label="Clear search"
              className="grid size-8 shrink-0 place-items-center text-[#766B63]"
            >
              <X size={17} />
            </button>
          )}
        </form>

        {notice && (
          <p role="status" className="mt-4 text-xs text-[#A94F32]">
            {notice}
          </p>
        )}

        {!urlQuery.trim() ? (
          <div className="py-16">
            <p className="font-serif text-3xl">What feels like you?</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#766B63]">
              Search products by name or keyword. Results will appear as you
              type.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 border-b border-[#211B18] pb-2 text-xs"
            >
              Browse all products <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <section className="mt-10" aria-live="polite" aria-busy={loading}>
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl">
                  {loading ? "Finding your pieces…" : "Search results"}
                </h2>
                {!loading && !error && (
                  <p className="mt-2 text-xs text-[#766B63]">
                    {count} {count === 1 ? "result" : "results"} for “{urlQuery}”
                  </p>
                )}
              </div>

              <Link
                to="/shop"
                className="text-xs underline underline-offset-4 hover:text-[#A94F32]"
              >
                View the full collection
              </Link>
            </div>

            {error && (
              <p role="alert" className="py-12 text-sm text-[#A94F32]">
                {error}
              </p>
            )}

            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[3/4] bg-[#E9DFD2]" />
                    <div className="mt-4 h-3 w-2/3 bg-[#E9DFD2]" />
                    <div className="mt-3 h-3 w-1/3 bg-[#E9DFD2]" />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id ?? product.slug}
                    product={product}
                    onAddToCart={handleQuickAdd}
                  />
                ))}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="py-14">
                <p className="font-serif text-3xl">Nothing found just yet.</p>
                <p className="mt-3 text-sm text-[#766B63]">
                  Try a different product name, category, or search term.
                </p>
                <button
                  type="button"
                  onClick={() => setTerm("")}
                  className="mt-6 border-b border-[#211B18] pb-2 text-xs"
                >
                  Clear search
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}