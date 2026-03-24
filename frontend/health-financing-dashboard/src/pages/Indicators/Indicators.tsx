import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChartsByTopic } from '../../config/charts';
import { getAllTopics, TopicConfig } from '../../config/topics';
import './Indicators.css';

const Indicators: React.FC = () => {
  const topics = getAllTopics();

  // Force scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="indicators-page">
      {/* Page Header */}
      <section className="indicators-header">
        <h1>Indicators Library</h1>
        <p className="header-description">
          Browse all indicators organized by 6 thematic areas. Each indicator includes detailed
          analysis, policy context, benchmarks, and country comparisons.
        </p>
      </section>

      {/* The 6 Thematic Areas */}
      <section className="themes-section">
        {topics.map((topic: TopicConfig) => {
          const topicCharts = getChartsByTopic(topic.id);
          const sortedCharts = [...topicCharts].sort((a, b) =>
            a.indicatorNumber.localeCompare(b.indicatorNumber)
          );

          return (
            <div key={topic.id} className="theme-section">
              <div
                className="theme-header"
                style={{ '--theme-color': topic.color } as React.CSSProperties}
              >
                <div className="theme-badge">
                  <span className="theme-icon">{topic.icon}</span>
                  <span className="theme-number">{topic.number}</span>
                </div>
                <div className="theme-info">
                  <h2>{topic.title}</h2>
                  <p className="theme-message">{topic.keyMessage}</p>
                  <span className="indicator-count">{sortedCharts.length} indicators</span>
                </div>
              </div>

              {sortedCharts.length > 0 && (
                <div className="indicators-grid">
                  {sortedCharts.map((chart) => (
                    <Link to={`/chart/${chart.slug}`} key={chart.id} className="indicator-card">
                      <div className="indicator-header">
                        <span className="indicator-number">{chart.indicatorNumber}</span>
                        {chart.featured && <span className="featured-badge">Featured</span>}
                      </div>
                      <h3>{chart.title}</h3>
                      <p className="indicator-subtitle">{chart.subtitle}</p>
                    </Link>
                  ))}
                </div>
              )}

              {sortedCharts.length === 0 && (
                <div className="no-indicators">
                  <p>Indicators for this theme are being developed.</p>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Indicators;
