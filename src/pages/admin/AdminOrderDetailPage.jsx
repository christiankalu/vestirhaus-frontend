import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Truck,
  Wallet,
} from "lucide-react";

import {
  fetchAdminOrder,
  updateAdminOrderStatus,
  issueAdminRefund,
} from "@/api/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { formatPrice, fromKobo } from "@/utils/formatPrice";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    fetchAdminOrder(orderId)
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

  async function handleStatusChange(nextStatus) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const updated = await updateAdminOrderStatus(
        order.id,
        nextStatus,
      );

      setOrder((current) => ({ ...current, ...updated }));
      setNotice("Order status updated.");
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.status?.[0] ??
          "The backend rejected this status transition.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRefund() {
    const confirmed = window.confirm(
      "Request a refund for this order? This will contact the payment service.",
    );

    if (!confirmed) return;

    const reason = window.prompt("Enter the refund reason:");

    if (!reason?.trim()) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await issueAdminRefund({
        order_id: order.id,
        reason: reason.trim(),
      });

      setNotice(
        result?.detail ??
          result?.message ??
          "Refund request submitted.",
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "Refund could not be initiated. Check the payments admin endpoint.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="animate-pulse text-sm text-[#766B63]">Loading order…</p>;
  }

  if (!order) {
    return (
      <div>
        <p role="alert" className="text-sm text-red-700">
          {error || "Order not found."}
        </p>
        <Link
          to="/admin-panel/orders"
          className="mt-5 inline-flex items-center gap-2 text-xs underline"
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>
      </div>
    );
  }

  const address = order.shipping_address ?? {};
  const items = order.items ?? [];

  return (
    <div>
      <Link
        to="/admin-panel/orders"
        className="mb-7 inline-flex items-center gap-2 text-xs text-[#766B63] hover:text-[#A94F32]"
      >
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <AdminPageHeader
        eyebrow="ORDER MANAGEMENT"
        title={`Order #${order.order_number ?? order.id}.`}
        description={`Created ${new Date(order.created_at).toLocaleString("en-NG")}`}
      />

      {(error || notice) && (
        <p
          role={error ? "alert" : "status"}
          className={[
            "mb-5 border px-4 py-3 text-xs",
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#62724E]/20 bg-[#62724E]/5 text-[#526B40]",
          ].join(" ")}
        >
          {error || notice}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          {/* Customer */}
          <section className="border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
            <h2 className="font-serif text-2xl">Customer & delivery</h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#8B7D72]">
                  Customer
                </p>
                <p className="mt-2 text-sm font-medium">
                  {address.recipient_name ?? "—"}
                </p>
                <p className="mt-1 text-xs text-[#766B63]">
                  {address.phone_number ?? ""}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#8B7D72]">
                  Delivery address
                </p>
                <p className="mt-2 text-sm leading-6 text-[#766B63]">
                  {[
                    address.address_line_1,
                    address.address_line_2,
                    address.city,
                    address.state,
                    address.postal_code,
                    address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
            <h2 className="font-serif text-2xl">Order items</h2>

            <div className="mt-5 divide-y divide-[#211B18]/10">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-xs text-[#766B63]">
                      {[item.size, item.color]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                    <p className="mt-1 text-xs text-[#766B63]">
                      SKU: {item.variant_sku ?? "—"} · Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-medium">
                    {formatPrice(fromKobo(item.total_price ?? 0))}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Order management */}
        <aside className="space-y-5">
          <section className="border border-[#211B18]/10 bg-[#FFFCF7] p-5">
            <h2 className="font-serif text-2xl">Order status</h2>

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-[10px] text-[#766B63]">
                  Fulfilment
                </p>
                <AdminStatusBadge status={order.status} />
              </div>

              <div>
                <p className="mb-2 text-[10px] text-[#766B63]">
                  Payment
                </p>
                <AdminStatusBadge status={order.payment_status} />
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-medium">
                  Update fulfilment status
                </span>
                <select
                  value={order.status}
                  disabled={busy}
                  onChange={(event) =>
                    handleStatusChange(event.target.value)
                  }
                  className="admin-input"
                >
                  {STATUSES.map((value) => (
                    <option value={value} key={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <p className="text-[10px] leading-5 text-[#8B7D72]">
                Django validates the allowed status transitions and
                payment requirements.
              </p>
            </div>
          </section>

          <section className="border border-[#211B18]/10 bg-[#FFFCF7] p-5">
            <h2 className="font-serif text-2xl">Payment summary</h2>

            <div className="mt-5 space-y-3 text-xs">
              {[
                ["Subtotal", order.subtotal],
                ["Discount", order.discount],
                ["Shipping", order.shipping_fee],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-[#766B63]">{label}</span>
                  <span>{formatPrice(fromKobo(value ?? 0))}</span>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-[#211B18]/10 pt-4 text-sm font-medium">
                <span>Total</span>
                <span>
                  {formatPrice(fromKobo(order.total ?? 0))}
                </span>
              </div>
            </div>

            <p className="mt-4 break-all text-[10px] leading-5 text-[#8B7D72]">
              Paystack reference: {order.paystack_reference ?? "—"}
            </p>

            <button
              type="button"
              disabled={
                busy ||
                String(order.payment_status).toLowerCase() !== "paid"
              }
              onClick={handleRefund}
              className="vh-button vh-button--secondary vh-button--full mt-5"
            >
              <Wallet size={15} /> Initiate refund
            </button>

            <p className="mt-2 text-[10px] leading-5 text-[#8B7D72]">
              Available only for paid orders. Actual refunds require a
              protected backend payment-refund endpoint.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}