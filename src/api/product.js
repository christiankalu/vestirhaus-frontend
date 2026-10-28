
import api from "@/api/axios";

export const productsApi = {
  list: (params = {}) => api.get("/products/", { params }),
  detail: (slug) => api.get(`/products/${slug}/`),
  featured: (params = {}) => api.get("/products/featured/", { params }),
  categories: () => api.get("/categories/"),
  reviews: (slug, params = {}) =>
    api.get(`/products/${slug}/reviews/`, { params }),
  submitReview: (slug, payload) =>
    api.post(`/products/${slug}/reviews/`, payload),
};
