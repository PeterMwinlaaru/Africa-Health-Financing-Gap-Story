import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopicBySlug, TopicConfig } from '../../config/topics';
import { getChartsByTopic, ChartConfig } from '../../config/charts';
import InlineChart from '../../components/InlineChart/InlineChart';
import './TopicPage.css';

const TopicPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const topicSlug = decodeURIComponent(category || '');
  const topic: TopicConfig | undefined = getTopicBySlug(topicSlug);
  const charts: ChartConfig[] = topic ? getChartsByTopic(topic.id) : [];

  // Force scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Sort charts by indicator number
  const sortedCharts = [...charts].sort((a, b) =>
    a.indicatorNumber.localeCompare(b.indicatorNumber)
  );

  if (!topic) {
    return (
      <div className="topic-page">
        <div className="topic-not-found">
          <h1>Topic Not Found</h1>
          <p>The requested topic could not be found.</p>
          <Link to="/" className="back-link">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="separator">/</span>
        <span className="current">{topic.shortTitle}</span>
      </nav>

      {/* Topic Header */}
      <header className="topic-header" style={{ '--topic-color': topic.color } as React.CSSProperties}>
        <div className="topic-badge">
          <span className="topic-number">{topic.number}</span>
          <span className="topic-icon">{topic.icon}</span>
        </div>
        <h1>{topic.title}</h1>
        <p className="topic-description">{topic.description}</p>
        <div className="key-finding-box">
          <span className="key-finding-label">Key Finding</span>
          <p>{topic.keyMessage}</p>
        </div>
      </header>

      {/* Table of Contents */}
      {sortedCharts.length > 0 && (
        <nav className="indicator-toc">
          <h2>Indicators in this section</h2>
          <ul>
            {sortedCharts.map(chart => (
              <li key={chart.id}>
                <a href={`#indicator-${chart.indicatorNumber.replace(/\./g, '-')}`}>
                  <span className="toc-number">{chart.indicatorNumber}</span>
                  <span className="toc-title">{chart.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Indicators with Charts Inline */}
      <section className="indicators-section">
        {sortedCharts.map((chart, index) => (
          <article
            key={chart.id}
            id={`indicator-${chart.indicatorNumber.replace(/\./g, '-')}`}
            className="indicator-article"
            style={{ '--topic-color': topic.color } as React.CSSProperties}
          >
            {/* Indicator Header */}
            <div className="indicator-header">
              <span className="indicator-number">{chart.indicatorNumber}</span>
              <span className="chart-type-badge">{chart.chartType} chart</span>
            </div>

            <h2 className="indicator-title">{chart.title}</h2>
            <p className="indicator-subtitle">{chart.subtitle}</p>

            {/* Chart - Displayed Inline */}
            <div className="chart-container">
              <InlineChart config={chart} topicColor={topic.color} />
            </div>

            {/* Narrative - What you should know */}
            <div className="narrative-section">
              <h3>What you should know</h3>
              <div className="narrative-content">
                {chart.narrative.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="insights-section">
              <h3>Key Insights</h3>
              <ul className="insights-list">
                {chart.insights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>

            {/* Methodology */}
            <div className="methodology-section">
              <h3>Methodology</h3>
              <div className="methodology-content">
                {chart.methodology.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Data Sources for this indicator */}
            <div className="indicator-sources">
              <h4>Data Sources</h4>
              <div className="sources-list">
                {chart.sources.map((source, idx) => (
                  <div key={idx} className="source-item">
                    <strong>{source.name}</strong>
                    <span>{source.description}</span>
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        Visit source →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider between indicators */}
            {index < sortedCharts.length - 1 && <hr className="indicator-divider" />}
          </article>
        ))}
      </section>

      {/* Empty State */}
      {charts.length === 0 && (
        <section className="empty-section">
          <p>No indicators available for this topic yet.</p>
          <p>Indicators for this topic are being developed. Check back soon.</p>
        </section>
      )}

      {/* Back Navigation */}
      <nav className="back-navigation">
        <Link to="/" className="back-link">← Back to All Themes</Link>
      </nav>
    </div>
  );
};

export default TopicPage;
