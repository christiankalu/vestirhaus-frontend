import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Edit3,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
} from "@/api/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatPrice, fromKobo } from "@/utils/formatPrice";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAdminProducts({
        ...(search.trim() ? { search: search.trim() } : {}),
        ordering: "-created_at",
        page_size: 20,
      });

      setProducts(result.results);
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "The admin product endpoint is not available yet.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function toggleProduct(product, field) {
    setBusyId(product.id);
    setError("");
    setNotice("");

    const updatedValue = !product[field];

    try {
      await updateAdminProduct(product.id, {
        [field]: updatedValue,
      });

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, [field]: updatedValue }
            : item,
        ),
      );

      setNotice(`${product.name} updated.`);
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          `Couldn't update ${field}.`,
      );
    } finally {
      setBusyId(null);
    }
  }

  async function removeProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action may affect existing catalogue references.`,
    );

    if (!confirmed) return;

    setBusyId(product.id);
    setError("");

    try {
      await deleteAdminProduct(product.id);

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );

      setNotice(`${product.name} deleted.`);
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't delete this product.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="CATALOGUE"
        title="Products."
        description="Manage product information, pricing, imagery, variants and inventory."
        action={
          <Link
            to="/admin-panel/products/new"
            className="vh-button vh-button--primary"
          >
            <Plus size={15} /> Add product
          </Link>
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

      <section className="border border-[#211B18]/10 bg-[#FFFCF7]">
        <div className="flex flex-col gap-3 border-b border-[#211B18]/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <h2 className="font-serif text-xl">
            Product catalogue
          </h2>

          <label className="flex min-h-10 items-center gap-2 border border-[#211B18]/15 px-3">
            <Search size={14} className="text-[#8B7D72]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="min-w-0 bg-transparent text-xs outline-none"
            />
          </label>
        </div>

        {loading ? (
          <p className="p-7 text-sm text-[#766B63]">
            Loading products…
          </p>
        ) : products.length === 0 ? (
          <p className="p-12 text-center text-sm text-[#8B7D72]">
            No products returned.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#F0E8DC] text-[9px] uppercase tracking-[0.13em] text-[#766B63]">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Audience</th>
                  <th className="px-5 py-4">Active</th>
                  <th className="px-5 py-4">Featured</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-[#211B18]/10 text-xs"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 shrink-0 overflow-hidden bg-[#E9DFD2]">
                          {product.primary_image && (
                            <img
                              src={product.primary_image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="mt-1 text-[10px] text-[#8B7D72]">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {formatPrice(
                        fromKobo(
                          product.current_price ??
                            product.discount_price ??
                            product.base_price ??
                            0,
                        ),
                      )}
                    </td>

                    <td className="px-5 py-4 capitalize text-[#766B63]">
                      {product.audience ?? product.gender ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={busyId === product.id}
                        onClick={() => toggleProduct(product, "is_active")}
                        className={[
                          "px-2.5 py-1 text-[9px] uppercase",
                          product.is_active
                            ? "bg-[#E5EBDD] text-[#526B40]"
                            : "bg-[#F3DFDA] text-[#A94F32]",
                        ].join(" ")}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={busyId === product.id}
                        onClick={() =>
                          toggleProduct(product, "is_featured")
                        }
                        className="text-xs text-[#A94F32] underline underline-offset-4 disabled:opacity-40"
                      >
                        {product.is_featured ? "Featured" : "Not featured"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin-panel/products/${product.id}/edit`}
                          aria-label={`Edit ${product.name}`}
                          className="text-[#766B63] hover:text-[#A94F32]"
                        >
                          <Edit3 size={15} />
                        </Link>

                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => removeProduct(product)}
                          aria-label={`Delete ${product.name}`}
                          className="text-[#766B63] hover:text-red-700 disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>

                        <Link
                          to={`/products/${product.slug}`}
                          target="_blank"
                          aria-label={`View ${product.name} in store`}
                          className="text-[#A94F32]"
                        >
                          <ArrowRight size={15} />
                        </Link>
                      </div>
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