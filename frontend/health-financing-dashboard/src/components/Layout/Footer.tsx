import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="owid-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About</h4>
          <Link to="/about">About this project</Link>
          <Link to="/sources">Data sources</Link>
        </div>
        <div className="footer-section">
          <h4>Explore</h4>
          <Link to="/charts">All charts</Link>
          <Link to="/explorer">Data Explorer</Link>
          <Link to="/cross-dimensional">Cross-Dimensional</Link>
        </div>
        <div className="footer-section">
          <h4>ECAStats Platform</h4>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Part of UN-ECA's official statistics platform
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
            Health Financing Dashboard + Gap Analysis
          </p>
        </div>
        <div className="footer-section">
          <h4>About UN-ECA</h4>
          <p>United Nations Economic Commission for Africa</p>
          <p>Addis Ababa, Ethiopia</p>
          <a href="https://www.uneca.org" target="_blank" rel="noopener noreferrer">www.uneca.org</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 United Nations Economic Commission for Africa (ECA). All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Health Financing Gap Analysis Platform | Data period: 2000-2023
        </p>
      </div>
    </footer>
  );
};

export default Footer;
