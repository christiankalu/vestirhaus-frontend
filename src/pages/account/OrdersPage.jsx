import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

import AccountPageHeader from "@/components/account/AccountPageHeader";
import { fetchOrders } from "@/api/account";
import { formatPrice } from "@/utils/formatPrice";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OrderStatus({ status }) {
  const normalized = String(status ?? "pending").toLowerCase();

  const styles = {
    delivered: "bg-[#E5EBDD] text-[#526B40]",
    shipped: "bg-[#E3EAF0] text-[#49647A]",
    confirmed: "bg-[#E5EBDD] text-[#526B40]",
    processing: "bg-[#F3EACF] text-[#806627]",
    paid: "bg-[#E5EBDD] text-[#526B40]",
    pending: "bg-[#F3EACF] text-[#806627]",
    cancelled: "bg-[#F3DFDA] text-[#A94F32]",
    refunded: "bg-[#E9E2ED] text-[#72577F]",
  };

  return (
    <span
      className={[
        "inline-flex px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em]",
        styles[normalized] ?? "bg-[#EEE6DB] text-[#766B63]",
      ].join(" ")}
    >
      {normalized}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchOrders()
      .then((result) => {
        if (active) setOrders(result);
      })
      .catch((err) => {
        if (active) {
          setError(
            err?.response?.data?.detail ??
              "We couldn't load your order history.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <AccountPageHeader
        title="My orders."
        description="Everything you've ordered from Vestirhaus, all in one place."
      />

      {loading && (
        <p className="animate-pulse text-sm text-[#766B63]">
          Loading your orders…
        </p>
      )}

      {error && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="py-16 text-center">
          <Package size={30} className="mx-auto text-[#A94F32]" />
          <h2 className="mt-5 font-serif text-3xl">No orders just yet.</h2>
          <p className="mt-3 text-sm text-[#766B63]">
            When you place an order, it will appear here.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex min-h-12 items-center gap-3 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#A94F32]"
          >
            Explore the shop <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto border border-[#211B18]/10 md:block">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-[#F0E8DC] text-[9px] uppercase tracking-[0.15em] text-[#766B63]">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4"> </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const id = order.id ?? order.order_id ?? order.pk;
                  const status =
                    order.status ??
                    order.order_status ??
                    order.payment_status;

                  return (
                    <tr
                      key={id ?? index}
                      className="border-t border-[#211B18]/10 text-sm"
                    >
                      <td className="px-5 py-5 font-medium">
                        #{order.order_number ?? id ?? "—"}
                      </td>
                      <td className="px-5 py-5 text-[#766B63]">
                        {formatDate(order.created_at ?? order.date)}
                      </td>
                      <td className="px-5 py-5">
                        {formatPrice(
                          Number(
                            order.total ??
                              order.grand_total ??
                              order.total_amount ??
                              0,
                          ),
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <OrderStatus status={status} />
                      </td>
                      <td className="px-5 py-5 text-right">
                        <Link
                          to={`/account/orders/${id}`}
                          className="inline-flex items-center gap-2 text-xs hover:text-[#A94F32]"
                        >
                          Details <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile order cards */}
          <div className="space-y-3 md:hidden">
            {orders.map((order, index) => {
              const id = order.id ?? order.order_id ?? order.pk;

              return (
                <article
                  key={id ?? index}
                  className="border border-[#211B18]/10 bg-[#FFFCF7] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-[#8B7D72]">
                        ORDER NUMBER
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        #{order.order_number ?? id ?? "—"}
                      </p>
                    </div>
                    <OrderStatus
                      status={
                        order.status ??
                        order.order_status ??
                        order.payment_status
                      }
                    />
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#211B18]/10 pt-4">
                    <div>
                      <p className="text-xs text-[#766B63]">
                        {formatDate(order.created_at ?? order.date)}
                      </p>
                      <p className="mt-1 text-sm font-medium">
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

                    <Link
                      to={`/account/orders/${id}`}
                      className="inline-flex items-center gap-2 text-xs text-[#A94F32]"
                    >
                      View order <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}