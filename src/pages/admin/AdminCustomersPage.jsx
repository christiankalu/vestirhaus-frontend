import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";

import { fetchAdminCustomers } from "@/api/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatPrice, fromKobo } from "@/utils/formatPrice";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchAdminCustomers({
          ...(search.trim() ? { search: search.trim() } : {}),
          page_size: 30,
        });

        if (active) setCustomers(result.results);
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.detail ??
              "The admin customers endpoint is not available yet.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const timeout = window.setTimeout(load, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [search]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="CUSTOMER RELATIONSHIPS"
        title="Customers."
        description="View registered customers, their order activity and purchase history."
      />

      <section className="border border-[#211B18]/10 bg-[#FFFCF7]">
        <div className="flex flex-col gap-3 border-b border-[#211B18]/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl">Customer directory</h2>
            <p className="mt-1 text-xs text-[#766B63]">
              Customer account and spending overview.
            </p>
          </div>

          <label className="flex min-h-10 items-center gap-2 border border-[#211B18]/15 px-3">
            <Search size={14} className="text-[#8B7D72]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email…"
              aria-label="Search customers"
              className="min-w-0 bg-transparent text-xs outline-none"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="m-5 border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-7 text-sm text-[#766B63]">Loading customers…</p>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={25} className="mx-auto text-[#A94F32]" />
            <p className="mt-4 text-sm text-[#766B63]">
              No customers returned.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-[#F0E8DC] text-[9px] uppercase tracking-[0.13em] text-[#766B63]">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4">Orders</th>
                  <th className="px-5 py-4">Total spend</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-[#211B18]/10 text-xs"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {[customer.first_name, customer.last_name]
                          .filter(Boolean)
                          .join(" ") || customer.email}
                      </p>
                      <p className="mt-1 text-[10px] text-[#766B63]">
                        {customer.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[#766B63]">
                      {customer.phone ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-[#766B63]">
                      {customer.date_joined
                        ? new Date(customer.date_joined).toLocaleDateString("en-NG")
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      {customer.order_count ?? 0}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {formatPrice(
                        fromKobo(customer.total_spend ?? 0),
                      )}
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