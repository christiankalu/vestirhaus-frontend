function toNumber(value, fallback = 0) {
  const result = Number(value);

  return Number.isFinite(result) ? result : fallback;
}

const API_PRICES_ARE_KOBO = true;

function fromKobo(value, fallback = 0) {
  const amount = toNumber(value, fallback);

  return API_PRICES_ARE_KOBO
    ? amount / 100
    : amount;
}

function getBackendOrigin() {
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ??
    "http://127.0.0.1:8000/api";

  try {
    return new URL(apiBase).origin;
  } catch {
    return "http://127.0.0.1:8000";
  }
}

function normalizeMediaUrl(value) {
  if (!value) return "";

  const url = String(value).trim();

  if (!url) return "";

  // Cloudinary and other absolute image URLs.
  if (/^https?:\/\//i.test(url)) return url;

  // Data URLs and local blob URLs.
  if (/^(data:|blob:)/i.test(url)) return url;

  // Relative Django media paths need the backend host, not localhost:5173.
  const origin = getBackendOrigin();

  return `${origin}/${url.replace(/^\/+/, "")}`;
}

function imageUrl(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    return (
      imageUrl(value.image_url) ||
      imageUrl(value.image) ||
      imageUrl(value.display_url) ||
      imageUrl(value.original) ||
      imageUrl(value.url) ||
      imageUrl(value.src) ||
      imageUrl(value.file) ||
      imageUrl(value.full) ||
      imageUrl(value.large) ||
      ""
    );
  }

  return "";
}

function attributeName(value) {
  if (value == null) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return value.name ?? value.label ?? value.value ?? value.title ?? "";
}

function normalizeVariant(raw = {}, product = {}) {
  const stock = toNumber(raw.stock_quantity, 0);

  const color =
    typeof raw.color === "object"
      ? raw.color?.name ?? ""
      : raw.color ?? "";

  return {
    ...raw,

    id: raw.id ?? raw.variant_id ?? raw.pk ?? null,

    size: raw.size?.name ?? raw.size ?? "",

    color,

    colorHex:
      raw.color_hex_code ??
      raw.color_hex ??
      raw.hex_code ??
      raw.color?.hex_code ??
      "#B8A58C",

    sku: raw.sku ?? "",

    stockQuantity: stock,

    inStock:
      raw.is_available !== false &&
      raw.is_in_stock !== false &&
      raw.available !== false &&
      stock > 0,

    price: fromKobo(
      raw.current_price ??
      raw.discount_price ??
      raw.sale_price ??
      raw.price ??
      (
        toNumber(product.current_price ?? product.base_price) +
        toNumber(raw.additional_price)
      ),
    ),
  };
}

export function normalizeProduct(raw = {}) {
  const rawImages = Array.isArray(raw.images)
    ? raw.images
    : [];

  const imageList = rawImages
    .map((item) => imageUrl(item.image ?? item))
    .filter(Boolean);

  const primaryImage =
    imageUrl(raw.primary_image) ||
    imageList[0] ||
    imageUrl(raw.image_url) ||
    imageUrl(raw.image) ||
    "";

  const secondaryImage =
    imageUrl(raw.secondary_image) ||
    imageUrl(raw.hover_image) ||
    imageList.find((image) => image !== primaryImage) ||
    "";

  const galleryImages = [
    ...new Set(
      [primaryImage, secondaryImage, ...imageList].filter(Boolean),
    ),
  ];

  // Your actual API fields are current_price, discount_price,
  // and base_price.
  const price = fromKobo(
    raw.current_price ??
    raw.discount_price ??
    raw.sale_price ??
    raw.price ??
    raw.base_price,
  );

  const originalPrice = fromKobo(
    raw.base_price ??
    raw.original_price ??
    raw.regular_price ??
    raw.compare_at_price,
  );

  const compareAtPrice =
    originalPrice > price ? originalPrice : null;

  const rawVariants = Array.isArray(raw.variants)
    ? raw.variants
    : [];

  const variants = rawVariants.map((variant) =>
    normalizeVariant(variant, raw),
  );

  const colors = [
    ...new Map(
      variants
        .filter((variant) => variant.color)
        .map((variant) => [
          variant.color.toLowerCase(),
          {
            name: variant.color,
            hex: variant.colorHex,
          },
        ]),
    ).values(),
  ];

  return {
    ...raw,

    id: raw.id ?? raw.pk ?? null,

    name: raw.name ?? raw.title ?? "Untitled product",

    slug: raw.slug ?? "",

    category:
      raw.category_name ??
      raw.category?.name ??
      raw.category ??
      "Clothing",

    categorySlug:
      raw.category_slug ??
      raw.category?.slug ??
      (typeof raw.category === "string" ? raw.category : ""),

    gender: raw.audience ?? raw.gender ?? "",

    price,

    compareAtPrice,

    image: primaryImage,

    primary_image: primaryImage,

    secondaryImage,

    images: galleryImages,

    colors,

    variants,

    description: raw.description ?? "",

    badge:
      raw.badge ??
      (raw.is_new ? "NEW" : compareAtPrice ? "SALE" : null),

    rating: toNumber(raw.average_rating, 0),

    reviewCount: toNumber(raw.review_count, 0),

    inStock: variants.some((variant) => variant.inStock),
  };
}

export function normalizeProductResponse(payload) {
  const source = Array.isArray(payload)
    ? payload
    : payload?.results ??
    payload?.products ??
    payload?.data ??
    [];

  return {
    results: source.map(normalizeProduct),
    count: toNumber(payload?.count, source.length),
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
  };
}