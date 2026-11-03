import api from "@/api/axios";
import { useCartStore } from "@/store/cartStore";

export const COMMERCE_ENDPOINTS = {
    cart: "/cart/",
    cartItem: (id) => `/cart/${encodeURIComponent(id)}/`,
    applyCoupon: "/cart/apply-coupon/",
    removeCoupon: "/cart/coupon/",
    addresses: "/users/addresses/",
    orders: "/orders/",
    checkout: "/orders/checkout/",
    initializePayment: "/payments/initialize/",
    verifyPayment: "/payments/verify/",
};

function unwrap(responseData) {
    const body = responseData?.data ?? responseData;
    return body?.cart ?? body?.order ?? body;
}

function syncCartStore(cart) {
    if (!cart || typeof cart !== "object") return;

    useCartStore.setState((state) => ({
        ...state,
        cart,
        items: cart.items ?? state.items,
        subtotal: cart.subtotal ?? state.subtotal,
        discount: cart.discount ?? state.discount,
        shipping_fee: cart.shipping_fee ?? state.shipping_fee,
        total: cart.total ?? state.total,
        coupon_code: cart.coupon_code ?? state.coupon_code,
    }));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("vestirhaus:cart-updated"));
    }
}

export async function fetchCart() {
    const response = await api.get(COMMERCE_ENDPOINTS.cart);
    const cart = unwrap(response.data);

    syncCartStore(cart);
    return cart;
}

export async function updateCartItem(itemId, quantity) {
    if (itemId == null || itemId === "") {
        throw new Error("This cart item has no valid ID.");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Quantity must be at least one.");
    }

    await api.put(
        COMMERCE_ENDPOINTS.cartItem(itemId),
        { quantity },
    );

    return fetchCart();
}

export async function removeCartItem(itemId) {
    if (itemId == null || itemId === "") {
        throw new Error("This cart item has no valid ID.");
    }

    await api.delete(COMMERCE_ENDPOINTS.cartItem(itemId));

    return fetchCart();
}


export async function applyCartCoupon(code) {
    const normalizedCode = String(code ?? "").trim();

    if (!normalizedCode) {
        throw new Error("Enter a coupon code first.");
    }

    await api.post(COMMERCE_ENDPOINTS.applyCoupon, {
        code: normalizedCode,
    });

    return fetchCart();
}

export async function removeCartCoupon() {
    await api.delete(COMMERCE_ENDPOINTS.removeCoupon);
    return fetchCart();
}

/**
 * Optional address saving is performed separately from order creation.
 * This requires an authenticated address endpoint when saveAddress is true.
 */
export async function createCheckoutOrder({
    address,
    saveAddress = false,
}) {
    // Convert the frontend form field names to Django's
    // actual CheckoutSerializer field names.
    const shippingAddress = {
        recipient_name: address.recipient_name ?? address.full_name,
        phone_number: address.phone_number ?? address.phone,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 ?? "",
        city: address.city,
        state: address.state,
        postal_code: address.postal_code ?? address.postcode ?? "",
        country: address.country ?? "Nigeria",
    };

    // Save the address separately only when requested.
    if (saveAddress) {
        await api.post(
            COMMERCE_ENDPOINTS.addresses,
            {
                full_name: shippingAddress.recipient_name,
                phone: shippingAddress.phone_number,
                address_line_1: shippingAddress.address_line_1,
                address_line_2: shippingAddress.address_line_2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postcode: shippingAddress.postal_code,
                country: shippingAddress.country,
            },
        );
    }

    const response = await api.post(
        COMMERCE_ENDPOINTS.checkout,
        {
            shipping_address: shippingAddress,
        },
    );

    return unwrap(response.data);
}

/**
 * The server must calculate the authoritative payable amount from the
 * order, not trust a total supplied by the browser.
 */
export async function initializeOrderPayment(orderId) {
    if (orderId == null || orderId === "") {
        throw new Error("The order was created without an order ID.");
    }

    const response = await api.post(
        COMMERCE_ENDPOINTS.initializePayment,
        { order_id: orderId },
    );

    return unwrap(response.data);
}

export async function verifyOrderPayment(reference) {
    if (!reference) {
        throw new Error("Payment reference is missing.");
    }

    const response = await api.get(
        COMMERCE_ENDPOINTS.verifyPayment,
        { params: { reference } },
    );

    // Preserve the verification fields as well as the order details.
    return response.data?.data ?? response.data;
}

export async function fetchOrderById(orderId) {
    const response = await api.get(
        `${COMMERCE_ENDPOINTS.orders}${encodeURIComponent(orderId)}/`,
    );

    return unwrap(response.data);
}