import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  applyCartCoupon,
  fetchCart,
  removeCartCoupon,
  removeCartItem,
  updateCartItem,
} from "@/api/commerce";
import {
  formatPrice,
  fromKobo,
} from "@/utils/formatPrice";

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getItemId(item) {
  return item.id ?? item.cart_item_id ?? item.item_id ?? null;
}

function getItemName(item) {
  return (
    item.product?.name ??
    item.product_name ??
    item.name ??
    "Product"
  );
}

function getItemImage(item) {
  return (
    item.image_url ??
    item.product_variant?.image_url ??
    item.product?.primary_image ??
    item.product?.image_url ??
    item.product?.image ??
    item.product_image ??
    item.image ??
    ""
  );
}

function getItemUnitPrice(item) {
  return number(
    item.unit_price ??
      item.variant?.price ??
      item.product?.sale_price ??
      item.product?.price ??
      item.price,
  );
}

function getItemTotal(item) {
  return number(
    item.line_total ??
      item.total_price ??
      item.total ??
      getItemUnitPrice(item) * number(item.quantity, 1),
  );
}

function getVariantLabel(item) {
  const variant = 
    item.variant ?? 
    item.product_variant ?? 
    item.product_variant_details ??
    {};

  const size =
    typeof variant.size === "object"
      ? variant.size?.name
      : variant.size;

  const color =
    typeof variant.color === "object"
      ? variant.color?.name
      : variant.color;

  return [
    size ?? item.size,
    color ?? item.color ?? item.colour,
  ]
    .filter(Boolean)
    .join(" / ");
}

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    setError("");

    try {
      const latest = await fetchCart();
      setCart(latest);
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't load your cart. Please try again.",
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialCart() {
      setLoading(true);

      try {
        const latest = await fetchCart();
        if (active) setCart(latest);
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.detail ??
              "We couldn't load your cart. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitialCart();

    return () => {
      active = false;
    };
  }, []);

  const items = Array.isArray(cart?.items) ? cart.items : [];
  const itemCount = items.reduce(
    (sum, item) => sum + number(item.quantity, 1),
    0,
  );

  const subtotal = number(
    cart?.subtotal,
    items.reduce((sum, item) => sum + getItemTotal(item), 0),
  );

  const discount = number(cart?.discount ?? cart?.discount_amount);
  const shippingFee =
    cart?.shipping_fee == null ? null : number(cart.shipping_fee);

  const total = number(
    cart?.total,
    Math.max(0, subtotal - discount + (shippingFee ?? 0)),
  );

  function getErrorMessage(err) {
    return (
      err?.response?.data?.detail ??
      err?.response?.data?.error ??
      "That change couldn't be completed. Please try again."
    );
  }

  async function changeQuantity(item, quantity) {
    const itemId = getItemId(item);

    if (quantity < 1 || !itemId) return;

    setBusyItem(itemId);
    setMessage("");
    setError("");

    try {
      const latest = await updateCartItem(itemId, quantity);
      setCart(latest);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyItem(null);
    }
  }

  async function handleRemove(item) {
    const itemId = getItemId(item);
    if (!itemId) {
      setError("This cart item has no valid ID.");
      return;
    }

    setBusyItem(itemId);
    setError("");
    setMessage("");

    try {
      const latest = await removeCartItem(itemId);
      setCart(latest);
      setMessage(`${getItemName(item)} removed from your bag.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyItem(null);
    }
  }

  async function handleApplyCoupon(event) {
    event.preventDefault();

    setCouponBusy(true);
    setError("");
    setMessage("");

    try {
      const latest = await applyCartCoupon(couponCode);
      setCart(latest);
      setMessage("Your coupon has been applied.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCouponBusy(false);
    }
  }

  async function handleRemoveCoupon() {
    setCouponBusy(true);
    setError("");
    setMessage("");

    try {
      const latest = await removeCartCoupon();
      setCart(latest);
      setCouponCode("");
      setMessage("Coupon removed.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCouponBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-6xl px-5 py-16 sm:px-8">
        <div className="animate-pulse">
          <div className="h-12 w-60 bg-[#E9DFD2]" />
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_340px]">
            <div className="h-48 bg-[#E9DFD2]" />
            <div className="h-72 bg-[#E9DFD2]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] bg-[#F7F0E6] text-[#211B18]">
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mb-9 border-b border-[#211B18]/10 pb-7 sm:mb-12">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#A94F32]">
            Almost yours
          </p>
          <h1 className="font-serif text-5xl tracking-[-0.06em] sm:text-6xl">
            Your bag<span className="text-[#A94F32]">.</span>
          </h1>
          <p className="mt-3 text-sm text-[#766B63]">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
          </p>
        </div>

        {(error || message) && (
          <div
            role={error ? "alert" : "status"}
            className={[
              "mb-6 border px-4 py-3 text-sm",
              error
                ? "border-red-300 bg-red-50 text-red-800"
                : "border-[#A94F32]/20 bg-white/50 text-[#766B63]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{error || message}</span>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                }}
                className="text-xs underline"
              >
                Dismiss
              </button>
            </div>
            {error && (
              <button
                type="button"
                onClick={loadCart}
                className="mt-2 text-xs underline underline-offset-4"
              >
                Reload cart
              </button>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="py-16 text-center sm:py-24">
            <ShoppingBag
              size={30}
              strokeWidth={1.3}
              className="mx-auto text-[#A94F32]"
            />
            <h2 className="mt-5 font-serif text-3xl sm:text-4xl">
              Your bag is taking a little break.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#766B63]">
              Explore the collection and find something that feels like you.
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-flex min-h-12 items-center gap-3 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#A94F32]"
            >
              Continue shopping <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-14">
            {/* Cart items */}
            <section aria-label="Shopping bag items" className="min-w-0">
              <div className="hidden border-b border-[#211B18]/10 pb-3 text-[10px] uppercase tracking-[0.15em] text-[#8B7D72] sm:grid sm:grid-cols-[minmax(0,1fr)_105px_110px] sm:gap-4">
                <span>Product</span>
                <span>Quantity</span>
                <span className="text-right">Total</span>
              </div>

              <div className="divide-y divide-[#211B18]/10">
                {items.map((item, index) => {
                  const itemId = getItemId(item);
                  const quantity = number(item.quantity, 1);
                  const image = getItemImage(item);
                  const variantLabel = getVariantLabel(item);
                  const busy = busyItem === itemId;

                  return (
                    <article
                      key={itemId ?? index}
                      className="grid grid-cols-[100px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[110px_minmax(0,1fr)_105px_110px] sm:items-start sm:gap-5 sm:py-7"
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-[#E9DFD2]">
                        {image && (
                          <img
                            src={image}
                            alt={getItemName(item)}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#A94F32]">
                          {item.product?.category?.name ??
                            item.product?.category_name ??
                            "VESTIRHAUS"}
                        </p>

                        <h2 className="mt-2 font-serif text-xl leading-tight sm:text-2xl">
                          {getItemName(item)}
                        </h2>

                        {variantLabel && (
                          <p className="mt-2 text-xs text-[#766B63]">
                            {variantLabel}
                          </p>
                        )}

                        <p className="mt-3 text-sm font-medium">
                          {formatPrice(fromKobo(getItemUnitPrice(item)))}
                        </p>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleRemove(item)}
                          className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#8B7D72] hover:text-[#A94F32] disabled:opacity-40"
                        >
                          <Trash2 size={13} /> Remove
                        </button>

                        {/* Mobile quantity and line total */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 sm:hidden">
                          <QuantityStepper
                            quantity={quantity}
                            disabled={busy}
                            onChange={(nextQuantity) =>
                              changeQuantity(item, nextQuantity)
                            }
                          />
                          <span className="text-sm font-medium">
                            {formatPrice(fromKobo(getItemTotal(item)))}
                          </span>
                        </div>
                      </div>

                      {/* Desktop quantity */}
                      <div className="hidden pt-1 sm:block">
                        <QuantityStepper
                          quantity={quantity}
                          disabled={busy}
                          onChange={(nextQuantity) =>
                            changeQuantity(item, nextQuantity)
                          }
                        />
                      </div>

                      <p className="hidden pt-3 text-right text-sm font-medium sm:block">
                        {formatPrice(fromKobo(getItemTotal(item)))}
                      </p>
                    </article>
                  );
                })}
              </div>

              <Link
                to="/shop"
                className="mt-5 inline-flex items-center gap-2 text-xs text-[#766B63] hover:text-[#A94F32]"
              >
                <ArrowLeft size={14} /> Continue shopping
              </Link>
            </section>

            {/* Summary */}
            <aside className="border border-[#211B18]/10 bg-[#F1E9DE] p-5 sm:p-7 lg:sticky lg:top-28">
              <h2 className="font-serif text-2xl">Order summary</h2>

              <form
                onSubmit={handleApplyCoupon}
                className="mt-6 border-b border-[#211B18]/10 pb-6"
              >
                <label
                  htmlFor="cart-coupon"
                  className="mb-2 block text-[10px] uppercase tracking-[0.13em] text-[#766B63]"
                >
                  Coupon code
                </label>

                <div className="flex gap-2">
                  <input
                    id="cart-coupon"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="Enter code"
                    className="min-w-0 flex-1 border border-[#211B18]/15 bg-[#F7F0E6] px-3 py-3 text-xs outline-none focus:border-[#A94F32]"
                  />
                  <button
                    type="submit"
                    disabled={couponBusy || !couponCode.trim()}
                    className="bg-[#211B18] px-4 text-[10px] font-medium uppercase tracking-[0.1em] text-white hover:bg-[#A94F32] disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>

                {cart?.coupon_code && (
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[#62724E]">
                      Applied: {cart.coupon_code}
                    </span>
                    <button
                      type="button"
                      disabled={couponBusy}
                      onClick={handleRemoveCoupon}
                      className="underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

              <div className="space-y-4 py-6 text-sm">
                <SummaryLine label="Subtotal" value={formatPrice(fromKobo(subtotal))} />
                <SummaryLine
                  label="Discount"
                  value={discount > 0 ? `−${formatPrice(fromKobo(discount))}` : formatPrice(fromKobo(0))}
                />
                <SummaryLine
                  label="Shipping"
                  value={
                    shippingFee == null
                      ? "Calculated at checkout"
                      : formatPrice(fromKobo(shippingFee))
                  }
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#211B18]/15 pt-5">
                <span className="text-sm font-medium">Estimated total</span>
                <span className="text-lg font-medium">
                  {formatPrice(fromKobo(total))}
                </span>
              </div>

              <p className="mt-3 text-[10px] leading-5 text-[#8B7D72]">
                Final shipping charges and payable totals are confirmed by
                the server during checkout.
              </p>

              <Link
                to="/checkout"
                className="vh-button vh-button--primary vh-button--full"
              >
                Proceed to checkout <ArrowRight size={16} />
              </Link>

              <p className="mt-4 text-center text-[10px] text-[#8B7D72]">
                Secure checkout · Paystack
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function QuantityStepper({ quantity, disabled, onChange }) {
  return (
    <div className="inline-flex h-10 items-center border border-[#211B18]/20">
      <button
        type="button"
        disabled={disabled || quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        aria-label="Decrease quantity"
        className="grid size-9 place-items-center disabled:opacity-30"
      >
        <Minus size={13} />
      </button>
      <span className="min-w-7 text-center text-xs">{quantity}</span>
      <button
        type="button"
        disabled={disabled || quantity >= 10}
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className="grid size-9 place-items-center disabled:opacity-30"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#766B63]">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}