import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isGuest, setIsGuest] = useState(!localStorage.getItem("token"));
  const [cartLoading, setCartLoading] = useState(false);

  // Load cart from backend (JWT) or session (guest)
  useEffect(() => {
    const fetchCart = async () => {
      setCartLoading(true);
      const token = localStorage.getItem("token");
      try {
        if (token) {
          // Always fetch the authorized user's cart from the backend
          const response = await axios.get(`${API_BASE}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          setCartItems(response.data.items || []);
          setTotal(response.data.total || 0);
        } else {
          // Guest fallback
          let guestCart = [];
          try {
            const parsed = JSON.parse(
              localStorage.getItem("guestCart") || "[]"
            );
            guestCart = Array.isArray(parsed) ? parsed : [];
          } catch {
            guestCart = [];
          }
          setCartItems(guestCart);
          const calcTotal = guestCart.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          );
          setTotal(calcTotal);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartItems([]);
        setTotal(0);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [isGuest]);

  const updateGuestCart = (items) => {
    localStorage.setItem("guestCart", JSON.stringify(items));
    setCartItems(items);
    const calcTotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(calcTotal);
  };

  const addToCart = async (productId, quantity) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_BASE}/api/cart/add`,
        { productId, quantity },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );
      setCartItems(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      // Guest fallback using localStorage
      let existing;
      try {
        const parsed = JSON.parse(localStorage.getItem("guestCart") || "[]");
        existing = Array.isArray(parsed) ? parsed : [];
      } catch {
        existing = [];
      }

      const productList = JSON.parse(
        localStorage.getItem("productsList") || "[]"
      );
      const product = productList.find((p) => p._id === productId);
      if (!product) return;

      const index = existing.findIndex((item) => item._id === productId);
      if (index !== -1) {
        existing[index].quantity += quantity;
      } else {
        existing.push({ ...product, quantity });
      }
      updateGuestCart(existing);
    }
  };

  const removeFromCart = async (productId) => {
    // Extract the ID if a full product object was passed
    const id = productId && productId._id ? productId._id : productId;
    console.log("Removing product with ID:", id);
    const token = localStorage.getItem("token");

    // Don't use optimistic UI update since it may be causing issues
    try {
      const response = await axios.delete(
        `${API_BASE}/api/cart/remove/${id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );
      console.log("Server response after removal:", response.data);
      setCartItems(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error removing from cart:", error);

      // Guest fallback - handle locally
      if (!token) {
        let existing;
        try {
          const parsed = JSON.parse(localStorage.getItem("guestCart") || "[]");
          existing = Array.isArray(parsed) ? parsed : [];
        } catch {
          existing = [];
        }

        // Filter out the item with matching productId
        const updated = existing.filter((item) => {
          // Some items might use _id, others productId
          const itemId = item.productId || item._id;
          return itemId !== productId;
        });

        console.log("Updated guest cart:", updated);
        updateGuestCart(updated);
      }
    }
  };

  const checkout = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_BASE}/api/cart/checkout`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );
      setCartItems([]);
      setTotal(0);
      return response.data;
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);
      throw error;
    }
  };

  const handleLogin = async (token) => {
    setIsGuest(false);
    localStorage.setItem("token", token);
    setCartLoading(true);
    try {
      // Merge guest cart to user cart if it exists
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart && JSON.parse(guestCart).length > 0) {
        try {
          await axios.post(
            `${API_BASE}/api/cart/merge`,
            { items: JSON.parse(guestCart) },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          localStorage.removeItem("guestCart");
        } catch (mergeError) {
          console.error("Error merging guest cart:", mergeError);
        }
      }
      // Always fetch the authorized user's cart from the backend
      console.log("Fetching updated cart for authorized user...");
      const response = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("Cart fetched after login:", response.data);
      setCartItems(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error during login/cart merge:", error);
      setCartItems([]);
      setTotal(0);
    } finally {
      setCartLoading(false);
    }
  };

  const handleLogout = () => {
    setIsGuest(true);
    localStorage.removeItem("token");
    // Guest cart remains in localStorage
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await axios.delete(`${API_BASE}/api/cart/clear`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      }
      setCartItems([]);
      setTotal(0);
      localStorage.removeItem("guestCart");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        isGuest,
        cartLoading,
        addToCart,
        removeFromCart,
        checkout,
        handleLogin,
        handleLogout,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export default CartProvider;
