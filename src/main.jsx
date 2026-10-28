
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

async function initializeApplication() {
  const auth = useAuthStore.getState();

  if (auth.isAuthenticated) {
    try {
      await auth.fetchCurrentUser();
    } catch (error) {
      // The API may be temporarily unavailable; don't crash the app.
      console.error("Unable to initialize the current user.", error);
    }
  } else {
    useAuthStore.setState({ initialized: true });
  }

  try {
    await useCartStore.getState().fetchCart();
  } catch (error) {
    // An empty or unavailable cart must not prevent the storefront loading.
    console.warn("Unable to initialize the cart.", error);
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

initializeApplication();
