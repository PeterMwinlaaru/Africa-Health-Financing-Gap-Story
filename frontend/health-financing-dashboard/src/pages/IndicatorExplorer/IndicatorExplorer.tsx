import React from 'react';
import './IndicatorExplorer.css';

const IndicatorExplorer: React.FC = () => {
  return (
    <div className="indicatorexplorer">
      <h1>Indicator Explorer</h1>
      <p>Deep dive into specific health financing indicators across countries and time.</p>
      <div className="coming-soon">
        <h2>Coming Soon</h2>
        <ul>
          <li>All 10 indicator categories from the specification</li>
          <li>Interactive indicator selection</li>
          <li>Cross-country comparisons</li>
          <li>Gini coefficients and inequality measures</li>
          <li>Gap analysis visualizations</li>
          <li>Correlation analysis between indicators</li>
        </ul>
      </div>
    </div>
  );
};

export default IndicatorExplorer;
