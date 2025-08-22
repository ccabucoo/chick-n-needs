import React, { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCatalog = () => {
  const { products, loading, error, fetchProducts } = useProducts();
  const { addToCart } = useCart();
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

  // Derived flags for UI enable/disable
  const hasSearchInput = searchTerm.trim() !== '';
  const hasFilterInput = !!selectedCategory || priceRange.min !== '' || priceRange.max !== '';
  const canApply = hasSearchInput || hasFilterInput;
  const canClear = hasSearchInput || hasFilterInput;

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
    if (isWorking || !canApply) return;
    setIsWorking(true);
    setAppliedSearchTerm(searchTerm);
    setAppliedCategory(selectedCategory);
    setAppliedSortOption(sortOption);
    setAppliedPriceRange({ ...priceRange });

    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (priceRange.min !== '') params.minPrice = priceRange.min;
    if (priceRange.max !== '') params.maxPrice = priceRange.max;
    const { sortBy, sortOrder } = parseSort(sortOption);
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    try {
      await fetchProducts(params);
    } finally {
      setIsWorking(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (appliedPriceRange.min !== '') params.minPrice = appliedPriceRange.min;
    if (appliedPriceRange.max !== '') params.maxPrice = appliedPriceRange.max;
    const { sortBy, sortOrder } = parseSort(sortOption);
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    await fetchProducts(params);
  };

  const handleClearFilters = async () => {
    if (isWorking || !canClear) return;
    setIsWorking(true);
    setSearchTerm('');
    setSelectedCategory('');
    setSortOption('name');
    setPriceRange({ min: '', max: '' });
    setAppliedSearchTerm('');
    setAppliedCategory('');
    setAppliedSortOption('');
    setAppliedPriceRange({ min: '', max: '' });
    try {
      await fetchProducts();
    } finally {
      setIsWorking(false);
    }
  };

  const handlePriceFilter = () => {
    // Price changes are applied via the main Apply button
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await addToWishlist(productId);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    }
  };

  const categories = [
    'Feeds & Supplements',
    'Vaccines & Medicines',
    'Equipment & Tools',
    'Housing & Materials',
    'Other Supplies'
  ];

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
      <div className="page-header">
        <h1>Product Catalog</h1>
        <p>Browse our complete range of poultry supplies</p>
      </div>

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
              {categories.map(category => (
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
          <button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setPriceRange({ min: '', max: '' });
            fetchProducts();
          }} className="btn btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={`products-container ${viewMode}`}>
          {products.map((product) => (
            <div key={product.id} className={`product-card modern ${viewMode}`}>
              <div className="product-image">
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
                  <button className="btn btn-primary add-to-cart-btn" disabled>
                    Add to Cart
                  </button>
                  <button className="btn btn-outline view-details-btn" disabled>
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
