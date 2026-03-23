import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Home.css';

const Home: React.FC = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [currentFindingIndex, setCurrentFindingIndex] = useState<number>(0);

  // Key findings that rotate
  const keyFindings = [
    {
      icon: '📊',
      title: 'Abuja Declaration Failure',
      text: 'As of 2023, only 1 of 54 African countries meets the Abuja Declaration target of 15% budget allocation to health, while 51 countries fall short of minimum health expenditure thresholds.'
    },
    {
      icon: '⚠️',
      title: 'Financing Gap Crisis',
      text: 'As of 2023, only 3 of 54 countries meet minimum spending thresholds. Low-income countries average $8.92 per capita - 92% below the $112 target.'
    },
    {
      icon: '🏥',
      title: 'Financial Protection Emergency',
      text: 'In 2023, 76% of African countries exceed the 20% out-of-pocket safety threshold, pushing millions into poverty through healthcare costs.'
    },
    {
      icon: '🌍',
      title: 'Unsustainable Dependency',
      text: 'External health financing more than doubled since 2000 (10.67% → 23.36%). In 2023, 16 countries are critically dependent with over 50% external financing.'
    }
  ];

  useEffect(() => {
    api.getCountries()
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to load countries:', err));
  }, []);

  // Auto-rotate findings every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFindingIndex((prevIndex) =>
        (prevIndex + 1) % keyFindings.length
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [keyFindings.length]);

  const handleCountrySelect = () => {
    if (selectedCountry) {
      window.location.href = `/explorer?country=${encodeURIComponent(selectedCountry)}`;
    }
  };

  const handlePreviousFinding = () => {
    setCurrentFindingIndex((prevIndex) =>
      prevIndex === 0 ? keyFindings.length - 1 : prevIndex - 1
    );
  };

  const handleNextFinding = () => {
    setCurrentFindingIndex((prevIndex) =>
      (prevIndex + 1) % keyFindings.length
    );
  };

  const handleDotClick = (index: number) => {
    setCurrentFindingIndex(index);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section-main">
        <div className="hero-content-main">
          <span className="hero-label">UN Economic Commission for Africa</span>
          <h1>Africa's Health Financing Gap</h1>
          <p className="hero-description">
            Evidence-based platform for policymakers to track progress, compare countries,
            and explore the data behind health financing across 54 African nations
          </p>
          <div className="hero-stats-grid">
            <div className="hero-stat-box">
              <span className="stat-number">54</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="hero-stat-box">
              <span className="stat-number">23</span>
              <span className="stat-label">Years of Data</span>
            </div>
            <div className="hero-stat-box">
              <span className="stat-number">1,350</span>
              <span className="stat-label">Data Points</span>
            </div>
            <div className="hero-stat-box">
              <span className="stat-number">WHO</span>
              <span className="stat-label">GHED Source</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Findings Carousel */}
      <section className="insight-banner">
        <button className="carousel-nav prev" onClick={handlePreviousFinding} aria-label="Previous finding">
          ‹
        </button>
        <div className="insight-icon">{keyFindings[currentFindingIndex].icon}</div>
        <div className="insight-content">
          <h3>{keyFindings[currentFindingIndex].title}</h3>
          <p>{keyFindings[currentFindingIndex].text}</p>
          <div className="carousel-indicators">
            {keyFindings.map((_, index) => (
              <button
                key={index}
                className={`indicator-dot ${index === currentFindingIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to finding ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <button className="carousel-nav next" onClick={handleNextFinding} aria-label="Next finding">
          ›
        </button>
      </section>

      {/* Quick Country Lookup */}
      <section className="quick-lookup-section">
        <h2>Quick Country Data Lookup</h2>
        <p>Select a country to view its health financing trends and indicators</p>
        <div className="country-lookup-box">
          <select
            className="country-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">Select a country...</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <button
            className="lookup-button"
            onClick={handleCountrySelect}
            disabled={!selectedCountry}
          >
            View Data →
          </button>
        </div>
      </section>

      {/* Three Main Tools */}
      <section className="main-tools-section">
        <h2>Explore the Platform</h2>
        <p className="tools-intro">Three powerful ways to analyze Africa's health financing data</p>

        <div className="tools-grid-main">
          {/* Indicators Library */}
          <Link to="/indicators" className="tool-card-main">
            <div className="tool-icon-large">📚</div>
            <h3>Indicators Library</h3>
            <p className="tool-description">
              Browse all indicators organized by theme. Each indicator includes detailed
              analysis, policy context, benchmarks, and country comparisons.
            </p>
            <ul className="tool-features">
              <li>6 thematic areas</li>
              <li>Detailed context</li>
              <li>Benchmark comparisons</li>
              <li>Policy insights</li>
            </ul>
            <span className="tool-cta">Browse All Indicators →</span>
          </Link>

          {/* Cross-Dimensional Analysis */}
          <Link to="/cross-dimensional" className="tool-card-main highlighted">
            <div className="tool-badge">Popular</div>
            <div className="tool-icon-large">🔍</div>
            <h3>Cross-Dimensional Analysis</h3>
            <p className="tool-description">
              Explore relationships between indicators. See how government spending
              correlates with health outcomes, analyze financing structures, and discover patterns.
            </p>
            <ul className="tool-features">
              <li>Correlation analysis</li>
              <li>Scatter plot visualization</li>
              <li>Pattern discovery</li>
              <li>Multi-indicator insights</li>
            </ul>
            <span className="tool-cta">Analyze Relationships →</span>
          </Link>

          {/* Data Explorer */}
          <Link to="/explorer" className="tool-card-main">
            <div className="tool-icon-large">📈</div>
            <h3>Data Explorer</h3>
            <p className="tool-description">
              Visualize trends over time, compare multiple countries side-by-side,
              filter by year ranges, and export charts and datasets for your reports.
            </p>
            <ul className="tool-features">
              <li>Time series visualization</li>
              <li>Multi-country comparison</li>
              <li>Advanced filtering</li>
              <li>Export data & charts</li>
            </ul>
            <span className="tool-cta">Launch Explorer →</span>
          </Link>
        </div>
      </section>

      {/* Critical Statistics for Policymakers */}
      <section className="critical-stats-section">
        <h2>Critical Statistics at a Glance (2023)</h2>
        <div className="stats-grid">
          <div className="stat-card red">
            <div className="stat-card-header">
              <span className="stat-icon">⚠️</span>
              <span className="stat-category">Financing Gap</span>
            </div>
            <div className="stat-value">51 of 54</div>
            <div className="stat-label">Countries below minimum expenditure threshold</div>
            <div className="stat-detail">Only 5.6% meet WHO benchmarks (2023)</div>
          </div>

          <div className="stat-card orange">
            <div className="stat-card-header">
              <span className="stat-icon">💰</span>
              <span className="stat-category">Budget Allocation</span>
            </div>
            <div className="stat-value">7.07%</div>
            <div className="stat-label">Average budget share to health (2023)</div>
            <div className="stat-detail">Half the Abuja 15% target</div>
          </div>

          <div className="stat-card purple">
            <div className="stat-card-header">
              <span className="stat-icon">🏥</span>
              <span className="stat-category">Out-of-Pocket</span>
            </div>
            <div className="stat-value">35.5%</div>
            <div className="stat-label">Household spending on health (2023)</div>
            <div className="stat-detail">41 countries above 20% protection threshold</div>
          </div>

          <div className="stat-card cyan">
            <div className="stat-card-header">
              <span className="stat-icon">🌍</span>
              <span className="stat-category">External Dependency</span>
            </div>
            <div className="stat-value">23.36%</div>
            <div className="stat-label">External health financing share (2023)</div>
            <div className="stat-detail">Doubled since 2000 (10.67%)</div>
          </div>
        </div>
      </section>

      {/* Key Benchmarks */}
      <section className="benchmarks-section-compact">
        <h2>Key International Benchmarks</h2>
        <div className="benchmarks-grid-compact">
          <div className="benchmark-box">
            <h4>Abuja Declaration</h4>
            <div className="benchmark-value-main">≥ 15%</div>
            <p>of budget to health</p>
          </div>
          <div className="benchmark-box">
            <h4>WHO GDP Target</h4>
            <div className="benchmark-value-main">≥ 5%</div>
            <p>of GDP to health</p>
          </div>
          <div className="benchmark-box">
            <h4>Financial Protection</h4>
            <div className="benchmark-value-main">≤ 20%</div>
            <p>out-of-pocket spending</p>
          </div>
          <div className="benchmark-box">
            <h4>External Dependency</h4>
            <div className="benchmark-value-main">≤ 22.5%</div>
            <p>external financing</p>
          </div>
          <div className="benchmark-box">
            <h4>UHC Coverage</h4>
            <div className="benchmark-value-main">≥ 75</div>
            <p>service coverage index</p>
          </div>
          <div className="benchmark-box">
            <h4>Maternal Mortality</h4>
            <div className="benchmark-value-main">&lt; 70</div>
            <p>per 100,000 births</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <h2>Ready to Explore the Evidence?</h2>
        <p>Start analyzing Africa's health financing data with our interactive tools</p>
        <div className="cta-buttons-footer">
          <Link to="/explorer" className="cta-btn primary">Launch Data Explorer</Link>
          <Link to="/cross-dimensional" className="cta-btn secondary">Analyze Relationships</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
