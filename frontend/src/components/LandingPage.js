import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">Voter Rideshare</div>
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Voter Rideshare</h1>
          <p>Connecting voters who need a ride with those who are ready to help. Let's make voting accessible for everyone.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn primary">Get Started</Link>
            <Link to="/login" className="btn secondary">Login</Link>
          </div>
        </div>
      </header>

      <footer className="footer">
        <p>&copy; 2024 Voter Rideshare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
