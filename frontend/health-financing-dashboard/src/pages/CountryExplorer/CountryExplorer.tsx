import React from 'react';
import './CountryExplorer.css';

const CountryExplorer: React.FC = () => {
  return (
    <div className="country-explorer">
      <h1>Country Explorer</h1>
      <p>Compare countries side-by-side and explore individual country profiles.</p>
      <div className="coming-soon">
        <h2>Coming Soon</h2>
        <ul>
          <li>Interactive country comparison</li>
          <li>Detailed country profiles</li>
          <li>Multi-country selection</li>
          <li>Country-specific indicator deep dives</li>
        </ul>
      </div>
    </div>
  );
};

export default CountryExplorer;
