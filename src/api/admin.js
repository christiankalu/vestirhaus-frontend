import api from "@/api/axios";

export const ADMIN_ENDPOINTS = {
    dashboard: "/admin/dashboard/",
    products: "/admin/products/",
    orders: "/admin/orders/",
    customers: "/admin/customers/",
    coupons: "/admin/coupons/",
    refunds: "/payments/admin/refunds/",
};

function normalizeList(payload, keys = []) {
    if (Array.isArray(payload)) return payload;

    for (const key of keys) {
        if (Array.isArray(payload?.[key])) {
            return payload[key];
        }
    }

    return payload?.results ?? [];
}

function normalizePagination(payload) {
    return {
        results: normalizeList(payload, [
            "products",
            "orders",
            "customers",
            "coupons",
        ]),
        count: Number(payload?.count ?? 0),
        next: payload?.next ?? null,
        previous: payload?.previous ?? null,
    };
}

function resourceUrl(base, id = null) {
    return id == null
        ? base
        : `${base}${encodeURIComponent(id)}/`;
}

// Dashboard
export async function fetchAdminDashboard() {
    const response = await api.get(ADMIN_ENDPOINTS.dashboard);
    return response.data?.data ?? response.data;
}

// Products
export async function fetchAdminProducts(params = {}) {
    const response = await api.get(ADMIN_ENDPOINTS.products, { params });
    return normalizePagination(response.data);
}

export async function fetchAdminProduct(id) {
    const response = await api.get(resourceUrl(ADMIN_ENDPOINTS.products, id));
    return response.data?.product ?? response.data?.data ?? response.data;
}

export async function createAdminProduct(formData) {
    const response = await api.post(
        ADMIN_ENDPOINTS.products,
        formData,
    );

    return response.data;
}

export async function updateAdminProduct(id, formData) {
    const response = await api.patch(
        resourceUrl(ADMIN_ENDPOINTS.products, id),
        formData,
    );

    return response.data;
}

export async function deleteAdminProduct(id) {
    const response = await api.delete(
        resourceUrl(ADMIN_ENDPOINTS.products, id),
    );

    return response.data;
}

// Orders — confirmed route and methods from your backend.
export async function fetchAdminOrders(params = {}) {
    const response = await api.get(ADMIN_ENDPOINTS.orders, { params });
    return normalizePagination(response.data);
}

export async function fetchAdminOrder(id) {
    const response = await api.get(
        resourceUrl(ADMIN_ENDPOINTS.orders, id),
    );

    return response.data?.order ?? response.data?.data ?? response.data;
}

export async function updateAdminOrderStatus(id, status) {
    const response = await api.patch(
        resourceUrl(ADMIN_ENDPOINTS.orders, id),
        { status },
    );

    return response.data?.order ?? response.data;
}

// Refund — assumed endpoint; must be implemented in the payments app.
export async function issueAdminRefund({ order_id, reason }) {
    const response = await api.post(
        `${ADMIN_ENDPOINTS.orders}${encodeURIComponent(order_id)}/refund/`,
        { reason },
    );

    return response.data;
}

// Customers
export async function fetchAdminCustomers(params = {}) {
    const response = await api.get(ADMIN_ENDPOINTS.customers, { params });
    return normalizePagination(response.data);
}

// Coupons
export async function fetchAdminCoupons(params = {}) {
    const response = await api.get(ADMIN_ENDPOINTS.coupons, { params });
    return normalizePagination(response.data);
}

export async function createAdminCoupon(data) {
    const response = await api.post(ADMIN_ENDPOINTS.coupons, data);
    return response.data;
}

export async function updateAdminCoupon(id, data) {
    const response = await api.patch(
        resourceUrl(ADMIN_ENDPOINTS.coupons, id),
        data,
    );

    return response.data;
}

export async function deleteAdminCoupon(id) {
    const response = await api.delete(
        resourceUrl(ADMIN_ENDPOINTS.coupons, id),
    );

    return response.data;
}