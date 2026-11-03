import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Package,
  Truck,
} from "lucide-react";

import AccountPageHeader from "@/components/account/AccountPageHeader";
import { fetchOrderDetail } from "@/api/account";
import { formatPrice } from "@/utils/formatPrice";

const TIMELINE = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Order confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function getProgress(status) {
  const value = String(status ?? "pending").toLowerCase();

  if (["delivered", "complete", "completed"].includes(value)) return 4;
  if (["shipped", "in_transit", "dispatched"].includes(value)) return 3;

  if (
    ["confirmed", "paid", "processing", "preparing", "packed"].includes(value)
  ) {
    return 2;
  }

  return 1;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function OrderDetailPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    fetchOrderDetail(orderId)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch((err) => {
        if (active) {
          setError(
            err?.response?.data?.detail ??
              "We couldn't load this order.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return <p className="animate-pulse text-sm text-[#766B63]">Loading order…</p>;
  }

  if (error || !order) {
    return (
      <div>
        <p role="alert" className="text-sm text-red-700">
          {error || "Order not found."}
        </p>
        <Link
          to="/account/orders"
          className="mt-5 inline-flex items-center gap-2 text-xs underline"
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>
      </div>
    );
  }

  const status = order.status ?? order.order_status ?? "pending";
  const progress = getProgress(status);
  const items = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.order_items)
      ? order.order_items
      : [];

  const address =
    order.shipping_address ??
    order.delivery_address ??
    order.address ??
    {};

  const trackingNumber =
    order.tracking_number ?? order.tracking?.number ?? null;

  const carrier =
    order.shipping_provider ?? order.carrier ?? order.tracking?.carrier ?? null;

  return (
    <div>
      <Link
        to="/account/orders"
        className="mb-7 inline-flex items-center gap-2 text-xs text-[#766B63] hover:text-[#A94F32]"
      >
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <AccountPageHeader
        title={`Order #${order.order_number ?? order.id ?? orderId}.`}
        description={`Placed ${formatDate(order.created_at ?? order.date) || "date unavailable"}.`}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-[#211B18]/10 bg-[#F0E8DC] p-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#766B63]">
            Current status
          </p>
          <p className="mt-2 text-sm font-medium capitalize">{status}</p>
        </div>
        <p className="text-lg font-medium">
          {formatPrice(
            Number(
              order.total ??
                order.grand_total ??
                order.total_amount ??
                0,
            ),
          )}
        </p>
      </div>

      {/* Timeline */}
      <section className="border border-[#211B18]/10 p-5 sm:p-7">
        <h2 className="font-serif text-2xl">Order progress</h2>

        <ol className="mt-7 space-y-0">
          {TIMELINE.map((item, index) => {
            const number = index + 1;
            const complete = number <= progress;
            const current = number === progress;

            return (
              <li key={item.key} className="relative flex gap-4 pb-7 last:pb-0">
                {index < TIMELINE.length - 1 && (
                  <span className="absolute bottom-0 left-[15px] top-8 w-px bg-[#211B18]/15" />
                )}

                <span
                  className={[
                    "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border",
                    complete
                      ? "border-[#62724E] bg-[#62724E] text-white"
                      : "border-[#211B18]/20 bg-[#F7F0E6] text-[#8B7D72]",
                  ].join(" ")}
                >
                  {complete ? <Check size={15} /> : number}
                </span>

                <div className="pt-1">
                  <p
                    className={[
                      "text-sm",
                      current ? "font-semibold" : "font-medium",
                    ].join(" ")}
                  >
                    {item.label}
                  </p>
                  {current && (
                    <p className="mt-1 text-xs text-[#766B63]">
                      {index === 0
                        ? "We've received your order."
                        : index === 1
                          ? "Your order has been confirmed."
                          : index === 2
                            ? "Your order is on its way."
                            : "Your order has been delivered."}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {["cancelled", "refunded"].includes(String(status).toLowerCase()) && (
          <p className="mt-5 border-t border-[#211B18]/10 pt-5 text-xs text-[#A94F32]">
            This order is {status}. Contact customer support for additional
            information.
          </p>
        )}
      </section>

      {/* Tracking */}
      <section className="mt-6 border border-[#211B18]/10 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <Truck size={20} className="mt-1 text-[#A94F32]" />
          <div>
            <h2 className="font-serif text-xl">Delivery tracking</h2>
            {trackingNumber ? (
              <div className="mt-3 space-y-1 text-sm text-[#766B63]">
                <p>Carrier: {carrier ?? "Not provided"}</p>
                <p>Tracking number: {trackingNumber}</p>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-[#A94F32] underline"
                  >
                    Track shipment
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs leading-6 text-[#766B63]">
                Tracking details will appear here once your order has been
                dispatched.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="mt-6 border border-[#211B18]/10 p-5 sm:p-7">
        <h2 className="font-serif text-2xl">Items in this order</h2>

        <div className="mt-5 divide-y divide-[#211B18]/10">
          {items.map((item, index) => {
            const product = item.product ?? {};
            const image =
              product.image_url ??
              product.primary_image ??
              product.image ??
              item.product_image ??
              "";

            return (
              <div
                key={item.id ?? index}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="size-20 shrink-0 overflow-hidden bg-[#E9DFD2]">
                  {image && (
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {product.name ?? item.product_name ?? item.name ?? "Product"}
                  </p>
                  <p className="mt-1 text-xs text-[#766B63]">
                    Quantity: {item.quantity ?? 1}
                  </p>
                </div>

                <p className="shrink-0 text-sm">
                  {formatPrice(
                    Number(
                      item.line_total ??
                        item.total_price ??
                        Number(item.unit_price ?? item.price ?? 0) *
                          Number(item.quantity ?? 1),
                    ),
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Address */}
      <section className="mt-6 border border-[#211B18]/10 p-5 sm:p-7">
        <h2 className="font-serif text-xl">Delivery address</h2>
        <div className="mt-3 space-y-1 text-sm leading-6 text-[#766B63]">
          <p className="font-medium text-[#211B18]">
            {address.full_name ?? address.name ?? ""}
          </p>
          <p>{address.address_line_1 ?? address.address ?? ""}</p>
          <p>
            {[address.city, address.state, address.postcode]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p>{address.phone ?? ""}</p>
        </div>
      </section>
    </div>
  );
}