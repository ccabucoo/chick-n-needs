import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="page-header">
        <h1>About Chick'N Needs</h1>
        <p>Learn more about our story, mission, and the team behind the platform</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem', color: 'var(--primary-dark)' }}>Our Story</h2>
        <p style={{ color: 'var(--gray)' }}>
          Chick'N Needs started as a simple idea: make quality poultry supplies accessible to every
          Filipino farmer. Today, we connect trusted suppliers with growers nationwide, delivering
          feeds, equipment, medicines, and accessories directly to your doorstep.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem', color: 'var(--primary-dark)' }}>Our Mission</h2>
        <ul style={{ color: 'var(--gray)', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
          <li>Empower small to mid-scale poultry farmers with affordable, reliable supplies</li>
          <li>Support sustainable and modern farming through education and accessible tools</li>
          <li>Build a digital-first marketplace that simplifies ordering and logistics</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem', color: 'var(--primary-dark)' }}>What We Offer</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <h3 style={{ color: 'var(--primary-red)' }}>Quality Products</h3>
            <p style={{ color: 'var(--gray)' }}>Feeds, equipment, medicines, and accessories from trusted brands.</p>
          </div>
          <div>
            <h3 style={{ color: 'var(--primary-red)' }}>Fair Pricing</h3>
            <p style={{ color: 'var(--gray)' }}>Competitive rates with transparent costs for farmers and growers.</p>
          </div>
          <div>
            <h3 style={{ color: 'var(--primary-red)' }}>Reliable Delivery</h3>
            <p style={{ color: 'var(--gray)' }}>Partner couriers and efficient logistics across the Philippines.</p>
          </div>
          <div>
            <h3 style={{ color: 'var(--primary-red)' }}>Farmer Support</h3>
            <p style={{ color: 'var(--gray)' }}>Guides, tips, and assistance for every stage of your poultry journey.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem', color: 'var(--primary-dark)' }}>Meet the Team</h2>
        <p style={{ color: 'var(--gray)' }}>
          We’re a group of student developers, designers, and agriculture enthusiasts passionate
          about building tools that make real impact. This site is part of our capstone project,
          developed with a Service-Oriented Architecture and modern web technologies.
        </p>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.75rem', color: 'var(--primary-dark)' }}>Get in Touch</h2>
        <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>Questions or suggestions? We’d love to hear from you.</p>
        <button className="btn btn-primary" onClick={() => navigate('/contact')}>Contact Support</button>
      </div>
    </div>
  );
};

export default About;


