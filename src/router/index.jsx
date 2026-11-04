import { createBrowserRouter } from "react-router-dom";
import { Navigate, useParams } from "react-router-dom";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AccountLayout from "@/components/account/AccountLayout";
import MainLayout from "@/layouts/MainLayout";
import PagePlaceholder from "@/components/shared/PagePlaceholder";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

import ProfilePage from "@/pages/account/ProfilePage";
import OrdersPage from "@/pages/account/OrdersPage";
import OrderDetailPage from "@/pages/account/OrderDetailPage";
import WishlistPage from "@/pages/account/WishlistPage";
import AddressesPage from "@/pages/account/AddressesPage";
import AccountSettingsPage from "@/pages/account/AccountSettingsPage";

import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import PaymentCallbackPage from "@/pages/PaymentCallbackPage";
import NotFoundPage from "@/pages/NotFoundPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import ShopPage from "@/pages/ShopPage";
import SearchPage from "@/pages/SearchPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import CollectionsPage from "@/pages/CollectionsPage";
import AboutPage from "@/pages/AboutPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";

// Admin Routes Imports
import AdminRoute from "@/components/admin/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";

import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminProductFormPage from "@/pages/admin/AdminProductFormPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "@/pages/admin/AdminOrderDetailPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminCouponsPage from "@/pages/admin/AdminCouponsPage";


const placeholder = (title, description) => (
  <PagePlaceholder title={title} description={description} />
);

function LegacyOrderRedirect() {
  const { orderId } = useParams();

  return (
    <Navigate
      to={`/account/orders/${encodeURIComponent(orderId)}`}
      replace
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, path: "/", element: <HomePage /> },
      { path: "/shop", element: <ShopPage /> },
      { path: "/categories/:categorySlug", element: placeholder("Explore the collection", "Browse styles across our multi-gender catalogue.") },
      { path: "/products/:slug", element: <ProductDetailPage /> },
      { path: "/search", element: <SearchPage /> },

      // Auth Routes
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPasswordPage />,
      },
      {
        path: "/verify-email/:token",
        element: <VerifyEmailPage />,
      },

      
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/account",
            element: <AccountLayout />,
            children: [
              {
                index: true,
                element: <ProfilePage />,
              },
              {
                path: "orders",
                element: <OrdersPage />,
              },
              {
                path: "orders/:orderId",
                element: <OrderDetailPage />,
              },
              {
                path: "wishlist",
                element: <WishlistPage />,
              },
              {
                path: "addresses",
                element: <AddressesPage />,
              },
              {
                path: "settings",
                element: <AccountSettingsPage />,
              },
            ],
          },

          // Backwards-compatible URLs used by earlier phases.
          {
            path: "/wishlist",
            element: <Navigate to="/account/wishlist" replace />,
          },
          {
            path: "/orders",
            element: <Navigate to="/account/orders" replace />,
          },
          {
            path: "/orders/:orderId",
            element: <LegacyOrderRedirect />,
          },
        ],
      },


      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/payment/callback",
        element: <PaymentCallbackPage />,
      },
      {
        path: "/order-success/:reference",
        element: <OrderSuccessPage />,
      },


      // Shop
      {
        path: "/shop/men",
        element: <ShopPage />,
      },
      {
        path: "/shop/women",
        element: <ShopPage />,
      },
      {
        path: "/shop/kids",
        element: <ShopPage />,
      },
      {
        path: "/shop/unisex",
        element: <ShopPage />,
      },


      {
        path: "/collections",
        element: <CollectionsPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/blog",
        element: <BlogPage />,
      },
      {
        path: "/blog/:slug",
        element: <BlogPostPage />,
      },


      { path: "/unauthorized", element: <UnauthorizedPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },

  // Admin Routes
  {
    element: <AdminRoute />,
    children: [
      {
        path: "/admin-panel",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: "products",
            element: <AdminProductsPage />,
          },
          {
            path: "products/new",
            element: <AdminProductFormPage />,
          },
          {
            path: "products/:productId/edit",
            element: <AdminProductFormPage />,
          },
          {
            path: "orders",
            element: <AdminOrdersPage />,
          },
          {
            path: "orders/:orderId",
            element: <AdminOrderDetailPage />,
          },
          {
            path: "customers",
            element: <AdminCustomersPage />,
          },
          {
            path: "coupons",
            element: <AdminCouponsPage />,
          },
        ],
      },
    ],
  },
]);
