
import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import PagePlaceholder from "@/components/shared/PagePlaceholder";

import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import PaymentCallbackPage from "@/pages/PaymentCallbackPage";
import NotFoundPage from "@/pages/NotFoundPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

const placeholder = (title, description) => (
  <PagePlaceholder title={title} description={description} />
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "shop", element: placeholder("Shop all", "Explore the Vestirhaus collection.") },
      { path: "categories/:categorySlug", element: placeholder("Explore the collection", "Browse styles across our multi-gender catalogue.") },
      { path: "products/:slug", element: <ProductDetailPage /> },
      { path: "cart", element: placeholder("Your bag", "Your selected pieces will appear here.") },
      { path: "checkout", element: placeholder("Checkout", "Review your order and delivery details.") },

      { path: "login", element: placeholder("Welcome back", "Sign in to your Vestirhaus account.") },
      { path: "register", element: placeholder("Join Vestirhaus", "Create your customer account.") },
      { path: "forgot-password", element: placeholder("Reset your password", "Request a password reset link.") },
      { path: "reset-password", element: placeholder("Choose a new password", "Complete your password reset.") },
      { path: "verify-email", element: placeholder("Verify your email", "Confirm your email address.") },

      { path: "account", element: placeholder("My account", "Manage your profile and personal details.") },
      { path: "account/addresses", element: placeholder("Saved addresses", "Manage your delivery addresses.") },
      { path: "orders", element: placeholder("Your orders", "View your order history.") },
      { path: "orders/:orderId", element: placeholder("Order details", "Review an individual order.") },

      { path: "payment/callback", element: <PaymentCallbackPage /> },
      { path: "wishlist", element: placeholder("Your wishlist", "Keep track of pieces you love.") },

      { path: "unauthorized", element: <UnauthorizedPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
