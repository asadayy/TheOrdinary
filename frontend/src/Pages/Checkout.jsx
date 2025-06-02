import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import API_URL from "../config/api";
import "./Styles/Checkout.css";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.175;
  const grandTotal = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const shippingDetails = {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      city: formData.get('city'),
      postalCode: formData.get('postal'),
      phone: formData.get('phone')
    };

    const orderData = {
      shippingDetails,
      products: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: grandTotal
    };

    try {
      await axios.post(`${API_URL}/api/orders`, orderData);
      clearCart();
      alert('Order placed successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2 className="checkout-title">Checkout</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty.</p>
      ) : (
        <div className="checkout-flex">
          <div className="checkout-left">
            <div className="checkout-table-container">
              <table className="checkout-table">
                <thead>
                  <tr>
                    <th align="left">Product</th>
                    <th align="center">Quantity</th>
                    <th align="center">Unit Price</th>
                    <th align="right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={item.productId && typeof item.productId === 'string' ? item.productId : `cart-item-${index}`}>
                      <td className="product-name">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            style={{
                              width: 50, 
                              height: 50, 
                              objectFit: 'cover', 
                              borderRadius: 16, 
                              marginRight: 15, 
                              filter: 'grayscale(80%)'
                            }} 
                          />
                        )}
                        <span>{item.name}</span>
                      </td>
                      <td align="center">{item.quantity}</td>
                      <td align="center">${item.price.toFixed(2)}</td>
                      <td align="right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="checkout-summary">
              <div>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span>Tax (17.5%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div>
                <span>Grand Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="checkout-right">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <h3>Shipping Details</h3>
              {error && <div className="error-message">{error}</div>}
              <div className="form-row">
                <input type="text" name="name" placeholder="Full Name" required />
              </div>
              <div className="form-row">
                <input type="email" name="email" placeholder="Email" required />
              </div>
              <div className="form-row">
                <input type="text" name="address" placeholder="Address" required />
              </div>
              <div className="form-row city-postal">
                <input type="text" name="city" placeholder="City" required />
                <input type="text" name="postal" placeholder="Postal Code" required />
              </div>
              <div className="form-row">
                <input type="tel" name="phone" placeholder="Phone Number" required />
              </div>
              <button 
                type="submit" 
                className="checkout-submit-btn"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
