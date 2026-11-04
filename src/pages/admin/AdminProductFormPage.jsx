import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Plus, Trash2 } from "lucide-react";

import {
  createAdminProduct,
  fetchAdminProduct,
  updateAdminProduct,
} from "@/api/admin";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { fromKobo } from "@/utils/formatPrice";

const EMPTY_FORM = {
  name: "",
  slug: "",
  category: "",
  audience: "men",
  brand: "Vestirhaus",
  description: "",
  base_price: "",
  discount_price: "",
  is_featured: false,
  is_active: true,
};

const EMPTY_VARIANT = {
  size: "M",
  color: "",
  color_hex_code: "#000000",
  stock_quantity: 0,
  additional_price: 0,
};

function toKobo(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Enter a valid price.");
  }

  return Math.round(amount * 100);
}

export default function AdminProductFormPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(productId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [variants, setVariants] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing product when editing.
  useEffect(() => {
    if (!isEditing) return;

    let active = true;

    async function loadProduct() {
      try {
        const product = await fetchAdminProduct(productId);

        if (!active) return;

        setForm({
          name: product.name ?? "",
          slug: product.slug ?? "",
          category:
            typeof product.category === "object"
              ? product.category.slug ?? ""
              : product.category ?? "",
          audience: product.audience ?? "men",
          brand: product.brand ?? "Vestirhaus",
          description: product.description ?? "",
          base_price:
            product.base_price != null
              ? String(fromKobo(product.base_price))
              : "",
          discount_price:
            product.discount_price != null
              ? String(fromKobo(product.discount_price))
              : "",
          is_featured: Boolean(product.is_featured),
          is_active: product.is_active !== false,
        });

        setImagePreview(
          product.primary_image ?? "",
        );

        setVariants(
          (product.variants ?? []).map((variant) => ({
            id: variant.id,
            size: variant.size ?? "",
            color: variant.color ?? "",
            color_hex_code:
              variant.color_hex_code ?? "#000000",
            stock_quantity: Number(
              variant.stock_quantity ?? 0,
            ),
            additional_price: fromKobo(
              variant.additional_price ?? 0,
            ),
          })),
        );
      } catch (err) {
        setError(
          err?.response?.data?.detail ??
            "We couldn't load this product.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [isEditing, productId]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateVariant(index, field, value) {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index
          ? { ...variant, [field]: value }
          : variant,
      ),
    );
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      { ...EMPTY_VARIANT },
    ]);
  }

  function removeVariant(index) {
    // Existing variants require a dedicated backend delete operation.
    // Only newly added, unsaved variants can be removed here.
    if (variants[index]?.id) return;

    setVariants((current) =>
      current.filter((_, i) => i !== index),
    );
  }

  function selectImage(file) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.slug.trim() || !form.category.trim()) {
      setError("Product name, slug and category are required.");
      return;
    }

    if (Number(form.discount_price) > Number(form.base_price)) {
      setError("Discount price cannot exceed the base price.");
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();

      data.append("name", form.name.trim());
      data.append("slug", form.slug.trim());
      data.append("category", form.category.trim());
      data.append("audience", form.audience);
      data.append("brand", form.brand.trim());
      data.append("description", form.description);
      data.append("base_price", String(toKobo(form.base_price)));
      data.append("is_featured", String(form.is_featured));
      data.append("is_active", String(form.is_active));

      if (form.discount_price.trim()) {
        data.append(
          "discount_price",
          String(toKobo(form.discount_price)),
        );
      }

      if (imageFile) {
        data.append("image_file", imageFile);
      }

      const variantPayload = variants.map((variant) => ({
        ...(variant.id ? { id: Number(variant.id) } : {}),
        size: variant.size,
        color: variant.color,
        color_hex_code: variant.color_hex_code,
        stock_quantity: Number(variant.stock_quantity),
        additional_price: toKobo(variant.additional_price),
      }));

      data.append("variants", JSON.stringify(variantPayload));

      if (isEditing) {
        await updateAdminProduct(productId, data);
      } else {
        await createAdminProduct(data);
      }

      navigate("/admin-panel/products", {
        replace: true,
      });
    } catch (err) {
      const response = err?.response?.data;

      if (response && typeof response === "object") {
        setError(
          Object.entries(response)
            .map(([field, messages]) =>
              `${field}: ${
                Array.isArray(messages)
                  ? messages.join(" ")
                  : String(messages)
              }`,
            )
            .join(" | "),
        );
      } else {
        setError(err?.message ?? "Unable to save product.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-[#766B63]">
        Loading product…
      </p>
    );
  }

  return (
    <div>
      <Link
        to="/admin-panel/products"
        className="mb-7 inline-flex items-center gap-2 text-xs text-[#766B63] hover:text-[#A94F32]"
      >
        <ArrowLeft size={14} />
        Back to products
      </Link>

      <AdminPageHeader
        eyebrow="PRODUCT CATALOGUE"
        title={isEditing ? "Edit product." : "New product."}
        description="Manage product information, pricing, imagery and stock variants."
      />

      {error && (
        <div
          role="alert"
          className="mb-6 border border-red-200 bg-red-50 p-4 text-xs leading-5 text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product information */}
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5 border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
            <h2 className="font-serif text-2xl">
              Product information
            </h2>

            <div>
              <label className="admin-field-label">
                Product name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-field-label">
                Product slug
              </label>
              <input
                required
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className="admin-input"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="admin-field-label">
                  Category slug
                </label>
                <input
                  required
                  value={form.category}
                  onChange={(e) =>
                    updateField("category", e.target.value)
                  }
                  placeholder="agbada"
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-field-label">
                  Audience
                </label>
                <select
                  value={form.audience}
                  onChange={(e) =>
                    updateField("audience", e.target.value)
                  }
                  className="admin-input"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            </div>

            <div>
              <label className="admin-field-label">
                Brand
              </label>
              <input
                value={form.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-field-label">
                Description
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                className="admin-input resize-y"
              />
            </div>
          </div>

          {/* Product image */}
          <section className="border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
            <h2 className="font-serif text-2xl">
              Product image
            </h2>

            <label className="mt-5 flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden border border-dashed border-[#211B18]/25 bg-[#F0E8DC]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <ImagePlus
                    size={28}
                    className="mx-auto text-[#A94F32]"
                  />
                  <p className="mt-3 text-xs font-medium">
                    Select product image
                  </p>
                  <p className="mt-1 text-[10px] text-[#8B7D72]">
                    JPG, PNG or WebP · Max 5 MB
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  selectImage(e.target.files?.[0])
                }
                className="sr-only"
              />
            </label>

            <p className="mt-3 text-[10px] leading-5 text-[#8B7D72]">
              The image is uploaded through Django to Cloudinary.
            </p>
          </section>
        </section>

        {/* Pricing */}
        <section className="border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
          <h2 className="font-serif text-2xl">Pricing</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="admin-field-label">
                Base price (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.base_price}
                onChange={(e) =>
                  updateField("base_price", e.target.value)
                }
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-field-label">
                Discount price (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discount_price}
                onChange={(e) =>
                  updateField("discount_price", e.target.value)
                }
                className="admin-input"
              />
            </div>
          </div>

          <p className="mt-3 text-[10px] text-[#8B7D72]">
            Prices are entered in naira and converted to kobo before submission.
          </p>
        </section>

        {/* Variants */}
        <section className="border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">
                Variants & inventory
              </h2>
              <p className="mt-1 text-xs text-[#766B63]">
                Manage sizes, colours and available stock.
              </p>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="vh-button vh-button--secondary vh-button--small"
            >
              <Plus size={14} />
              Add variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="mt-6 text-sm text-[#8B7D72]">
              No variants added yet.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id ?? `new-${index}`}
                  className="grid gap-3 border border-[#211B18]/10 bg-[#F7F0E6] p-4 sm:grid-cols-2 xl:grid-cols-5"
                >
                  <div>
                    <label className="admin-field-label">
                      Size
                    </label>
                    <input
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-field-label">
                      Colour
                    </label>
                    <input
                      value={variant.color}
                      onChange={(e) =>
                        updateVariant(index, "color", e.target.value)
                      }
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-field-label">
                      Colour code
                    </label>
                    <input
                      type="color"
                      value={variant.color_hex_code}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "color_hex_code",
                          e.target.value,
                        )
                      }
                      className="admin-input h-11 p-1"
                    />
                  </div>

                  <div>
                    <label className="admin-field-label">
                      Stock quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock_quantity}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "stock_quantity",
                          Number(e.target.value),
                        )
                      }
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-field-label">
                      Extra price (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.additional_price}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "additional_price",
                          e.target.value,
                        )
                      }
                      className="admin-input"
                    />

                    {!variant.id && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] text-red-700"
                      >
                        <Trash2 size={12} />
                        Remove unsaved variant
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-[10px] leading-5 text-[#8B7D72]">
            Existing variants can be edited here. Removing an existing
            variant requires a separate backend deletion operation.
          </p>
        </section>

        {/* Product visibility */}
        <section className="flex flex-wrap gap-7 border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
          <label className="flex items-center gap-3 text-xs">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                updateField("is_active", e.target.checked)
              }
              className="size-4 accent-[#A94F32]"
            />
            Active and visible in store
          </label>

          <label className="flex items-center gap-3 text-xs">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                updateField("is_featured", e.target.checked)
              }
              className="size-4 accent-[#A94F32]"
            />
            Featured product
          </label>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin-panel/products"
            className="vh-button vh-button--secondary"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="vh-button vh-button--primary"
          >
            {saving
              ? "Saving product…"
              : isEditing
                ? "Save changes"
                : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}