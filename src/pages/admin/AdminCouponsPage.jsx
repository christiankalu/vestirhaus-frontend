import { useEffect, useState } from "react";
import { Plus, TicketPercent } from "lucide-react";

import {
  createAdminCoupon,
  fetchAdminCoupons,
  updateAdminCoupon,
} from "@/api/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatPrice, fromKobo } from "@/utils/formatPrice";

const INITIAL_FORM = {
  code: "",
  discount_type: "percentage",
  value: "",
  min_order_value: "0",
  max_uses: "",
  expiry_date: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function loadCoupons() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAdminCoupons({
        ordering: "-created_at",
        page_size: 50,
      });

      setCoupons(result.results);
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "The admin coupon endpoint is not available yet.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        value:
          form.discount_type === "fixed"
            ? Math.round(Number(form.value) * 100)
            : Number(form.value),
        min_order_value: Math.round(
          Number(form.min_order_value || 0) * 100,
        ),
        max_uses: form.max_uses
          ? Number(form.max_uses)
          : null,
        expiry_date: form.expiry_date || null,
        is_active: true,
      };

      await createAdminCoupon(payload);

      setForm(INITIAL_FORM);
      setFormOpen(false);
      setNotice("Coupon created successfully.");

      await loadCoupons();
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.error ??
          "We couldn't create this coupon.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon) {
    setBusyId(coupon.id);
    setError("");
    setNotice("");

    try {
      await updateAdminCoupon(coupon.id, {
        is_active: !coupon.is_active,
      });

      setCoupons((current) =>
        current.map((item) =>
          item.id === coupon.id
            ? { ...item, is_active: !item.is_active }
            : item,
        ),
      );

      setNotice(
        coupon.is_active
          ? "Coupon deactivated."
          : "Coupon activated.",
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "Couldn't change this coupon's status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="PROMOTIONS"
        title="Coupons."
        description="Create and manage promotional codes and discount limits."
        action={
          <button
            type="button"
            onClick={() => setFormOpen((value) => !value)}
            className="vh-button vh-button--primary"
          >
            <Plus size={15} /> Create coupon
          </button>
        }
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

      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="mb-7 border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7"
        >
          <h2 className="font-serif text-2xl">New coupon</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-medium">Code</label>
              <input
                required
                value={form.code}
                onChange={(e) => updateForm("code", e.target.value)}
                placeholder="WELCOME10"
                className="admin-input uppercase"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium">Discount type</label>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  updateForm("discount_type", e.target.value)
                }
                className="admin-input"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium">
                {form.discount_type === "percentage"
                  ? "Discount percentage"
                  : "Discount amount (₦)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.value}
                onChange={(e) => updateForm("value", e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium">
                Minimum order value (₦)
              </label>
              <input
                type="number"
                min="0"
                value={form.min_order_value}
                onChange={(e) =>
                  updateForm("min_order_value", e.target.value)
                }
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium">
                Maximum uses
              </label>
              <input
                type="number"
                min="1"
                value={form.max_uses}
                onChange={(e) =>
                  updateForm("max_uses", e.target.value)
                }
                placeholder="Unlimited"
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium">
                Expiry date
              </label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) =>
                  updateForm("expiry_date", e.target.value)
                }
                className="admin-input"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="vh-button vh-button--secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="vh-button vh-button--primary"
            >
              {saving ? "Creating…" : "Create coupon"}
            </button>
          </div>
        </form>
      )}

      <section className="border border-[#211B18]/10 bg-[#FFFCF7]">
        <div className="border-b border-[#211B18]/10 p-5">
          <h2 className="font-serif text-2xl">All coupons</h2>
        </div>

        {loading ? (
          <p className="p-7 text-sm text-[#766B63]">Loading coupons…</p>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <TicketPercent size={26} className="mx-auto text-[#A94F32]" />
            <p className="mt-4 text-sm text-[#766B63]">
              No coupons returned yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#F0E8DC] text-[9px] uppercase tracking-[0.13em] text-[#766B63]">
                <tr>
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">Discount</th>
                  <th className="px-5 py-4">Minimum order</th>
                  <th className="px-5 py-4">Usage</th>
                  <th className="px-5 py-4">Expiry</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-t border-[#211B18]/10 text-xs"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {coupon.code}
                    </td>

                    <td className="px-5 py-4">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.value}%`
                        : formatPrice(
                            fromKobo(coupon.value),
                          )}
                    </td>

                    <td className="px-5 py-4">
                      {formatPrice(
                        fromKobo(coupon.min_order_value ?? 0),
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {coupon.used_count ?? 0}
                      {" / "}
                      {coupon.max_uses ?? "Unlimited"}
                    </td>

                    <td className="px-5 py-4 text-[#766B63]">
                      {coupon.expiry_date
                        ? new Date(coupon.expiry_date).toLocaleDateString("en-NG")
                        : "No expiry"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={busyId === coupon.id}
                        onClick={() => toggleActive(coupon)}
                        className={[
                          "px-2.5 py-1 text-[9px] uppercase",
                          coupon.is_active
                            ? "bg-[#E5EBDD] text-[#526B40]"
                            : "bg-[#F3DFDA] text-[#A94F32]",
                        ].join(" ")}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </button>
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