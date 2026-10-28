
import { create } from "zustand";

import api from "@/api/axios";

export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  discount: 0,
  shippingFee: 0,
  total: 0,
  couponCode: null,
  isLoading: false,

  async fetchCart() {
    set({ isLoading: true });

    try {
      const { data } = await api.get("/cart/");
      set({
        items: data.items ?? [],
        subtotal: data.subtotal ?? 0,
        discount: data.discount ?? 0,
        shippingFee: data.shipping_fee ?? 0,
        total: data.total ?? 0,
        couponCode: data.coupon_code ?? null,
      });

      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  async addItem(variantId, quantity = 1) {
    const { data } = await api.post("/cart/", {
      variant_id: variantId,
      quantity,
    });

    set({
      items: data.items ?? [],
      subtotal: data.subtotal ?? 0,
      discount: data.discount ?? 0,
      shippingFee: data.shipping_fee ?? 0,
      total: data.total ?? 0,
      couponCode: data.coupon_code ?? null,
    });

    return data;
  },

  async updateItem(itemId, quantity) {
    const { data } = await api.put(`/cart/${itemId}/`, {
      quantity,
    });

    set({
      items: data.items ?? [],
      subtotal: data.subtotal ?? 0,
      discount: data.discount ?? 0,
      shippingFee: data.shipping_fee ?? 0,
      total: data.total ?? 0,
      couponCode: data.coupon_code ?? null,
    });

    return data;
  },

  async removeItem(itemId) {
    await api.delete(`/cart/${itemId}/`);
    await get().fetchCart();
  },

  async applyCoupon(code) {
    const { data } = await api.post("/cart/apply-coupon/", {
      code,
    });

    set({
      items: data.items ?? get().items,
      subtotal: data.subtotal ?? get().subtotal,
      discount: data.discount ?? 0,
      shippingFee: data.shipping_fee ?? get().shippingFee,
      total: data.total ?? 0,
      couponCode: data.coupon_code ?? code,
    });

    return data;
  },

  clearCart() {
    set({
      items: [],
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      total: 0,
      couponCode: null,
    });
  },
}));
