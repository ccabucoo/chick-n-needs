import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProductById } = useProducts();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await fetchProductById(id);
      setProduct(productData);
      if (productData.images && productData.images.length > 0) {
        setSelectedImage(0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product.id, quantity);
      // Show success message or notification
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToWishlist(product.id);
      // Show success message or notification
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Product Not Found</h2>
          <p>{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'description', label: 'Description', content: product.description },
    { id: 'specifications', label: 'Specifications', content: product.specifications },
    { id: 'reviews', label: 'Reviews', content: 'reviews' }
  ];

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => navigate('/products')} className="breadcrumb-link">
          Products
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-details-layout">
        {/* Product Images - replaced with placeholder only */}
        <div className="product-images-section">
          <div className="main-image">
            <div className="placeholder-image"></div>
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-header">
            {/* badges removed */}
            
            <h1 className="product-title">{product.name}</h1>
            <p className="product-category">{product.category}</p>
            
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.floor(product.rating || 0))}
                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </div>
              <span className="rating-text">{product.rating} ({product.reviews} reviews)</span>
            </div>
          </div>

          <div className="product-price-section">
            <span className="current-price">₱{product.price.toFixed(2)}</span>
            <span className="unit">per {product.unit}</span>
          </div>

          <div className="product-stock">
            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="quantity-btn"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="quantity-btn"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={handleAddToCart}
                className="btn btn-primary add-to-cart-btn"
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              <button
                onClick={handleAddToWishlist}
                className={`btn btn-outline wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
              >
                {isInWishlist(product.id) ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
              </button>
            </div>
          </div>

          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">SKU:</span>
              <span className="meta-value">{product.id}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Category:</span>
              <span className="meta-value">{product.category}</span>
            </div>
            {product.subcategory && (
              <div className="meta-item">
                <span className="meta-label">Subcategory:</span>
                <span className="meta-value">{product.subcategory}</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">Tags:</span>
              <div className="tags">
                {product.tags?.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="product-details-tabs">
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="specifications-content">
              {product.specifications ? (
                <div className="specs-grid">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <div className="reviews-summary">
                <div className="overall-rating">
                  <span className="rating-number">{product.rating}</span>
                  <div className="stars-large">
                    {'★'.repeat(Math.floor(product.rating || 0))}
                    {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                  </div>
                  <span className="total-reviews">{product.reviews} reviews</span>
                </div>
              </div>
              
              <div className="reviews-list">
                <p>Reviews functionality will be implemented in future updates.</p>
                <button className="btn btn-outline">Write a Review</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="related-products-section">
        <h3>You Might Also Like</h3>
        <p>Browse similar products in this category</p>
        <div className="related-products-grid">
          {/* This would be populated with actual related products */}
          <div className="related-product-placeholder">
            <p>Related products will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <div className="back-to-top">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn btn-outline"
        >
          ↑ Back to Top
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
