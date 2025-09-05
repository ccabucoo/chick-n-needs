import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]); // deprecated
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';
  
  // Request deduplication to prevent multiple identical API calls
  const pendingRequests = new Map();

  // Fetch all products with filters
  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const requestKey = `products?${queryParams}`;
      
      // Check if there's already a pending request for this query
      if (pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
      }

      // Create the request promise
      const requestPromise = (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
          const data = await response.json();

          if (data.success) {
            setProducts(data.data.products);
            // Set categories from backend response
            if (data.data.filters && data.data.filters.categories) {
              setCategories(data.data.filters.categories);
            }
            return data.data;
          } else {
            throw new Error(data.error || 'Failed to fetch products');
          }
        } catch (err) {
          setError(err.message);
          console.error('Error fetching products:', err);
          throw err;
        } finally {
          setLoading(false);
          // Remove from pending requests
          pendingRequests.delete(requestKey);
        }
      })();

      // Store the pending request
      pendingRequests.set(requestKey, requestPromise);
      
      return requestPromise;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Deprecated: fetchFeaturedProducts removed per requirements
  const fetchFeaturedProducts = async () => ({ success: true, data: [] });

  // Fetch single product by ID
  const fetchProductById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch product');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const searchProducts = async (searchTerm) => {
    return await fetchProducts({ search: searchTerm });
  };

  // Filter products by category
  const filterByCategory = async (category) => {
    return await fetchProducts({ category });
  };

  // Sort products
  const sortProducts = async (sortBy, sortOrder = 'asc') => {
    return await fetchProducts({ sortBy, sortOrder });
  };

  // Filter by price range
  const filterByPrice = async (minPrice, maxPrice) => {
    return await fetchProducts({ minPrice, maxPrice });
  };

  // Filter by tags
  const filterByTags = async (tags) => {
    return await fetchProducts({ tags: tags.join(',') });
  };

  // Deprecated: sale-specific helpers removed
  const getProductsOnSale = async () => ({ success: true, data: [] });

  // Get new products
  const getNewProducts = async () => {
    return await fetchProducts({ isNew: 'true' });
  };

  // Get popular products
  const getPopularProducts = async () => {
    return await fetchProducts({ isPopular: 'true' });
  };

  // No initial featured fetch
  useEffect(() => {}, []);

  const value = {
    products,
    featuredProducts,
    categories,
    loading,
    error,
    fetchProducts,
    fetchFeaturedProducts,
    fetchProductById,
    searchProducts,
    filterByCategory,
    sortProducts,
    filterByPrice,
    filterByTags,
    getProductsOnSale,
    getNewProducts,
    getPopularProducts,
    clearError: () => setError(null)
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
