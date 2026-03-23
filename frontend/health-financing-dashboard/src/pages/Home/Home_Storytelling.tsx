import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChartsByTopic } from '../../config/charts';
import { getAllTopics, TopicConfig } from '../../config/topics';
import api from '../../services/api';
import './Home.css';

const Home: React.FC = () => {
  const topics = getAllTopics();
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    api.getCountries().then(setCountries).catch(console.error);
  }, []);

  const handleCountrySelect = (country: string) => {
    if (country) {
      // Navigate to Data Explorer with country pre-selected
      window.location.href = `/explorer?country=${encodeURIComponent(country)}`;
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section - Storytelling Opening */}
      <section className="hero-section-story">
        <div className="hero-content">
          <span className="hero-label">United Nations Economic Commission for Africa</span>
          <h1>Closing Africa's Health Financing Gap</h1>
          <p className="hero-narrative">
            Two decades after the Abuja Declaration, Africa's journey toward sustainable
            health financing reveals a story of progress, persistent challenges, and
            untapped potential. This platform presents the evidence policymakers need
            to transform health financing across the continent.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">54</span>
              <span className="stat-label">Countries Tracked</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">23</span>
              <span className="stat-label">Years of Data</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">2023</span>
              <span className="stat-label">Latest Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge - Problem Framing */}
      <section className="story-section challenge-section">
        <div className="section-header">
          <span className="section-label">The Challenge</span>
          <h2>A Critical Financing Gap Threatens Health Progress</h2>
        </div>

        <div className="challenge-grid">
          <div className="challenge-card critical">
            <div className="challenge-number">51 of 54</div>
            <div className="challenge-text">
              <strong>countries fall short</strong> of minimum government health
              spending thresholds for their income level
            </div>
            <span className="challenge-stat">Only 5.6% compliance</span>
          </div>

          <div className="challenge-card warning">
            <div className="challenge-number">53 of 54</div>
            <div className="challenge-text">
              <strong>countries miss</strong> the Abuja Declaration target of
              15% budget allocation to health
            </div>
            <span className="challenge-stat">South Africa alone meets target</span>
          </div>

          <div className="challenge-card concern">
            <div className="challenge-number">$75.04</div>
            <div className="challenge-text">
              <strong>average gap</strong> between current spending and minimum
              thresholds per capita
            </div>
            <span className="challenge-stat">106% shortfall on average</span>
          </div>

          <div className="challenge-card risk">
            <div className="challenge-number">35.5%</div>
            <div className="challenge-text">
              <strong>out-of-pocket</strong> payments push families into poverty
              and limit access to care
            </div>
            <span className="challenge-stat">Far above 20% protection threshold</span>
          </div>
        </div>
      </section>

      {/* Country Quick Access */}
      <section className="country-lookup-section">
        <div className="lookup-content">
          <h3>Where Does Your Country Stand?</h3>
          <p>Access detailed health financing data and insights for your country</p>
          <div className="country-selector-large">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="country-select-dropdown"
            >
              <option value="">Select a country...</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <button
              onClick={() => handleCountrySelect(selectedCountry)}
              disabled={!selectedCountry}
              className="country-select-button"
            >
              View Country Data →
            </button>
          </div>
        </div>
      </section>

      {/* The Story in Four Chapters */}
      <section className="story-chapters-section">
        <div className="section-header">
          <span className="section-label">Explore the Evidence</span>
          <h2>Four Chapters of Africa's Health Financing Story</h2>
          <p className="section-intro">
            Navigate through comprehensive analysis organized around key policy questions
          </p>
        </div>

        <div className="chapters-grid">
          {/* Chapter 1: The Gap */}
          <div className="chapter-card">
            <div className="chapter-number">Chapter 1</div>
            <h3>How Far Are We From Targets?</h3>
            <p className="chapter-description">
              Measure the financing gap across government spending, budget priorities,
              and GDP allocation. Understand where your country stands against
              international benchmarks.
            </p>
            <div className="chapter-topics">
              <span className="topic-tag">Public Health Financing</span>
              <span className="topic-tag">Budget Priority</span>
              <span className="topic-tag">GDP Share</span>
            </div>
            <Link to="/topics/public-health-financing" className="chapter-link">
              Explore Financing Gaps →
            </Link>
          </div>

          {/* Chapter 2: Financial Protection */}
          <div className="chapter-card">
            <div className="chapter-number">Chapter 2</div>
            <h3>Are Households Protected?</h3>
            <p className="chapter-description">
              Analyze out-of-pocket spending, financial hardship, and the structure
              of health financing. See which countries protect citizens from
              catastrophic health costs.
            </p>
            <div className="chapter-topics">
              <span className="topic-tag">Financial Protection</span>
              <span className="topic-tag">Financing Structure</span>
              <span className="topic-tag">External Dependency</span>
            </div>
            <Link to="/topics/financial-protection" className="chapter-link">
              Explore Financial Protection →
            </Link>
          </div>

          {/* Chapter 3: Coverage & Outcomes */}
          <div className="chapter-card">
            <div className="chapter-number">Chapter 3</div>
            <h3>What Are We Achieving?</h3>
            <p className="description">
              Connect financing to results through UHC service coverage, maternal
              mortality, and neonatal mortality. See how investment translates
              to health outcomes.
            </p>
            <div className="chapter-topics">
              <span className="topic-tag">UHC Coverage</span>
              <span className="topic-tag">Health Outcomes</span>
              <span className="topic-tag">SDG Progress</span>
            </div>
            <Link to="/topics/uhc" className="chapter-link">
              Explore Coverage & Outcomes →
            </Link>
          </div>

          {/* Chapter 4: Solutions */}
          <div className="chapter-card highlight">
            <div className="chapter-number">Chapter 4</div>
            <h3>What Works and What's Needed?</h3>
            <p className="chapter-description">
              Discover success stories, policy insights, and evidence-based
              recommendations. Learn from countries making progress and identify
              priorities for action.
            </p>
            <div className="chapter-topics">
              <span className="topic-tag">Policy Insights</span>
              <span className="topic-tag">Best Practices</span>
              <span className="topic-tag">Fiscal Space</span>
            </div>
            <Link to="/topics/fiscal-space" className="chapter-link">
              Explore Solutions →
            </Link>
          </div>
        </div>
      </section>

      {/* Bright Spots - What Works */}
      <section className="bright-spots-section">
        <div className="section-header">
          <span className="section-label">What Works</span>
          <h2>Success Stories Across the Continent</h2>
        </div>

        <div className="bright-spots-grid">
          <div className="bright-spot-card">
            <div className="bright-spot-flag">🇿🇦</div>
            <h4>South Africa</h4>
            <p className="bright-spot-achievement">Only country meeting Abuja Declaration</p>
            <div className="bright-spot-metric">
              <span className="metric-value">16.9%</span>
              <span className="metric-label">of budget to health</span>
            </div>
          </div>

          <div className="bright-spot-card">
            <div className="bright-spot-flag">🇹🇳</div>
            <h4>Tunisia</h4>
            <p className="bright-spot-achievement">Exceeds income-level spending threshold</p>
            <div className="bright-spot-metric">
              <span className="metric-value">$171.84</span>
              <span className="metric-label">per capita (vs $146 target)</span>
            </div>
          </div>

          <div className="bright-spot-card">
            <div className="bright-spot-flag">🇸🇨</div>
            <h4>Seychelles</h4>
            <p className="bright-spot-achievement">Highest government health spending</p>
            <div className="bright-spot-metric">
              <span className="metric-value">$538.46</span>
              <span className="metric-label">per capita</span>
            </div>
          </div>

          <div className="bright-spot-card">
            <div className="bright-spot-flag">🇲🇦</div>
            <h4>Morocco</h4>
            <p className="bright-spot-achievement">Within 10% of meeting threshold</p>
            <div className="bright-spot-metric">
              <span className="metric-value">10.1%</span>
              <span className="metric-label">below target (closest to breakthrough)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Policy Priorities */}
      <section className="priorities-section">
        <div className="section-header">
          <span className="section-label">Evidence-Based Priorities</span>
          <h2>Five Actions for Policymakers</h2>
        </div>

        <div className="priorities-list">
          <div className="priority-item">
            <div className="priority-number">1</div>
            <div className="priority-content">
              <h4>Increase Domestic Resource Mobilization</h4>
              <p>
                Continental average of $70.96 per capita is 51% below minimum thresholds.
                Low-income countries averaging just $8.92 need 12× increase to reach $112 target.
              </p>
              <Link to="/chart/government-health-expenditure-per-capita" className="priority-link">
                View detailed analysis →
              </Link>
            </div>
          </div>

          <div className="priority-item">
            <div className="priority-number">2</div>
            <div className="priority-content">
              <h4>Prioritize Health in National Budgets</h4>
              <p>
                At 7.07% average, most countries need to double health budget allocation
                to approach the 15% Abuja target. 25 countries show improvement trends.
              </p>
              <Link to="/chart/government-health-budget-share" className="priority-link">
                View detailed analysis →
              </Link>
            </div>
          </div>

          <div className="priority-item">
            <div className="priority-number">3</div>
            <div className="priority-content">
              <h4>Strengthen Financial Protection</h4>
              <p>
                Out-of-pocket payments at 35.5% force families to choose between health
                and other essentials. Only 13 countries achieve the 20% protection benchmark.
              </p>
              <Link to="/chart/out-of-pocket-share" className="priority-link">
                View detailed analysis →
              </Link>
            </div>
          </div>

          <div className="priority-item">
            <div className="priority-number">4</div>
            <div className="priority-content">
              <h4>Reduce External Dependency</h4>
              <p>
                External financing more than doubled since 2000 (10.67% → 23.36%).
                16 countries critically dependent (&gt;50%) face sustainability risks.
              </p>
              <Link to="/chart/external-health-financing-share" className="priority-link">
                View detailed analysis →
              </Link>
            </div>
          </div>

          <div className="priority-item">
            <div className="priority-number">5</div>
            <div className="priority-content">
              <h4>Accelerate Progress Toward UHC</h4>
              <p>
                Continental UHC index of 51.9 reflects gaps in service coverage.
                Link financing increases to measurable improvements in health outcomes.
              </p>
              <Link to="/chart/uhc-service-coverage-index" className="priority-link">
                View detailed analysis →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Tools */}
      <section className="tools-section">
        <div className="section-header">
          <span className="section-label">Platform Tools</span>
          <h2>Three Ways to Explore the Data</h2>
        </div>

        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-icon">📊</div>
            <h3>Data Explorer</h3>
            <p>
              Visualize trends over time, compare countries, filter by region and
              income level. Export data and charts for reports and presentations.
            </p>
            <Link to="/explorer" className="tool-button">
              Open Data Explorer →
            </Link>
          </div>

          <div className="tool-card">
            <div className="tool-icon">🔍</div>
            <h3>Cross-Dimensional Analysis</h3>
            <p>
              Explore relationships between indicators. Correlate spending with outcomes,
              compare financing structures, identify patterns across regions.
            </p>
            <Link to="/cross-dimensional" className="tool-button">
              Open Analysis Tool →
            </Link>
          </div>

          <div className="tool-card">
            <div className="tool-icon">📖</div>
            <h3>Indicator Deep Dives</h3>
            <p>
              Access detailed analysis for each indicator with policy-relevant insights,
              interactive charts, geographic maps, and evidence-based recommendations.
            </p>
            <div className="tool-topics-preview">
              {topics.slice(0, 6).map(topic => (
                <Link
                  key={topic.id}
                  to={`/topics/${topic.id}`}
                  className="topic-chip"
                  style={{ '--topic-color': topic.color } as React.CSSProperties}
                >
                  {topic.icon} {topic.shortTitle}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Credibility */}
      <section className="credibility-section">
        <div className="credibility-content">
          <div className="credibility-left">
            <h3>Trusted, Authoritative Data</h3>
            <p>
              All indicators sourced from the WHO Global Health Expenditure Database (GHED),
              the world's most comprehensive source of health financing data. Thresholds
              based on WHO, African Union, and peer-reviewed research.
            </p>
            <Link to="/sources" className="sources-link">
              View detailed methodology & sources →
            </Link>
          </div>
          <div className="credibility-right">
            <div className="credibility-badges">
              <div className="cred-badge">
                <strong>54</strong>
                <span>African Countries</span>
              </div>
              <div className="cred-badge">
                <strong>2000-2023</strong>
                <span>Time Period</span>
              </div>
              <div className="cred-badge">
                <strong>1,350</strong>
                <span>Data Points</span>
              </div>
              <div className="cred-badge">
                <strong>WHO GHED</strong>
                <span>Primary Source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Explore the Evidence?</h2>
          <p>
            Start with your country's data or dive into continental trends.
            Every chart, insight, and recommendation is designed to inform policy action.
          </p>
          <div className="cta-buttons">
            <Link to="/explorer" className="cta-button primary">
              Start Exploring Data
            </Link>
            <Link to="/about" className="cta-button secondary">
              Learn More About This Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
