import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CircleDollarSign,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

import { fetchAdminDashboard } from "@/api/admin";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { formatPrice, fromKobo } from "@/utils/formatPrice";

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchAdminDashboard()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) {
          setError(
            err?.response?.data?.detail ??
              "The admin dashboard endpoint is not available yet.",
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

  const stats = data?.stats ?? data ?? {};
  const chartData = data?.revenue_last_30_days ?? [];
  const recentOrders = data?.recent_orders ?? [];

  const revenue = stats.total_revenue_kobo ??
    stats.total_revenue ??
    null;

  return (
    <div>
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#A94F32]">
            Store performance
          </p>
          <h1 className="font-serif text-4xl tracking-[-0.05em] sm:text-5xl">
            Overview.
          </h1>
          <p className="mt-3 text-sm text-[#766B63]">
            A look at what's happening across Vestirhaus.
          </p>
        </div>

        <span className="text-xs text-[#8B7D72]">
          Last 30 days
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-7 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total revenue"
          value={
            loading
              ? "—"
              : revenue == null
                ? "Unavailable"
                : formatPrice(fromKobo(revenue))
          }
          note="Paid orders"
          icon={CircleDollarSign}
        />

        <AdminStatCard
          label="Orders today"
          value={loading ? "—" : stats.orders_today ?? "Unavailable"}
          note="Orders placed today"
          icon={ShoppingBag}
        />

        <AdminStatCard
          label="Total products"
          value={loading ? "—" : stats.total_products ?? "Unavailable"}
          note="In the catalogue"
          icon={Package}
        />

        <AdminStatCard
          label="New customers"
          value={loading ? "—" : stats.new_users ?? "Unavailable"}
          note="New registrations"
          icon={Users}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
        {/* Revenue chart */}
        <section className="min-w-0 border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
          <div className="mb-7">
            <h2 className="font-serif text-2xl">Revenue overview</h2>
            <p className="mt-2 text-xs text-[#766B63]">
              Daily paid revenue over the last 30 days.
            </p>
          </div>

          {chartData.length === 0 ? (
            <div className="grid h-[300px] place-items-center text-center">
              <p className="max-w-xs text-sm leading-6 text-[#8B7D72]">
                Revenue chart data will appear when the admin analytics
                endpoint is connected.
              </p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="vestirhausRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#A94F32"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#A94F32"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#211B18"
                    strokeOpacity={0.08}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 10, fill: "#766B63" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={25}
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      `₦${Math.round(fromKobo(value) / 1000)}k`
                    }
                    tick={{ fontSize: 10, fill: "#766B63" }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatPrice(fromKobo(value)),
                      "Revenue",
                    ]}
                    labelFormatter={formatDate}
                    contentStyle={{
                      border: "1px solid rgba(33,27,24,.12)",
                      borderRadius: 0,
                      background: "#FFFCF7",
                      fontSize: 12,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#A94F32"
                    strokeWidth={2}
                    fill="url(#vestirhausRevenue)"
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className="border border-[#211B18]/10 bg-[#F0E8DC] p-5 sm:p-7">
          <h2 className="font-serif text-2xl">Quick actions</h2>
          <div className="mt-6 space-y-3">
            {[
              ["Add a product", "/admin-panel/products/new"],
              ["Manage orders", "/admin-panel/orders"],
              ["View customers", "/admin-panel/customers"],
              ["Create a coupon", "/admin-panel/coupons"],
            ].map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className="flex min-h-12 items-center justify-between border-b border-[#211B18]/10 py-3 text-xs transition hover:text-[#A94F32]"
              >
                {label}
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Recent orders */}
      <section className="mt-8 border border-[#211B18]/10 bg-[#FFFCF7]">
        <div className="flex items-center justify-between gap-4 border-b border-[#211B18]/10 p-5 sm:px-7">
          <div>
            <h2 className="font-serif text-2xl">Recent orders</h2>
            <p className="mt-1 text-xs text-[#766B63]">
              The latest customer orders.
            </p>
          </div>
          <Link
            to="/admin-panel/orders"
            className="inline-flex items-center gap-2 text-xs hover:text-[#A94F32]"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-7 text-sm text-[#8B7D72]">
            No recent orders returned by the dashboard API.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="text-[9px] uppercase tracking-[0.13em] text-[#8B7D72]">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order.id ?? index}
                    className="border-t border-[#211B18]/10 text-xs"
                  >
                    <td className="px-6 py-4 font-medium">
                      #{order.order_number ?? order.id}
                    </td>
                    <td className="px-6 py-4">
                      {order.customer_email ?? order.user_email ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#766B63]">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {formatPrice(fromKobo(order.total ?? 0))}
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}