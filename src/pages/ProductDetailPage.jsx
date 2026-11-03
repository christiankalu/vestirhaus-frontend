import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";

import api from "@/api/axios";
import {
  fetchProductBySlug,
  fetchProductReviews,
  fetchProducts,
  fetchReviewEligibility,
  submitProductReview,
} from "@/api/products";
import { addVariantToCart } from "@/api/cart";
import ProductCard from "@/components/products/ProductCard";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/utils/formatPrice";

const TABS = [
  { id: "description", label: "Description" },
  { id: "fit", label: "Size & Fit" },
  { id: "shipping", label: "Shipping & Returns" },
  { id: "reviews", label: "Reviews" },
];

function Stars({ rating = 0, size = 15 }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          strokeWidth={1.5}
          className={
            star <= rounded
              ? "fill-[#B99756] text-[#B99756]"
              : "text-[#C8BEB1]"
          }
        />
      ))}
    </span>
  );
}

function getReviewRating(review) {
  return Number(review.rating ?? review.stars ?? 0);
}

function getReviewName(review) {
  return (
    review.user_name ??
    review.reviewer_name ??
    review.user?.name ??
    review.user?.first_name ??
    "Verified customer"
  );
}

function getReviewComment(review) {
  return review.comment ?? review.body ?? review.text ?? "";
}

function SizeGuideModal({ onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close size guide"
        onClick={onClose}
        className="absolute inset-0 bg-[#211B18]/60"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-heading"
        className="relative z-10 max-h-[90svh] w-full max-w-xl overflow-y-auto bg-[#F7F0E6] p-5 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#211B18]/10 pb-5">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#A94F32]">
              Find your fit
            </p>
            <h2
              id="size-guide-heading"
              className="font-serif text-3xl"
            >
              Size guide
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close size guide"
            onClick={onClose}
            className="grid size-10 place-items-center"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-5 text-sm leading-6 text-[#766B63]">
          This is a general reference guide. Check the product-specific
          size and fit information, where available, before ordering.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[340px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#211B18]/15 bg-[#EEE5D9]">
                <th className="px-3 py-3 font-semibold">Size</th>
                <th className="px-3 py-3 font-semibold">Chest (cm)</th>
                <th className="px-3 py-3 font-semibold">Waist (cm)</th>
                <th className="px-3 py-3 font-semibold">Hip (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["XS", "80–86", "64–70", "86–92"],
                ["S", "87–93", "71–77", "93–99"],
                ["M", "94–100", "78–84", "100–106"],
                ["L", "101–107", "85–91", "107–113"],
                ["XL", "108–114", "92–98", "114–120"],
                ["XXL", "115–121", "99–105", "121–127"],
              ].map((row) => (
                <tr
                  key={row[0]}
                  className="border-b border-[#211B18]/10"
                >
                  {row.map((cell, index) => (
                    <td
                      key={cell}
                      className={[
                        "px-3 py-3",
                        index === 0 ? "font-medium" : "text-[#766B63]",
                      ].join(" ")}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-[10px] leading-5 text-[#8B7D72]">
          General guide only, not verified measurements for every Vestirhaus
          garment. Replace this table with the brand's actual measurement
          chart before launch.
        </p>
      </section>
    </div>
  );
}

function ProductReviews({
  product,
  reviews,
  eligibility,
  eligibilityLoading,
  reviewBusy,
  onSubmitReview,
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const authState = useAuthStore();
  const user = authState.user;

  const counts = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter(
          (review) => Math.round(getReviewRating(review)) === star,
        ).length,
      })),
    [reviews],
  );

  const reviewAverage =
    product.rating ||
    (reviews.length
      ? reviews.reduce(
          (sum, review) => sum + getReviewRating(review),
          0,
        ) / reviews.length
      : 0);

  const canReview =
    eligibility?.can_review ??
    eligibility?.canReview ??
    product.can_review ??
    product.user_can_review ??
    false;

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!canReview) {
      setMessage(
        "A verified purchase is required to submit a review.",
      );
      return;
    }

    try {
      await onSubmitReview({
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      setTitle("");
      setComment("");
      setRating(5);
      setMessage("Your review was submitted.");
    } catch (err) {
      setMessage(
        err?.response?.data?.detail ??
          err?.response?.data?.error ??
          "We couldn't submit your review. Check your purchase eligibility and try again.",
      );
    }
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <p className="font-serif text-5xl tracking-tight">
            {reviewAverage ? reviewAverage.toFixed(1) : "—"}
          </p>
          <div className="mt-2">
            <Stars rating={reviewAverage} size={16} />
          </div>
          <p className="mt-2 text-xs text-[#766B63]">
            {product.reviewCount || reviews.length} reviews
          </p>
        </div>

        <div className="space-y-2">
          {counts.map(({ star, count }) => {
            const total = reviews.length;
            const percentage = total ? (count / total) * 100 : 0;

            return (
              <div
                key={star}
                className="grid grid-cols-[14px_1fr_28px] items-center gap-3 text-xs"
              >
                <span>{star}</span>
                <div className="h-2 overflow-hidden rounded-full bg-[#E5DACC]">
                  <div
                    className="h-full rounded-full bg-[#B99756]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-right text-[#766B63]">{count}</span>
              </div>
            );
          })}

          <p className="pt-1 text-[10px] text-[#8B7D72]">
            Distribution calculated from reviews returned by the API.
          </p>
        </div>
      </div>

      <div className="border-t border-[#211B18]/10 pt-7">
        <h3 className="mb-5 font-serif text-2xl">Customer reviews</h3>

        {reviews.length === 0 ? (
          <p className="text-sm leading-6 text-[#766B63]">
            No reviews to show yet. Verified customers can be the first to
            share their experience.
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => {
              const verified =
                review.is_verified_purchase ??
                review.verified_purchase ??
                review.verified ??
                false;

              return (
                <article
                  key={review.id ?? index}
                  className="border-b border-[#211B18]/10 pb-6 last:border-b-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {getReviewName(review)}
                      </p>
                      {verified && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#62724E]">
                          <ShieldCheck size={12} />
                          Verified purchase
                        </p>
                      )}
                    </div>
                    <Stars rating={getReviewRating(review)} size={13} />
                  </div>

                  {review.title && (
                    <h4 className="mt-3 text-sm font-medium">
                      {review.title}
                    </h4>
                  )}

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#766B63]">
                    {getReviewComment(review)}
                  </p>

                  {review.created_at && (
                    <p className="mt-3 text-[10px] text-[#8B7D72]">
                      {new Date(review.created_at).toLocaleDateString(
                        "en-NG",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[#211B18]/10 pt-7">
        <h3 className="font-serif text-2xl">Write a review</h3>

        {!user ? (
          <p className="mt-3 text-sm leading-6 text-[#766B63]">
            Sign in to check whether your order is eligible to be reviewed.{" "}
            <Link
              to="/login"
              className="font-medium text-[#A94F32] underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        ) : eligibilityLoading ? (
          <p className="mt-3 text-sm text-[#766B63]">
            Checking purchase eligibility…
          </p>
        ) : canReview ? (
          <form onSubmit={handleSubmit} className="mt-5 max-w-xl space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium">
                Your rating
              </label>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className="p-1"
                  >
                    <Star
                      size={24}
                      className={
                        value <= rating
                          ? "fill-[#B99756] text-[#B99756]"
                          : "text-[#C8BEB1]"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="review-title"
                className="mb-2 block text-xs font-medium"
              >
                Review title
              </label>
              <input
                id="review-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={120}
                className="w-full border border-[#211B18]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#A94F32]"
              />
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="mb-2 block text-xs font-medium"
              >
                Your experience
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                className="w-full resize-y border border-[#211B18]/20 bg-transparent px-3 py-3 text-sm leading-6 outline-none focus:border-[#A94F32]"
              />
            </div>

            <button
              type="submit"
              disabled={reviewBusy}
              className="bg-[#211B18] px-6 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#A94F32] disabled:opacity-60"
            >
              {reviewBusy ? "Submitting…" : "Submit review"}
            </button>

            {message && (
              <p role="status" className="text-xs leading-5 text-[#766B63]">
                {message}
              </p>
            )}
          </form>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[#766B63]">
            {eligibility?.detail ??
              eligibility?.message ??
              "Only customers with an eligible purchase can review this product. Purchase eligibility must be confirmed by the server."}
          </p>
        )}
      </div>
    </section>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const authState = useAuthStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [feedback, setFeedback] = useState("");
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const user = authState.user;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setRelatedProducts([]);
      setReviews([]);
      setEligibility(null);
      setImageIndex(0);
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);

      try {
        const item = await fetchProductBySlug(slug, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setProduct(item);

        const firstAvailable = item.variants.find(
          (variant) => variant.inStock,
        );

        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
          setSelectedColor(firstAvailable.color);
        }

        // Load related items without blocking the main product view.
        fetchProducts(
          {
            category: item.categorySlug || undefined,
            ordering: "-popularity",
            page_size: 8,
          },
          { signal: controller.signal },
        )
          .then((result) => {
            if (controller.signal.aborted) return;
            setRelatedProducts(
              result.results
                .filter((related) => related.slug !== item.slug)
                .slice(0, 8),
            );
          })
          .catch(() => {
            if (!controller.signal.aborted) setRelatedProducts([]);
          });
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err?.response?.status === 404
              ? "We couldn't find that product."
              : "We couldn't load this product. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    if (slug) loadProduct();

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    fetchProductReviews(slug, { signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) setReviews(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setReviews([]);
      });

    if (user) {
      setEligibilityLoading(true);

      fetchReviewEligibility(slug, { signal: controller.signal })
        .then((result) => {
          if (!controller.signal.aborted) setEligibility(result);
        })
        .catch(() => {
          if (!controller.signal.aborted) setEligibility(null);
        })
        .finally(() => {
          if (!controller.signal.aborted) setEligibilityLoading(false);
        });
    } else {
      setEligibility(null);
      setEligibilityLoading(false);
    }

    return () => controller.abort();
  }, [slug, user]);

  useEffect(() => {
    setImageFailed(false);
    setImageIndex(0)
  }, [slug, imageIndex]);

  const images = product?.images?.length
  ? product.images
  : product?.image
    ? [product.image]
    : [];

  const sizes = useMemo(() => {
    if (!product) return [];

    return [
      ...new Set(product.variants.map((variant) => variant.size).filter(Boolean)),
    ];
  }, [product]);

  const colors = product?.colors ?? [];

  const selectedVariant = product?.variants.find(
    (variant) =>
      variant.inStock &&
      (!variant.size || variant.size === selectedSize) &&
      (!variant.color || variant.color === selectedColor),
  );

  const availableColorVariants = (colorName) =>
    product?.variants.some(
      (variant) =>
        variant.inStock &&
        variant.color === colorName &&
        (!selectedSize || !variant.size || variant.size === selectedSize),
    ) ?? false;

  const availableSizeVariants = (sizeName) =>
    product?.variants.some(
      (variant) =>
        variant.inStock &&
        variant.size === sizeName &&
        (!selectedColor || !variant.color || variant.color === selectedColor),
    ) ?? false;

  const currentPrice = selectedVariant?.price || product?.price || 0;

  async function handleAddToCart() {
    setFeedback("");

    if (!selectedVariant?.id) {
      setFeedback("Please select an available size and colour.");
      return;
    }

    if (!selectedVariant.inStock) {
      setFeedback("This option is currently out of stock.");
      return;
    }

    try {
      setCartBusy(true);
      await addVariantToCart(selectedVariant.id, quantity);
      setFeedback("Added to your bag.");
    } catch (err) {
      setFeedback(
        err?.response?.data?.detail ??
          err?.response?.data?.error ??
          "We couldn't add this item. Please try again.",
      );
    } finally {
      setCartBusy(false);
    }
  }

  async function handleAddToWishlist() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);
      return;
    }

    if (!product?.id) {
      setFeedback("This product doesn't have a valid ID.");
      return;
    }

    try {
      setWishlistBusy(true);
      await api.post("/wishlist/", { product_id: product.id });
      setFeedback("Added to your wishlist.");
    } catch (err) {
      setFeedback(
        err?.response?.data?.detail ??
          "We couldn't update your wishlist. Check that wishlist support is enabled.",
      );
    } finally {
      setWishlistBusy(false);
    }
  }

  async function handleReviewSubmit(review) {
    setReviewBusy(true);

    try {
      await submitProductReview(slug, review);
      const refreshedReviews = await fetchProductReviews(slug);
      setReviews(refreshedReviews);
    } finally {
      setReviewBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] animate-pulse px-5 py-12 sm:px-8 lg:px-12">
        <div className="h-4 w-40 bg-[#E9DFD2]" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] bg-[#E9DFD2]" />
          <div className="space-y-5 py-5">
            <div className="h-4 w-1/4 bg-[#E9DFD2]" />
            <div className="h-12 w-3/4 bg-[#E9DFD2]" />
            <div className="h-5 w-1/3 bg-[#E9DFD2]" />
            <div className="mt-10 h-10 w-full bg-[#E9DFD2]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="font-serif text-4xl">
          {error || "Product unavailable."}
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 border-b border-[#211B18] pb-2 text-xs"
        >
          <ArrowLeft size={14} /> Back to shop
        </Link>
      </div>
    );
  }

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > currentPrice
      ? Math.round(
          ((product.compareAtPrice - currentPrice) /
            product.compareAtPrice) *
            100,
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#F7F0E6] text-[#211B18]">
      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
        <nav aria-label="Breadcrumb" className="mb-7 text-[10px] tracking-[0.12em] text-[#766B63]">
          <Link to="/" className="hover:text-[#A94F32]">HOME</Link>
          <span className="px-2">/</span>
          <Link to="/shop" className="hover:text-[#A94F32]">SHOP</Link>
          <span className="px-2">/</span>
          <span className="text-[#211B18]">{product.name.toUpperCase()}</span>
        </nav>

        <div className="grid min-w-0 gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-14 xl:gap-20">
          {/* Gallery */}
          <section
            aria-label="Product images"
            className="min-w-0 w-full"
          >
            {/* Main product image */}
            <div className="group relative aspect-[4/5] w-full max-h-[850px] overflow-hidden bg-[#EEE6DB]">
              {images.length > 0 && !imageFailed ? (
                <img
                  key={images[imageIndex]}
                  src={images[imageIndex]}
                  alt={product.name}
                  fetchPriority={"high"}
                  onError={() => setImageFailed(true)}
                  className="absolute inset-0 block h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                  <span className="font-serif text-2xl text-[#766B63]">
                    Vestirhaus
                  </span>
                  <p className="mt-2 text-xs text-[#8B7D72]">
                    {images.length > 0
                      ? "This product image couldn't be loaded."
                      : "Product photography coming soon."}
                  </p>
                </div>
              )}

              {product.badge && (
                <span className="absolute left-4 top-4 z-10 bg-[#F7F0E6] px-3 py-2 text-[9px] font-semibold tracking-[0.17em]">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div
                className="mt-4 flex gap-3 overflow-x-auto pb-2"
                aria-label="Choose product image"
              >
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => {
                      setImageIndex(index);
                      setImageFailed(false);
                    }}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={imageIndex === index}
                    className={[
                      "h-20 w-16 shrink-0 overflow-hidden border-2 bg-[#EEE6DB] sm:h-24 sm:w-20",
                      imageIndex === index
                        ? "border-[#A94F32]"
                        : "border-transparent hover:border-[#211B18]/30",
                    ].join(" ")}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product information */}
          <section className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A94F32]">
              {product.category}
            </p>

            <h1 className="max-w-xl font-serif text-4xl leading-tight tracking-[-0.05em] sm:text-5xl">
              {product.name}
            </h1>

            <a
              href="#product-reviews"
              className="mt-4 inline-flex items-center gap-3"
            >
              <Stars rating={product.rating} size={14} />
              <span className="text-xs text-[#766B63]">
                {product.reviewCount
                  ? `${product.reviewCount} reviews`
                  : "No reviews yet"}
              </span>
            </a>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-lg font-medium">
                {formatPrice(currentPrice)}
              </span>

              {product.compareAtPrice && (
                <span className="text-sm text-[#8B7D72] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="bg-[#A94F32]/10 px-2 py-1 text-[10px] font-semibold text-[#A94F32]">
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 max-w-lg whitespace-pre-line text-sm leading-7 text-[#766B63]">
                {product.short_description ?? product.description}
              </p>
            )}

            <div className="mt-7 border-t border-[#211B18]/10 pt-6">
              {colors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium">
                      Colour:{" "}
                      <span className="font-normal text-[#766B63]">
                        {selectedColor || "Select a colour"}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    {colors.map((color) => {
                      const available = availableColorVariants(color.name);
                      const selected = selectedColor === color.name;

                      return (
                        <button
                          key={color.name}
                          type="button"
                          disabled={!available}
                          onClick={() => {
                            setSelectedColor(color.name);
                            setFeedback("");
                          }}
                          title={`${color.name}${available ? "" : " — out of stock"}`}
                          aria-label={`Colour ${color.name}${available ? "" : ", out of stock"}`}
                          aria-pressed={selected}
                          className={[
                            "grid size-9 place-items-center rounded-full border",
                            selected
                              ? "border-[#211B18]"
                              : "border-transparent",
                            !available ? "cursor-not-allowed opacity-30" : "",
                          ].join(" ")}
                        >
                          <span
                            className="grid size-[27px] place-items-center rounded-full border border-black/10"
                            style={{ backgroundColor: color.hex }}
                          >
                            {selected && <Check size={14} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium">
                      Size:{" "}
                      <span className="font-normal text-[#766B63]">
                        {selectedSize || "Select a size"}
                      </span>
                    </p>

                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-[10px] underline underline-offset-4 hover:text-[#A94F32]"
                    >
                      Size guide
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const available = availableSizeVariants(size);
                      const selected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={!available}
                          onClick={() => {
                            setSelectedSize(size);
                            setFeedback("");
                          }}
                          aria-pressed={selected}
                          className={[
                            "relative min-w-12 border px-4 py-3 text-xs transition",
                            selected
                              ? "border-[#211B18] bg-[#211B18] text-white"
                              : "border-[#211B18]/20 hover:border-[#211B18]",
                            !available
                              ? "cursor-not-allowed bg-[#EAE2D7] text-[#A69A8E] line-through opacity-70"
                              : "",
                          ].join(" ")}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.variants.length === 0 && (
                <p className="mt-5 text-xs leading-5 text-[#A94F32]">
                  Product options are unavailable in this response. Check
                  that the product detail serializer includes its variants
                  and stock information.
                </p>
              )}

              <div className="mt-7">
                <p className="mb-3 text-xs font-medium">Quantity</p>
                <div className="inline-flex h-12 items-center border border-[#211B18]/20">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="grid size-11 place-items-center disabled:opacity-35"
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="min-w-9 text-center text-sm"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                    className="grid size-11 place-items-center disabled:opacity-35"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-[#8B7D72]">
                  Maximum 10 per order in this interface.
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_52px]">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                    cartBusy ||
                    !selectedVariant?.id ||
                    !selectedVariant.inStock
                  }
                  className="vh-button vh-button--primary vh-button--full mt-4"
                >
                  <ShoppingBag size={17} />
                  {cartBusy ? "Adding…" : "Add to bag"}
                </button>

                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  disabled={wishlistBusy}
                  aria-label="Add to wishlist"
                  className="grid min-h-[54px] place-items-center border border-[#211B18]/25 transition hover:border-[#A94F32] hover:text-[#A94F32] disabled:opacity-50"
                >
                  <Heart size={19} strokeWidth={1.5} />
                </button>
              </div>

              {feedback && (
                <p role="status" className="mt-3 text-xs leading-5 text-[#A94F32]">
                  {feedback}
                </p>
              )}

              <div className="mt-7 space-y-3 border-t border-[#211B18]/10 pt-6">
                <p className="flex items-center gap-3 text-xs text-[#766B63]">
                  <Truck size={16} /> Delivery and return information below
                </p>
                <p className="flex items-center gap-3 text-xs text-[#766B63]">
                  <ShieldCheck size={16} /> Secure checkout
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Product information tabs */}
        <section className="mt-16 border-t border-[#211B18]/15 pt-8 sm:mt-24" aria-label="Product information">
          <div className="-mx-1 flex gap-5 overflow-x-auto border-b border-[#211B18]/10 px-1 sm:gap-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "reviews") {
                    document.getElementById("product-reviews")?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }
                }}
                aria-pressed={activeTab === tab.id}
                className={[
                  "shrink-0 border-b-2 pb-4 text-xs transition",
                  activeTab === tab.id
                    ? "border-[#A94F32] text-[#211B18]"
                    : "border-transparent text-[#8B7D72] hover:text-[#211B18]",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-3xl py-7">
            {activeTab === "description" && (
              <div>
                <h2 className="font-serif text-2xl">The details</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#766B63]">
                  {product.description ||
                    "Product description will appear here when provided by the catalog."}
                </p>
                {product.material && (
                  <p className="mt-5 text-sm leading-7 text-[#766B63]">
                    <span className="font-medium text-[#211B18]">Material: </span>
                    {typeof product.material === "string"
                      ? product.material
                      : product.material.name ?? ""}
                  </p>
                )}
              </div>
            )}

            {activeTab === "fit" && (
              <div>
                <h2 className="font-serif text-2xl">Size & Fit</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#766B63]">
                  {product.sizeAndFit ||
                    "Please use the size guide above. Product-specific fit notes have not been provided for this item."}
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="mt-5 border-b border-[#211B18] pb-2 text-xs"
                >
                  Open size guide
                </button>
              </div>
            )}

            {activeTab === "shipping" && (
              <div>
                <h2 className="font-serif text-2xl">Shipping & Returns</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#766B63]">
                  {product.shippingAndReturns ||
                    "Delivery timelines, fees, and return eligibility are confirmed at checkout. Replace this placeholder with Vestirhaus's actual shipping and returns policy."}
                </p>
                <Link
                  to="/shipping-returns"
                  className="mt-5 inline-flex items-center gap-2 border-b border-[#211B18] pb-2 text-xs"
                >
                  Read delivery and returns policy
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="font-serif text-2xl">Reviews</h2>
                <p className="mt-3 text-sm leading-6 text-[#766B63]">
                  Customer experiences, ratings, and verified-purchase reviews.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Reviews, displayed as a dedicated anchor section */}
        <section id="product-reviews" className="scroll-mt-28 border-t border-[#211B18]/15 py-10 sm:py-14">
          <ProductReviews
            product={product}
            reviews={reviews}
            eligibility={eligibility}
            eligibilityLoading={eligibilityLoading}
            reviewBusy={reviewBusy}
            onSubmitReview={handleReviewSubmit}
          />
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-[#211B18]/15 py-12 sm:py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#A94F32]">
                  Keep exploring
                </p>
                <h2 className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">
                  You may also like.
                </h2>
              </div>
              <Link
                to="/shop"
                className="hidden items-center gap-2 text-xs sm:inline-flex"
              >
                Shop all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:gap-5 sm:px-0">
              {relatedProducts.map((related) => (
                <div
                  key={related.id ?? related.slug}
                  className="w-[58vw] min-w-[190px] max-w-[280px] shrink-0 snap-start sm:w-[30vw] lg:w-[22%]"
                >
                  <ProductCard 
                    product={related}
                    onAddToCart={(item) => navigate(`/products/${item.slug}`)} 
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {sizeGuideOpen && (
        <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />
      )}
    </div>
  );
}