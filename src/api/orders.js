
import api from "@/api/axios";

export const ordersApi = {
  list: (params = {}) => api.get("/orders/", { params }),
  detail: (orderId) => api.get(`/orders/${orderId}/`),
  checkout: (payload) => api.post("/orders/checkout/", payload),
  cancel: (orderId) => api.post(`/orders/${orderId}/cancel/`),

  initializePayment: (orderId) =>
    api.post("/payments/initialize/", { order_id: orderId }),

  verifyPayment: (reference) =>
    api.get(`/payments/verify/${encodeURIComponent(reference)}/`),
};
