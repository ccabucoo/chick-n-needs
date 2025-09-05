import React, { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductCatalog = () => {
  const { products, categories, loading, error, fetchProducts } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedCategory, setAppliedCategory] = useState('');
  const [appliedSortOption, setAppliedSortOption] = useState('');
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: '', max: '' });
  const [isWorking, setIsWorking] = useState(false);

  // Function to get product image based on product name/category
  const getProductImage = (product) => {
    const productName = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    
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

  // Derived flags for UI enable/disable
  const hasSearchInput = searchTerm.trim() !== '';
  const hasFilterInput = !!selectedCategory || priceRange.min !== '' || priceRange.max !== '';
  const canApply = hasSearchInput || hasFilterInput || sortOption !== 'name';
  const canClear = hasSearchInput || hasFilterInput || sortOption !== 'name';

  useEffect(() => {
    // Initial load - only fetch if no search term
    if (!searchTerm) {
      fetchProducts();
    }
  }, []); // Empty dependency array - only run once on mount

  // Remove auto-search on typing; require Apply action instead

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleSort = (option) => {
    setSortOption(option);
  };
  const parseSort = (option) => {
    if (option && option.endsWith('-desc')) {
      return { sortBy: option.replace('-desc', ''), sortOrder: 'desc' };
    }
    return { sortBy: option || 'name', sortOrder: 'asc' };
  };

  const handleApplyFilters = async () => {
    if (isWorking) return;
    setIsWorking(true);
    
    // Update applied filters
    setAppliedSearchTerm(searchTerm);
    setAppliedCategory(selectedCategory);
    setAppliedSortOption(sortOption);
    setAppliedPriceRange({ ...priceRange });

    // Build query parameters
    const params = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedCategory) params.category = selectedCategory;
    if (priceRange.min !== '') params.minPrice = parseFloat(priceRange.min);
    if (priceRange.max !== '') params.maxPrice = parseFloat(priceRange.max);
    
    const { sortBy, sortOrder } = parseSort(sortOption);
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    
    try {
      await fetchProducts(params);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    
    // Keep other filters but remove search
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (appliedPriceRange.min !== '') params.minPrice = parseFloat(appliedPriceRange.min);
    if (appliedPriceRange.max !== '') params.maxPrice = parseFloat(appliedPriceRange.max);
    
    const { sortBy, sortOrder } = parseSort(sortOption);
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    
    try {
      await fetchProducts(params);
    } catch (error) {
      console.error('Error clearing search:', error);
    }
  };

  const handleClearFilters = async () => {
    if (isWorking) return;
    setIsWorking(true);
    
    // Reset all filter states
    setSearchTerm('');
    setSelectedCategory('');
    setSortOption('name');
    setPriceRange({ min: '', max: '' });
    setAppliedSearchTerm('');
    setAppliedCategory('');
    setAppliedSortOption('name');
    setAppliedPriceRange({ min: '', max: '' });
    
    try {
      await fetchProducts();
    } catch (error) {
      console.error('Error clearing filters:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handlePriceFilter = () => {
    // Price changes are applied via the main Apply button
  };

  // Function to check if user is authenticated before performing actions
  const requireAuth = (action) => {
    if (!user) {
      // Show a more user-friendly message
      const message = 'To access this feature, you must have an account. Please sign up to continue.';
      
      // Create a custom notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      `;
      notification.textContent = message;
      
      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      
      // Auto remove after 4 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 4000);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/register');
      }, 1000);
      
      return false;
    }
    return true;
  };

  const handleAddToCart = async (productId) => {
    if (!requireAuth('add to cart')) return;
    
    try {
      await addToCart(productId, 1);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleViewDetails = (productId) => {
    if (!requireAuth('view details')) return;
    
    navigate(`/products/${productId}`);
  };
  

  const handleAddToWishlist = async (productId) => {
    try {
      await addToWishlist(productId);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    }
  };

  // Categories are now fetched from the backend via ProductContext

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' }
  ];

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
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
          <button onClick={fetchProducts} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      

      {/* Toolbar */}
      <div className="catalog-controls">
        <div className="catalog-toolbar">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isWorking && canApply) { handleApplyFilters(); } }}
            />
          </div>
          <div className="search-actions">
            <button onClick={handleApplyFilters} className="btn btn-primary btn-sm" disabled={isWorking || !canApply}>{isWorking ? 'Working...' : 'Apply'}</button>
            <button onClick={handleClearFilters} className="btn btn-outline btn-sm" style={{ marginLeft: '0.5rem' }} disabled={isWorking || !canClear}>Clear Filters</button>
          </div>

          <div className="view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid view"
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="search-info">
          {searchTerm && (
            <div className="search-badge">
              🔍 Searching for: "{searchTerm}"
              <button 
                onClick={handleClearSearch} 
                className="clear-search"
                title="Clear search"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories && categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortOption}
              onChange={(e) => handleSort(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range:</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="price-input"
                onKeyDown={(e) => { if (e.key === 'Enter' && !isWorking && canApply) { handleApplyFilters(); } }}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="price-input"
                onKeyDown={(e) => { if (e.key === 'Enter' && !isWorking && canApply) { handleApplyFilters(); } }}
              />
              <button onClick={handleApplyFilters} className="btn btn-sm btn-outline" disabled={isWorking || !canApply}>{isWorking ? 'Working...' : 'Apply'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
        {appliedSearchTerm && <p>Search results for: "{appliedSearchTerm}"</p>}
        {appliedCategory && <p>Category: {appliedCategory}</p>}
        {appliedSortOption && (
          <p>
            Sort by: {sortOptions.find(o => o.value === appliedSortOption)?.label || appliedSortOption}
          </p>
        )}
        {(appliedPriceRange.min !== '' || appliedPriceRange.max !== '') && (
          <p>
            Price Range: {appliedPriceRange.min || '0'} to {appliedPriceRange.max || '∞'}
          </p>
        )}
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Products Found</h3>
          <p>Try adjusting your search terms or filters</p>
          <button onClick={handleClearFilters} className="btn btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={`products-container ${viewMode}`}>
          {products.map((product) => (
            <div key={product.id} className={`product-card modern ${viewMode}`}>
              <div className="product-image">
                <img src={getProductImage(product)} alt={product.name} />
                <div className="price-badge">
                  ₱{product.price.toFixed(2)}
                </div>
                
                {/* badges removed */}
              </div>

              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3 className="product-name">
                  {product.name}
                </h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-meta">
                  <div className="stock-status">
                    <span className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="product-price">
                  <span className="current-price">₱{product.price.toFixed(2)}</span>
                  <span className="unit">per {product.unit}</span>
                </div>

                <div className="product-actions-bottom">
                  <button 
                    className="btn btn-primary add-to-cart-btn" 
                    onClick={() => handleAddToCart(product.id)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="btn btn-outline view-details-btn"
                    onClick={() => handleViewDetails(product.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More removed */}
    </div>
  );
};

export default ProductCatalog;
