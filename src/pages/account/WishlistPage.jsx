import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";

import AccountPageHeader from "@/components/account/AccountPageHeader";
import {
  fetchWishlist,
  removeWishlistItem,
} from "@/api/account";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, fromKobo } from "@/utils/formatPrice";

function getProduct(item) {
  return item.product ?? item.product_details ?? item;
}

export default function WishlistPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadWishlist() {
    setLoading(true);
    setError("");

    try {
      setItems(await fetchWishlist());
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't load your wishlist.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function handleRemove(item) {
    const id = item.id ?? item.wishlist_item_id;

    if (id == null) {
      setError("This wishlist item has no valid ID.");
      return;
    }

    setBusyId(id);
    setMessage("");
    setError("");

    try {
      await removeWishlistItem(id);
      setItems((current) => current.filter(
        (saved) => (saved.id ?? saved.wishlist_item_id) !== id,
      ));
      setMessage("Item removed from your wishlist.");
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't remove this item.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleMoveToCart(item) {
    const product = getProduct(item);
    const variantId =
      item.variant_id ??
      item.variant?.id ??
      item.product_variant_id ??
      null;

    if (variantId == null) {
      navigate(`/products/${product.slug}`);
      return;
    }

    setBusyId(item.id);
    setError("");
    setMessage("");

    try {
      await useCartStore.getState().addItem(variantId, 1);

      const wishlistId = item.id ?? item.wishlist_item_id;

      if (wishlistId != null) {
        await removeWishlistItem(wishlistId);
        setItems((current) => current.filter(
          (saved) =>
            (saved.id ?? saved.wishlist_item_id) !== wishlistId,
        ));
      }

      setMessage("Item moved to your bag.");
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't move this item to your bag.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AccountPageHeader
        title="My wishlist."
        description="The pieces you've saved for another day."
      />

      {message && (
        <p role="status" className="mb-5 border border-[#62724E]/20 bg-[#62724E]/5 px-4 py-3 text-xs text-[#526B40]">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="animate-pulse text-sm text-[#766B63]">
          Loading saved pieces…
        </p>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Heart size={30} className="mx-auto text-[#A94F32]" />
          <h2 className="mt-5 font-serif text-3xl">Nothing saved yet.</h2>
          <p className="mt-3 text-sm text-[#766B63]">
            Keep the pieces you love close by adding them to your wishlist.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex min-h-12 items-center gap-3 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#A94F32]"
          >
            Discover the collection <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3">
          {items.map((item, index) => {
            const product = getProduct(item);
            const id = item.id ?? item.wishlist_item_id ?? index;
            const image =
              product.image_url ??
              product.primary_image ??
              product.image ??
              item.image_url ??
              "";

            // Wrap the fallbacks in Number() and use || to skip "0.00" strings
            const variantPrice = product.variants?.length > 0 ? Number(product.variants[0].price) : 0;
            const price = 
              Number(product.price) ||
              Number(product.base_price) ||
              Number(product.current_price) ||
              variantPrice ||
              Number(item.price) ||
              0;

            // Apply the same strict Number evaluation to the strike price
            const variantComparePrice = product.variants?.length > 0 
              ? (Number(product.variants[0].compare_at_price) || Number(product.variants[0].compareAtPrice)) 
              : 0;
              
            const originalPrice = 
              Number(product.compare_at_price) ||
              Number(product.compareAtPrice) ||
              Number(product.original_price) ||
              variantComparePrice ||
              0;

            return (
              <article key={id} className="min-w-0">
                <Link
                  to={`/products/${product.slug}`}
                  className="block aspect-[3/4] overflow-hidden bg-[#E9DFD2]"
                >
                  {image && (
                    <img
                      src={image}
                      alt={product.name ?? "Saved product"}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  )}
                </Link>

                <div className="pt-4">
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-serif text-lg hover:text-[#A94F32]"
                  >
                    {product.name ?? "Product"}
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatPrice(fromKobo(price))}
                    </span>

                    {originalPrice > price && (
                      <span className="text-xs text-[#8B7D72] line-through">
                        {formatPrice(fromKobo(originalPrice))}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={busyId === id}
                      onClick={() => handleMoveToCart(item)}
                      className="vh-button vh-button--primary flex-1 !px-3 !text-[10px]"
                    >
                      <ShoppingBag size={13} />
                      Move to bag
                    </button>

                    <button
                      type="button"
                      disabled={busyId === id}
                      onClick={() => handleRemove(item)}
                      aria-label="Remove from wishlist"
                      className="vh-button vh-button--icon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}