import api from "@/api/axios";
import { useCartStore } from "@/store/cartStore";

function extractCart(payload) {
  return payload?.cart ?? payload?.data ?? payload;
}

export async function addVariantToCart(variantId, quantity = 1) {
  if (variantId == null || variantId === "") {
    throw new Error("This product option doesn't have a valid variant ID.");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least one.");
  }

  let response;

  try {
    response = await api.post("/cart/", {
      variant_id: variantId,
      quantity,
    });
  } catch (error) {
    console.error("VESTIRHAUS ADD TO CART ERROR:", {
      status: error.response?.status,
      response: error.response?.data,
      variantId,
      quantity,
    });

    throw error;
  }

  // Prefer existing store actions, if available.
  const store = useCartStore.getState();
  const refreshCart =
    store.fetchCart ??
    store.loadCart ??
    store.refreshCart;

  if (typeof refreshCart === "function") {
    try {
      await refreshCart();
    } catch {
      // The add request succeeded; a refresh failure should not undo it.
    }
  } else {
    // Fallback for stores without a refresh action.
    try {
      const refreshed = await api.get("/cart/");
      const cart = extractCart(refreshed.data);

      if (cart && typeof cart === "object" && !Array.isArray(cart)) {
        useCartStore.setState({ cart, ...cart });
      }
    } catch {
      // The request succeeded, but the current cart snapshot couldn't refresh.
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vestirhaus:cart-updated"));
  }

  return response.data;
}