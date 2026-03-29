import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="owid-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <div className="logo-container">
            <img
              src="/eca-logo.png"
              alt="UN-ECA Logo"
              className="eca-logo"
              onError={(e) => {
                // Hide image if logo file not found
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="logo-text">
              <h1>Africa Health Financing Gap and Investment Analysis</h1>
              <p className="tagline">United Nations Economic Commission for Africa (ECA)</p>
            </div>
          </div>
        </Link>
        <nav className="main-nav">
          <Link to="/charts">Charts</Link>
          <Link to="/explorer">Data Explorer</Link>
          <Link to="/cross-dimensional">Cross-Dimensional</Link>
          <Link to="/about">About</Link>
          <Link to="/sources">Sources</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
