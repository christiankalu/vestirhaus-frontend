import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, RefreshCw } from "lucide-react";

import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "@/api/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { formatPrice, fromKobo } from "@/utils/formatPrice";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyOrder, setBusyOrder] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAdminOrders({
        ...(status ? { status } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        ordering: "-created_at",
      });

      setOrders(result.results);
      setCount(result.count);
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't load the order list.",
      );
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleStatusChange(order, nextStatus) {
    setBusyOrder(order.id);
    setError("");
    setNotice("");

    try {
      const updated = await updateAdminOrderStatus(
        order.id,
        nextStatus,
      );

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? { ...item, ...updated }
            : item,
        ),
      );

      setNotice(`Order ${order.order_number ?? order.id} updated.`);
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.status?.[0] ??
          "The backend rejected this status change.",
      );
    } finally {
      setBusyOrder(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="STORE OPERATIONS"
        title="Orders."
        description="Review customer orders and manage fulfilment status."
      />

      {(error || notice) && (
        <div
          role={error ? "alert" : "status"}
          className={[
            "mb-5 border px-4 py-3 text-xs",
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#62724E]/20 bg-[#62724E]/5 text-[#526B40]",
          ].join(" ")}
        >
          {error || notice}
        </div>
      )}

      <section className="border border-[#211B18]/10 bg-[#FFFCF7]">
        <div className="flex flex-col gap-3 border-b border-[#211B18]/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-sm font-medium">All orders</p>
            <p className="mt-1 text-xs text-[#766B63]">
              {count} matching orders
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-h-10 items-center gap-2 border border-[#211B18]/15 px-3">
              <Search size={14} className="text-[#8B7D72]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") loadOrders();
                }}
                placeholder="Search customers…"
                aria-label="Search orders"
                className="min-w-0 bg-transparent text-xs outline-none"
              />
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter orders by status"
              className="min-h-10 border border-[#211B18]/15 bg-transparent px-3 text-xs outline-none"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              aria-label="Refresh orders"
              className="vh-button vh-button--secondary vh-button--small"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="p-7 text-sm text-[#766B63]">
            Loading orders…
          </p>
        ) : orders.length === 0 ? (
          <p className="p-12 text-center text-sm text-[#8B7D72]">
            No orders found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#F0E8DC] text-[9px] uppercase tracking-[0.13em] text-[#766B63]">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Fulfilment status</th>
                  <th className="px-5 py-4">Details</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-[#211B18]/10 text-xs"
                  >
                    <td className="px-5 py-4 font-medium">
                      #{order.order_number ?? order.id}
                    </td>

                    <td className="px-5 py-4 text-[#766B63]">
                      {order.user_email ??
                        order.customer_email ??
                        order.user?.email ??
                        "—"}
                    </td>

                    <td className="px-5 py-4 text-[#766B63]">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {formatPrice(fromKobo(order.total ?? 0))}
                    </td>

                    <td className="px-5 py-4">
                      <AdminStatusBadge status={order.payment_status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <AdminStatusBadge status={order.status} />

                        <select
                          value={order.status}
                          disabled={busyOrder === order.id}
                          onChange={(event) =>
                            handleStatusChange(order, event.target.value)
                          }
                          aria-label={`Update status for order ${order.order_number ?? order.id}`}
                          className="max-w-[155px] border border-[#211B18]/15 bg-transparent px-2 py-2 text-[10px] disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/admin-panel/orders/${order.id}`}
                        className="inline-flex items-center gap-2 text-xs text-[#A94F32]"
                      >
                        View <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-4 text-[10px] leading-5 text-[#8B7D72]">
        Order status changes are validated by Django. Some transitions
        require payment verification and may be rejected.
      </p>
    </div>
  );
}