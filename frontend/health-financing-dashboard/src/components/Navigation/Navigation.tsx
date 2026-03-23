import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/countries', label: 'Country Explorer', icon: '🌍' },
    { path: '/indicators', label: 'Indicators', icon: '📈' },
    { path: '/download', label: 'Data Download', icon: '💾' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1 className="nav-title">Africa Health Financing Gap</h1>
        <p className="nav-subtitle">2023 Context, Gaps and Outcomes</p>
      </div>
      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
