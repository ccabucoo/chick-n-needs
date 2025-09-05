import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const HomePage = () => {
  const { user } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  // Category data with images
  const categories = [
    {
      id: 2,
      name: "Feeds & Supplements",
      description: "Complete feeds, vitamins, and minerals",
      link: "/products?category=Feeds%20%26%20Supplements",
      image: "/images/FEEDS AND SUPPLEMENTS.png"
    },
    {
      id: 3,
      name: "Equipment & Supplies",
      description: "Feeders, drinkers, and farm equipment",
      link: "/products?category=Equipment%20%26%20Supplies",
      image: "/images/EQUIPMENT AND SUPPLIES.png"
    },
    {
      id: 4,
      name: "Health & Medicine",
      description: "Vaccines, medicines, and health products",
      link: "/products?category=Health%20%26%20Medicine",
      image: "/images/HEALTH AND MEDICINE.png"
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
      {/* Cover Image */}
      <section className="cover-section">
        <img 
          src="/images/CHICKN'N NEEDS COVER HOMEPAGE.png" 
          alt="Chick'N Needs Cover" 
          className="cover-image"
        />
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                </svg>
              </div>
              <h3>Fast Delivery</h3>
              <p>Same-day delivery for Metro Manila, next-day for nearby provinces</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>Quality Guaranteed</h3>
              <p>All products sourced from trusted manufacturers and suppliers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              </div>
              <h3>Expert Support</h3>
              <p>Get advice from our experienced poultry farming specialists</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
          </div>
          
          <div className="categories-grid">
            {categories.map((category) => (
              <Link key={category.id} to={category.link} className="category-card">
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
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

    </div>
  );
};

export default HomePage;
