import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) {
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name ?? "",
  );
  const [feedback, setFeedback] = useState("");

  const productUrl = `/products/${product.slug}`;
  const hasSecondImage = Boolean(product.secondaryImage);

  async function handleAddToCart() {
    if (!onAddToCart) {
      setFeedback("Cart action isn't connected to this sample item yet.");
      return;
    }

    try {
      setFeedback("");
      await onAddToCart(product, selectedColor);
      setFeedback("Added");
    } catch {
      setFeedback("Couldn't add this item. Please try again.");
    }
  }

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden bg-[#EEE6DB]">
        <Link
          to={productUrl}
          aria-label={`View ${product.name}`}
          className="product-image-wrap relative block aspect-[3/4] overflow-hidden"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={[
              "absolute inset-0 h-full w-full object-cover",
              "transition duration-700 ease-out group-hover:scale-[1.045]",
              hasSecondImage
                ? "opacity-100 transition-opacity group-hover:opacity-0"
                : "",
            ].join(" ")}
          />

          {hasSecondImage && (
            <img
              src={product.secondaryImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 ease-out group-hover:scale-[1.045] group-hover:opacity-100"
            />
          )}
        </Link>

        {product.badge && (
          <span
            className={[
              "absolute left-3 top-3 z-10 px-2.5 py-1",
              "text-[10px] font-semibold tracking-[0.16em]",
              product.badge === "SALE"
                ? "bg-[#A94F32] text-white"
                : "bg-[#F7F0E6] text-[#211B18]",
            ].join(" ")}
          >
            {product.badge}
          </span>
        )}

        {onToggleWishlist && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            aria-pressed={isWishlisted}
            className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-[#F7F0E6]/90 text-[#211B18] transition hover:bg-white"
          >
            <Heart
              size={17}
              strokeWidth={1.6}
              className={isWishlisted ? "fill-[#A94F32] text-[#A94F32]" : ""}
            />
          </button>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          className={[
            "absolute inset-x-3 bottom-3 flex items-center justify-center gap-2",
            "bg-[#F7F0E6] px-3 py-3 text-xs font-medium text-[#211B18]",
            "transition duration-300 hover:bg-[#A94F32] hover:text-white",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            "focus-visible:outline-[#A94F32]",
            "md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0",
            "md:group-hover:opacity-100 md:focus-visible:translate-y-0",
            "md:focus-visible:opacity-100",
          ].join(" ")}
        >
          <ShoppingBag size={15} strokeWidth={1.7} />
          {feedback || "Add to bag"}
        </button>
      </div>

      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <p className="mb-1 text-[9px] font-medium tracking-[0.2em] text-[#8B7D72]">
            {product.category}
          </p>

          <Link
            to={productUrl}
            className="inline-block text-sm font-medium text-[#211B18] transition hover:text-[#A94F32]"
          >
            {product.name}
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-[#211B18]">
              {formatPrice(product.price)}
            </span>

            {product.compareAtPrice != null && (
              <span className="text-xs text-[#8B7D72] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        <Link
          to={productUrl}
          aria-label={`View ${product.name}`}
          className="mt-1 shrink-0 text-[#766B63] transition hover:text-[#A94F32]"
        >
          <ArrowUpRight size={17} strokeWidth={1.5} />
        </Link>
      </div>

      {product.colors?.length > 0 && (
        <div
          className="mt-3 flex items-center gap-2"
          aria-label="Available demonstration colors"
        >
          {product.colors.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setSelectedColor(color.name)}
              aria-label={`Select ${color.name}`}
              aria-pressed={selectedColor === color.name}
              title={color.name}
              className={[
                "grid size-[19px] place-items-center rounded-full border",
                selectedColor === color.name
                  ? "border-[#211B18]"
                  : "border-transparent",
              ].join(" ")}
            >
              <span
                className="size-[13px] rounded-full border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
            </button>
          ))}
          <span className="ml-1 text-[10px] text-[#8B7D72]">
            {product.colors.length} colours
          </span>
        </div>
      )}
    </article>
  );
}