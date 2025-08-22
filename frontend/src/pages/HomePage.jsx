import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const HomePage = () => {
  const { user } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slides data - Modern and engaging content
  const heroSlides = [
    {
      id: 1,
      title: "Premium Poultry Supplies",
      subtitle: "Everything you need for successful poultry farming",
      cta: "Shop Now",
      link: "/products"
    },
    {
      id: 2,
      title: "Expert Farming Solutions",
      subtitle: "Professional equipment and supplies for modern poultry operations",
      cta: "Explore Solutions",
      link: "/products"
    },
    {
      id: 3,
      title: "Professional Feed Solutions",
      subtitle: "Nutritionally balanced feeds for all stages",
      cta: "Browse Feeds",
      link: "/products?category=Feeds%20%26%20Supplements"
    }
  ];

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Category data
  const categories = [
    {
      id: 2,
      name: "Feeds & Supplements",
      description: "Complete feeds, vitamins, and minerals",
      link: "/products?category=Feeds%20%26%20Supplements"
    },
    {
      id: 3,
      name: "Equipment & Supplies",
      description: "Feeders, drinkers, and farm equipment",
      link: "/products?category=Equipment%20%26%20Supplies"
    },
    {
      id: 4,
      name: "Health & Medicine",
      description: "Vaccines, medicines, and health products",
      link: "/products?category=Health%20%26%20Medicine"
    }
  ];

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      // Show success message (you can add a toast notification here)
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      await addToWishlist(product);
      // Show success message
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero-slide slide-${index + 1} ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="hero-content">
                <div className="container">
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <Link to={slide.link} className="btn btn-primary btn-lg">
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {/* Hero Navigation Dots */}
          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Welcome to Chick'N Needs</h2>
            <p className="section-subtitle">
              Your trusted partner for all poultry farming supplies and equipment
            </p>
          </div>
          
          <div className="welcome-features">
            <div className="welcome-feature">
              <h3>Fast Delivery</h3>
              <p>Same-day delivery for Metro Manila, next-day for nearby provinces</p>
            </div>
            <div className="welcome-feature">
              <h3>Quality Guaranteed</h3>
              <p>All products are sourced from trusted manufacturers and suppliers</p>
            </div>
            <div className="welcome-feature">
              <h3>Expert Support</h3>
              <p>Get advice from our experienced poultry farming specialists</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">
              Find everything you need for successful poultry farming
            </p>
          </div>
          
          <div className="categories-grid">
            {categories.map((category) => (
              <Link key={category.id} to={category.link} className="category-card">
                <div className="category-image">
                  <div className="category-overlay"></div>
                </div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products and Promotions removed as requested */}

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Ready to Start Your Poultry Farm?</h2>
          <p>Join thousands of successful farmers who trust Chick'N Needs</p>
          <div className="cta-buttons">
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse Products
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
