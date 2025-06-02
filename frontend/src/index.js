import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./Context/AuthContext"; // Import AuthProvider
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import CartProvider from "./Context/CartContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CartProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </CartProvider>
  </React.StrictMode>
);

reportWebVitals();