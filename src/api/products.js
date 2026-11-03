import api from "@/api/axios";
import {
  normalizeProduct,
  normalizeProductResponse,
} from "@/utils/productMappers";

export async function fetchProducts(params = {}, options = {}) {
  const response = await api.get("/products/", {
    params,
    signal: options.signal,
  });

  return normalizeProductResponse(response.data);
}

export async function fetchProductBySlug(slug, options = {}) {
  const response = await api.get(
    `/products/${encodeURIComponent(slug)}/`,
    { signal: options.signal },
  );

  const raw =
    response.data?.product ??
    response.data?.data ??
    response.data;

  return normalizeProduct(raw);
}

export async function fetchCategories(options = {}) {
  const response = await api.get("/categories/", {
    signal: options.signal,
  });

  const payload = response.data;
  const categories = Array.isArray(payload)
    ? payload
    : payload?.results ?? payload?.categories ?? [];

  return categories.map((category) => ({
    label:
      category.name ??
      category.title ??
      category.label ??
      "Category",
    value: category.slug ?? category.id ?? "",
  }));
}

export async function fetchProductReviews(slug, options = {}) {
  const response = await api.get(
    `/products/${encodeURIComponent(slug)}/reviews/`,
    { signal: options.signal },
  );

  const payload = response.data;
  return Array.isArray(payload)
    ? payload
    : payload?.results ?? payload?.reviews ?? [];
}

export async function fetchReviewEligibility(slug, options = {}) {
  const response = await api.get(
    `/products/${encodeURIComponent(slug)}/reviews/eligibility/`,
    { signal: options.signal },
  );

  return response.data;
}

export async function submitProductReview(slug, review) {
  const response = await api.post(
    `/products/${encodeURIComponent(slug)}/reviews/`,
    review,
  );

  return response.data;
}