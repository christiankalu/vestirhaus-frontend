import api from "@/api/axios";

export const ACCOUNT_ENDPOINTS = {
    profile: "/users/me/",
    orders: "/orders/",
    orderDetail: (id) => `/orders/${encodeURIComponent(id)}/`,
    wishlist: "/wishlist/",
    wishlistItem: (id) =>
        `/wishlist/items/${encodeURIComponent(id)}/`,
    addresses: "/users/me/addresses/",
    addressDetail: (id) =>
        `/users/addresses/${encodeURIComponent(id)}/`,
    passwordChange: "/auth/password/change/",
    deleteAccount: "/users/me/",
};

function getList(payload, keys = []) {
    if (Array.isArray(payload)) return payload;

    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }

    if (Array.isArray(payload?.results)) return payload.results;

    return [];
}

export async function fetchProfile() {
    const response = await api.get(ACCOUNT_ENDPOINTS.profile);
    return response.data?.user ?? response.data?.data ?? response.data;
}

export async function saveProfile(data) {
    const response = await api.patch(ACCOUNT_ENDPOINTS.profile, data);
    return response.data?.user ?? response.data?.data ?? response.data;
}

export async function fetchOrders() {
    const response = await api.get(ACCOUNT_ENDPOINTS.orders);
    return getList(response.data, ["orders"]);
}

export async function fetchOrderDetail(orderId) {
    const response = await api.get(
        ACCOUNT_ENDPOINTS.orderDetail(orderId),
    );

    return (
        response.data?.order ??
        response.data?.data ??
        response.data
    );
}

export async function fetchWishlist() {
    const response = await api.get(ACCOUNT_ENDPOINTS.wishlist);
    return getList(response.data, ["wishlist", "items"]);
}

export async function removeWishlistItem(itemId) {
    const response = await api.delete(
        ACCOUNT_ENDPOINTS.wishlistItem(itemId),
    );

    return response.data;
}

export async function fetchAddresses() {
    const response = await api.get(ACCOUNT_ENDPOINTS.addresses);
    return getList(response.data, ["addresses"]);
}

export async function createAddress(data) {
    const response = await api.post(ACCOUNT_ENDPOINTS.addresses, data);
    return response.data?.address ?? response.data;
}

export async function updateAddress(id, data) {
    const response = await api.patch(
        ACCOUNT_ENDPOINTS.addressDetail(id),
        data,
    );

    return response.data?.address ?? response.data;
}

export async function deleteAddress(id) {
    const response = await api.delete(
        ACCOUNT_ENDPOINTS.addressDetail(id),
    );

    return response.data;
}

export async function setDefaultAddress(id) {
    const response = await api.patch(
        ACCOUNT_ENDPOINTS.addressDetail(id),
        { is_default: true },
    );

    return response.data?.address ?? response.data;
}

export async function changePassword(data) {
    const response = await api.post(
        ACCOUNT_ENDPOINTS.passwordChange,
        {
            current_password: data.current_password,
            new_password: data.new_password,
            confirm_password: data.confirm_password,
        },
    );

    return response.data;
}

export async function deleteAccount(currentPassword) {
    const response = await api.delete(
        ACCOUNT_ENDPOINTS.deleteAccount,
        {
            data: { current_password: currentPassword },
        },
    );

    return response.data;
}