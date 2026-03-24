import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CHART_CONFIGS, getChartsByTopic } from '../../config/charts';
import { getAllTopics, getTopicById } from '../../config/topics';
import './ChartLibrary.css';

const ChartLibrary: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const topics = getAllTopics();

  // Force scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const filteredCharts = selectedTopic === 'all'
    ? CHART_CONFIGS
    : getChartsByTopic(selectedTopic);

  // Helper to get topic display name
  const getTopicName = (topicId: string): string => {
    const topic = getTopicById(topicId);
    return topic ? topic.shortTitle : topicId;
  };

  return (
    <div className="chart-library-page">
      <div className="page-header">
        <h1>All Charts</h1>
        <p>Browse {CHART_CONFIGS.length} interactive charts on health financing in Africa</p>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Filter by theme:</label>
          <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
            <option value="all">All Themes ({CHART_CONFIGS.length} charts)</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>
                {topic.number} - {topic.shortTitle} ({getChartsByTopic(topic.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="charts-grid">
        {filteredCharts.map((chart) => (
          <Link to={`/chart/${chart.slug}`} key={chart.id} className="chart-card">
            <div className="chart-card-top">
              <span className="category-badge" data-theme={chart.topicId}>
                {getTopicName(chart.topicId)}
              </span>
              <span className="indicator-badge">{chart.indicatorNumber}</span>
            </div>
            <h3>{chart.title}</h3>
            <p>{chart.subtitle}</p>
            <div className="chart-meta">
              <span className="chart-type">{chart.chartType}</span>
              {chart.featured && <span className="featured-badge">Featured</span>}
            </div>
          </Link>
        ))}
      </div>

      {filteredCharts.length === 0 && (
        <div className="no-results">
          <p>No charts found for this filter.</p>
        </div>
      )}
    </div>
  );
};

export default ChartLibrary;
