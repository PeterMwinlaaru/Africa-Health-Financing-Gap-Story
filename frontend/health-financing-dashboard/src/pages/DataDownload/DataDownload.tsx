import React from 'react';
import './DataDownload.css';

const DataDownload: React.FC = () => {
  return (
    <div className="datadownload">
      <h1>Data Download</h1>
      <p>Download processed health financing data in various formats.</p>
      <div className="coming-soon">
        <h2>Coming Soon</h2>
        <ul>
          <li>CSV export with custom filtering</li>
          <li>Excel export with multiple sheets</li>
          <li>JSON API access</li>
          <li>Filter by country, year, region, and income level</li>
          <li>Select specific indicators to download</li>
          <li>Bulk download options</li>
        </ul>
      </div>
    </div>
  );
};

export default DataDownload;
