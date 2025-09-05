import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get product image based on product name/category
  const getProductImage = (item) => {
    const productName = item.name.toLowerCase();
    const category = item.category.toLowerCase();
    
    // Map product names to images
    if (productName.includes('broiler')) {
      return '/images/Broiler.png';
    } else if (productName.includes('drinker') || productName.includes('automatic')) {
      return '/images/Automatic Poultry Drinke.png';
    } else if (productName.includes('feeder')) {
      return '/images/Poultry Feeder.png';
    } else if (productName.includes('netting') || productName.includes('net')) {
      return '/images/Poultry Netting.png';
    } else if (productName.includes('layer') || productName.includes('mash')) {
      return '/images/Layer Mash.png';
    } else if (productName.includes('premix')) {
      return '/images/Poultry Premix.png';
    } else if (productName.includes('antibiotic')) {
      return '/images/Poultry Antibiotic.png';
    } else if (productName.includes('dewormer') || productName.includes('deworm')) {
      return '/images/Poultry Dewormer.png';
    } else if (productName.includes('vaccine')) {
      return '/images/Poultry Vaccine.png';
    } else {
      // Default image based on category
      if (category.includes('feeds')) {
        return '/images/FEEDS AND SUPPLEMENTS.png';
      } else if (category.includes('equipment')) {
        return '/images/EQUIPMENT AND SUPPLIES.png';
      } else if (category.includes('health')) {
        return '/images/HEALTH AND MEDICINE.png';
      }
      return '/images/Chick\'N Needs Logo.png'; // Fallback
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchOrderDetails();
  }, [id, isAuthenticated, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchOrderDetails} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/orders')} className="btn btn-primary">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <button 
          onClick={() => navigate('/orders')} 
          className="btn btn-outline back-btn"
        >
          ← Back to Orders
        </button>
        <h1>Order #{order.id}</h1>
        <p>Order Details and Tracking Information</p>
      </div>

      <div className="order-details-grid">
        {/* Order Summary */}
        <div className="order-summary-card">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>Order Date:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="summary-item">
            <span>Status:</span>
            <span className={`status-badge ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <div className="summary-item">
            <span>Total Amount:</span>
            <span className="total-amount">₱{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Payment Method:</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="summary-item">
            <span>Payment Status:</span>
            <span className={`payment-status ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="shipping-card">
          <h3>Shipping Information</h3>
          <div className="address-info">
            <p><strong>Shipping Address:</strong></p>
            <p>{order.shippingAddress}</p>
          </div>
          {order.trackingNumber && (
            <div className="tracking-info">
              <p><strong>Tracking Number:</strong></p>
              <p className="tracking-number">{order.trackingNumber}</p>
            </div>
          )}
          {order.estimatedDelivery && (
            <div className="delivery-info">
              <p><strong>Estimated Delivery:</strong></p>
              <p>{formatDate(order.estimatedDelivery)}</p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="order-items-card">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item-detail">
                <div className="item-image">
                  <img src={getProductImage(item)} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">₱{item.price.toFixed(2)} per unit</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                </div>
                <div className="item-total">
                  ₱{item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="timeline-card">
          <h3>Order Timeline</h3>
          <div className="timeline">
            <div className="timeline-item completed">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Order Placed</h4>
                <p>{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className={`timeline-item ${order.status !== 'pending' ? 'completed' : ''}`}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Order Confirmed</h4>
                <p>{order.status !== 'pending' ? formatDate(order.updatedAt) : 'Pending'}</p>
              </div>
            </div>
            <div className={`timeline-item ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Processing</h4>
                <p>{['processing', 'shipped', 'delivered'].includes(order.status) ? 'In Progress' : 'Pending'}</p>
              </div>
            </div>
            <div className={`timeline-item ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Shipped</h4>
                <p>{['shipped', 'delivered'].includes(order.status) ? 'On the way' : 'Pending'}</p>
              </div>
            </div>
            <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Delivered</h4>
                <p>{order.status === 'delivered' ? 'Delivered' : 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="order-actions">
        {order.status === 'confirmed' && (
          <button className="btn btn-outline">Cancel Order</button>
        )}
        <button 
          onClick={() => navigate('/products')} 
          className="btn btn-primary"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
