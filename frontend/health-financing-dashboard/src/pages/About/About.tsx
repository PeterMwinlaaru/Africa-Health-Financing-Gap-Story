import React, { useEffect } from 'react';
import './About.css';

const About: React.FC = () => {
  // Force scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="about">
      <h1>About This Platform</h1>

      <section className="about-section">
        <h2>Project Overview</h2>
        <p>
          The Africa Health Financing Gap Analysis Platform provides comprehensive insights into
          health financing across African countries. This platform analyzes data from 2000-2023
          covering 54 African countries across multiple dimensions of health financing.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Developed by the <strong>United Nations Economic Commission for Africa (UN-ECA)</strong>,
          this platform supports evidence-based policy-making and tracks progress toward health
          financing targets including the Abuja Declaration and Sustainable Development Goals.
        </p>

        <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '1.125rem', color: '#1e3a8a', margin: '0 0 0.75rem 0' }}>
            Part of ECAStats Platform
          </h3>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>
            This Gap Analysis Platform is hosted on <strong>ECAStats</strong>, the United Nations Economic Commission
            for Africa's official statistics platform. It works alongside the <strong>Health Financing Dashboard</strong>
            to provide comprehensive health financing analytics for African countries.
          </p>
          <p style={{ margin: '0', fontSize: '0.875rem', color: '#64748b' }}>
            <strong>Platform Suite:</strong> Health Financing Dashboard (real-time monitoring) + Gap Analysis Platform (policy insights & benchmarks)
          </p>
        </div>
      </section>

      <section className="about-section">
        <h2>Key Features</h2>
        <ul>
          <li>Interactive dashboards with real-time data visualization</li>
          <li>Comparison of 54 African countries across 24 years (2000-2023)</li>
          <li>Analysis of multiple health financing indicator categories</li>
          <li>Regional and income-level disaggregation</li>
          <li>Tracking progress toward Abuja Declaration and international benchmarks</li>
          <li>Cross-dimensional analysis of financing and health outcomes</li>
          <li>Download capabilities for data and visualizations</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Data Source</h2>
        <p>
          <strong>All data on this platform was sourced from the WHO Global Health Expenditure Database (GHED).</strong>
        </p>
        <p style={{ marginTop: '1rem' }}>
          The WHO GHED is the most comprehensive global database on health spending, providing
          internationally comparable data on health financing. It consolidates and validates data
          from national health accounts, government budgets, and international sources using the
          System of Health Accounts 2011 (SHA 2011) framework.
        </p>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            <strong>Download Source:</strong> <a href="https://apps.who.int/nha/database/Home/IndicatorsDownload/en" target="_blank" rel="noopener noreferrer">WHO NHA Indicators Download Portal</a>
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
            Data Period: 2000-2023 | Coverage: 54 African Countries
          </p>
        </div>
      </section>

      <section className="about-section">
        <h2>Indicator Categories</h2>
        <div className="indicators-list">
          <div className="indicator-category">
            <h4>1. Public Health Financing</h4>
            <p>Adequacy of government health expenditure per capita</p>
          </div>
          <div className="indicator-category">
            <h4>2. Budget Priority</h4>
            <p>Health spending as share of government budget (Abuja Declaration)</p>
          </div>
          <div className="indicator-category">
            <h4>3. Financial Protection</h4>
            <p>Out-of-pocket expenditure and household financial hardship</p>
          </div>
          <div className="indicator-category">
            <h4>4. Financing Structure</h4>
            <p>Sources of health financing across different schemes</p>
          </div>
          <div className="indicator-category">
            <h4>5. Universal Health Coverage</h4>
            <p>UHC index and service coverage</p>
          </div>
          <div className="indicator-category">
            <h4>6. Health Outcomes</h4>
            <p>Maternal and infant mortality rates</p>
          </div>
          <div className="indicator-category">
            <h4>7-9. Cross-Dimensional Analysis</h4>
            <p>Relationships between financing and outcomes</p>
          </div>
          <div className="indicator-category">
            <h4>10. Fiscal Space</h4>
            <p>Macroeconomic constraints and investment capacity</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Methodology</h2>
        <p>
          The platform employs advanced data processing and statistical methods including:
        </p>
        <ul>
          <li>Gini coefficient calculation for inequality measurement</li>
          <li>Gap analysis against international benchmarks</li>
          <li>Time-series trend analysis</li>
          <li>Regional and income-level aggregation</li>
          <li>Cross-dimensional correlation analysis</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Contact & Support</h2>
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Platform Inquiries</h3>
          <p>
            For questions, feedback, or technical support regarding this platform:<br />
            <strong>United Nations Economic Commission for Africa (UN-ECA)</strong><br />
            Addis Ababa, Ethiopia<br />
            <a href="https://www.uneca.org" target="_blank" rel="noopener noreferrer">www.uneca.org</a>
          </p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Data Inquiries</h3>
          <p>
            For questions about the underlying health financing data:<br />
            <strong>WHO Global Health Expenditure Database</strong><br />
            World Health Organization<br />
            Email: <a href="mailto:healthaccounts@who.int">healthaccounts@who.int</a><br />
            <a href="https://apps.who.int/nha/database" target="_blank" rel="noopener noreferrer">WHO GHED Portal</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
