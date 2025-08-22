import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, getAuthToken, isAuthenticated } = useAuth();

  const API_BASE_URL = 'http://localhost:5000/api';
  const CART_API_DISABLED = true; // Temporarily disable server calls for cart/wishlist

  useEffect(() => {
    // Load from localStorage when not authenticated or when API is disabled
    if (!isAuthenticated() || CART_API_DISABLED) {
      const storedCart = localStorage.getItem('chickNNeedsCart');
      const storedWishlist = localStorage.getItem('chickNNeedsWishlist');
      
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } else {
      // Load from API for authenticated users
      fetchCart();
      fetchWishlist();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Save cart to localStorage for non-authenticated users
    if (!isAuthenticated()) {
      localStorage.setItem('chickNNeedsCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  useEffect(() => {
    // Save wishlist to localStorage for non-authenticated users
    if (!isAuthenticated()) {
      localStorage.setItem('chickNNeedsWishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated() || CART_API_DISABLED) return;

    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCartItems(data.data.items || []);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!isAuthenticated() || CART_API_DISABLED) return;

    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWishlist(data.data.wishlist || []);
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      setError(null);

      if (isAuthenticated() && !CART_API_DISABLED) {
        // Add to cart via API
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: product.id,
            quantity
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCartItems(data.data.items);
          }
        }
      } else {
        // Add to local cart
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => item.id === product.id);
          
          if (existingItem) {
            return prevItems.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prevItems, { ...product, quantity }];
          }
        });
      }
    } catch (error) {
      setError('Failed to add item to cart');
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setError(null);

      if (isAuthenticated() && !CART_API_DISABLED) {
        // Remove from cart via API
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCartItems(data.data.items);
          }
        }
      } else {
        // Remove from local cart
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      }
    } catch (error) {
      setError('Failed to remove item from cart');
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      setError(null);

      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (isAuthenticated() && !CART_API_DISABLED) {
        // Update cart item via API
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCartItems(data.data.items);
          }
        }
      } else {
        // Update local cart item
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      setError('Failed to update cart item');
      console.error('Error updating cart item:', error);
    }
  };

  const clearCart = async () => {
    try {
      setError(null);

      if (isAuthenticated() && !CART_API_DISABLED) {
        // Clear cart via API
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCartItems([]);
          }
        }
      } else {
        // Clear local cart
        setCartItems([]);
      }
    } catch (error) {
      setError('Failed to clear cart');
      console.error('Error clearing cart:', error);
    }
  };

  const addToWishlist = async (product) => {
    try {
      setError(null);

      if (isAuthenticated() && !CART_API_DISABLED) {
        // Add to wishlist via API
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/cart/wishlist/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: product.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setWishlist(data.data.wishlist);
          }
        }
      } else {
        // Add to local wishlist
        setWishlist(prevItems => {
          const existingItem = prevItems.find(item => item.id === product.id);
          if (!existingItem) {
            return [...prevItems, product];
          }
          return prevItems;
        });
      }
    } catch (error) {
      setError('Failed to add item to wishlist');
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setError(null);

      if (isAuthenticated() && !CART_API_DISABLED) {
        // Remove from wishlist via API
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/cart/wishlist/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setWishlist(data.data.wishlist);
          }
        }
      } else {
        // Remove from local wishlist
        setWishlist(prevItems => prevItems.filter(item => item.id !== productId));
      }
    } catch (error) {
      setError('Failed to remove item from wishlist');
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  const value = {
    cartItems,
    wishlist,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getCartTotal,
    getCartItemCount,
    getWishlistCount,
    clearError: () => setError(null)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
