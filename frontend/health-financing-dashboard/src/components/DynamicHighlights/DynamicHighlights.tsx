import React from 'react';
import './DynamicHighlights.css';

interface HighlightData {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

interface DynamicHighlightsProps {
  highlights: HighlightData[];
  title?: string;
}

const DynamicHighlights: React.FC<DynamicHighlightsProps> = ({ highlights, title }) => {
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (!trend) return null;
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'neutral': return '→';
      default: return null;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    if (!trend) return '';
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      case 'neutral': return 'trend-neutral';
      default: return '';
    }
  };

  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="dynamic-highlights">
      {title && <h3 className="highlights-title">{title}</h3>}
      <div className="highlights-grid">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className={`highlight-card ${highlight.highlight ? 'highlight-featured' : ''} ${getTrendColor(highlight.trend)}`}
          >
            <div className="highlight-label">{highlight.label}</div>
            <div className="highlight-value">
              {highlight.value}
              {highlight.trend && (
                <span className="trend-icon">{getTrendIcon(highlight.trend)}</span>
              )}
            </div>
            {highlight.subtext && (
              <div className="highlight-subtext">{highlight.subtext}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicHighlights;
