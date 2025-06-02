import { useCart } from '../../Context/CartContext';
import './CartDropdown.css';

import { useNavigate } from "react-router-dom";

const CartDropdown = () => {
  const { cartItems, removeFromCart, addToCart } = useCart();
  console.log("Cart items in UI (CartDropdown):", cartItems);
  
  // Modified remove function with debugging
  const handleRemove = (productId) => {
    console.log("Attempting to remove product ID:", productId);
    removeFromCart(productId);
  };
  const navigate = useNavigate();

  // Calculate subtotal, tax, and total
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.175;
  const grandTotal = subtotal + tax;

  // Handle quantity change and update backend
  const handleQtyChange = (productId, newQty) => {
    try {
      // Ensure quantity is a valid number and at least 1
      const qty = Math.max(1, parseInt(newQty) || 1);
      console.log(`Updating quantity for product ${productId} to ${qty}`);
      
      // Call the addToCart function with the new quantity
      addToCart(productId, qty);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  return (
    <div className="cart-dropdown-wrapper">
      <div className="cart-dropdown-table-header">
        <span className="cart-header-product">Product</span>
        <span className="cart-header-qty">Quantity</span>
        <span className="cart-header-subtotal">Subtotal</span>
      </div>
      <div className="cart-items-table">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <p>Start adding some items to your cart!</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item._id} className="cart-row">
              <div className="cart-col-product">
                <div className="cart-product-info">
                  <div className="cart-product-name">
                    <span>{item.name || "Unknown Product"}</span>
                  </div>
                  <div className="cart-product-price">Price: ${item.price.toFixed(2)}</div>
                  <button className="cart-remove-link cart-remove-small" title="Remove from cart" onClick={() => handleRemove(item.productId)}>&times;</button>
                </div>
              </div>
              <div className="cart-col-qty">
                <input
                  type="number"
                  className="cart-qty-input"
                  value={item.quantity}
                  min="1"
                  onChange={e => handleQtyChange(item.productId, e.target.value)}
                />
              </div>
              <div className="cart-col-subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-summary-table">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="cart-summary-row cart-summary-total">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      <button className="proceed-checkout-btn" onClick={() => navigate('/checkout')}>
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartDropdown;
