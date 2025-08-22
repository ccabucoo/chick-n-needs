import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    cartItems, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setLoading(true);
      await updateCartItemQuantity(productId, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setLoading(true);
      await removeFromCart(productId);
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        setLoading(true);
        await clearCart();
      } catch (err) {
        console.error('Error clearing cart:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setCheckoutLoading(true);
      
      // Create order
      const token = localStorage.getItem('token');
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        totalAmount: getCartTotal(),
        shippingAddress: user?.address || 'Address not set',
        paymentMethod: 'GCash' // Default payment method
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        // Clear cart after successful order
        await clearCart();
        // Navigate to order details
        navigate(`/orders/${order.order.id}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Temporarily hide Cart UI since backend cart is not wired yet
  return null;

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

  return (
    <div className="container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>Review your items and proceed to checkout</p>
        {itemCount > 0 && (
          <div className="cart-summary">
            <span className="item-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            <span className="total-amount">Total: ₱{cartTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Add some products to your cart to get started!</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-header">
              <h3>Cart Items ({itemCount})</h3>
              <button 
                onClick={handleClearCart} 
                className="btn btn-outline clear-cart-btn"
                disabled={loading}
              >
                Clear Cart
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.productId} className="cart-item">
                  <div className="item-image">
                    <div className="placeholder-image">
                      🦆
                    </div>
                  </div>

                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-category">{item.category}</p>
                    <p className="item-description">{item.description}</p>
                    
                    <div className="item-meta">
                      <span className="item-unit">Unit: {item.unit}</span>
                    </div>
                  </div>

                  <div className="item-price">
                    <span className="current-price">₱{item.price.toFixed(2)}</span>
                  </div>

                  <div className="item-quantity">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={loading || item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="quantity-btn"
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="item-total">
                    <span className="total-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="btn btn-outline remove-btn"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-items">
                <div className="summary-item">
                  <span>Subtotal ({itemCount} items):</span>
                  <span>₱{cartTotal.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="summary-item">
                  <span>Tax:</span>
                  <span>₱{(cartTotal * 0.12).toFixed(2)}</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>₱{(cartTotal * 1.12).toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-actions">
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary checkout-btn"
                  disabled={checkoutLoading || cartItems.length === 0}
                >
                  {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-secondary"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="payment-methods">
                <h4>Accepted Payment Methods</h4>
                <div className="payment-icons">
                  <span className="payment-icon">💳</span>
                  <span className="payment-icon">📱</span>
                  <span className="payment-icon">🏦</span>
                </div>
                <p className="payment-note">
                  We accept GCash, PayMaya, and major credit cards
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
