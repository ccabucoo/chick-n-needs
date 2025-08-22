import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLogout } from '../hooks/useLogout';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user } = useAuth();
  const { getCartItemCount, getWishlistCount } = useCart();
  const location = useLocation();
  const handleLogout = useLogout();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.navbar')) {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  



  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo (non-interactive) */}
          <div className="navbar-logo" aria-label="Chick'N Needs logo">
            <div className="logo-icon">
              <img src="/images/Chick'N Needs Logo.png" alt="Chick'N Needs Logo" className="logo-image" />
            </div>
            <span className="logo-text">Chick'N Needs</span>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/products" className="nav-link">
              Products
            </Link>
            <Link to="/about" className="nav-link">
              About
            </Link>
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </div>

          

          {/* User Actions */}
          <div className="navbar-actions">
            {/* Wishlist - Only visible when logged in */}
            {user && (
              <Link to="/wishlist" className="action-button">
                <span className="action-icon">❤️</span>
                <span className="action-text">Wishlist</span>
                {getWishlistCount() > 0 && (
                  <span className="action-badge">{getWishlistCount()}</span>
                )}
              </Link>
            )}

            {/* Cart - Only visible when logged in */}
            {user && (
              <Link to="/cart" className="action-button">
                <span className="action-icon">🛒</span>
                <span className="action-text">Cart</span>
                {getCartItemCount() > 0 && (
                  <span className="action-badge">{getCartItemCount()}</span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="user-menu-wrapper">
                <button
                  className="user-menu-button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <span className="user-name">Settings</span>
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="user-details">
                        <h4 className="user-full-name">{user.name}</h4>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link to="/profile" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      My Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item">
                      <span className="dropdown-icon"></span>
                      My Orders
                    </Link>
                    <Link to="/cart" className="dropdown-item">
                      <span className="dropdown-icon"></span>
                      Cart
                    </Link>
                    <Link to="/wishlist" className="dropdown-item">
                      <span className="dropdown-icon"></span>
                      Wishlist
                    </Link>
                    <Link to="/notifications" className="dropdown-item">
                      <span className="dropdown-icon"></span>
                      Notifications
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <span className="dropdown-icon"></span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            
            
            <div className="mobile-nav-links">
              <Link to="/" className="mobile-nav-link">
                Home
              </Link>
              <Link to="/products" className="mobile-nav-link">
                Products
              </Link>
              <Link to="/about" className="mobile-nav-link">
                About
              </Link>
              <Link to="/contact" className="mobile-nav-link">
                Contact
              </Link>
              
              {user ? (
                <>
                  <div className="mobile-nav-divider"></div>
                  <Link to="/profile" className="mobile-nav-link">
                    My Profile
                  </Link>
                  <Link to="/orders" className="mobile-nav-link">
                    My Orders
                  </Link>
                  <Link to="/wishlist" className="mobile-nav-link">
                    Wishlist
                  </Link>
                  <Link to="/notifications" className="mobile-nav-link">
                    Notifications
                  </Link>
                  <button onClick={handleLogout} className="mobile-nav-link logout">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="mobile-nav-divider"></div>
                  <Link to="/login" className="mobile-nav-link">
                    Sign In
                  </Link>
                  <Link to="/register" className="mobile-nav-link">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
