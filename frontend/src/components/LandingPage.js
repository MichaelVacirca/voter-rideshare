import React from 'react';
import Navbar from './Navbar';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Voter Rideshare</h1>
          <p>Connecting voters who need a ride with those who are ready to help. Let's make voting accessible for everyone.</p>
          <div className="hero-buttons">
            <a href="/register" className="btn primary">Get Started</a>
            <a href="/login" className="btn secondary">Login</a>
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
