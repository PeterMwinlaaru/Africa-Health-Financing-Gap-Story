import React from 'react';
import './Sources.css';

const Sources: React.FC = () => {
  return (
    <div className="sources-page">
      <h1>Data Sources</h1>

      <div className="source-section">
        <h2>Data Source</h2>
        <div className="source-item">
          <h3>WHO Global Health Expenditure Database (GHED)</h3>
          <p><strong>All data on this platform was sourced from the WHO Global Health Expenditure Database.</strong> This includes all health financing indicators, government health expenditure, out-of-pocket payments, external financing, health expenditure breakdowns, UHC coverage indicators, and health outcome indicators.</p>
          <p><strong>Data Period:</strong> 2000-2023 (24 years of data)</p>
          <p><strong>Geographic Coverage:</strong> 54 African countries</p>
          <p><strong>Data Collection Method:</strong> Downloaded from WHO GHED using the bulk data download feature</p>
          <p><strong>Indicators Included:</strong></p>
          <ul style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            <li>Government health expenditure (per capita, % of GDP, % of government budget)</li>
            <li>Total health expenditure (per capita, % of GDP)</li>
            <li>Out-of-pocket health spending (% of current health expenditure)</li>
            <li>External health expenditure (% of current health expenditure)</li>
            <li>Domestic private health expenditure</li>
            <li>Voluntary health insurance and prepayments</li>
            <li>UHC service coverage index</li>
            <li>Maternal and neonatal mortality indicators</li>
            <li>All financing structure breakdowns</li>
          </ul>
          <div style={{ marginTop: '1rem' }}>
            <a href="https://apps.who.int/nha/database/Home/IndicatorsDownload/en" target="_blank" rel="noopener noreferrer" style={{ marginRight: '1rem' }}>Download Data →</a>
            <a href="https://apps.who.int/nha/database" target="_blank" rel="noopener noreferrer">Browse Database →</a>
          </div>
        </div>
      </div>

      <div className="source-section">
        <h2>About WHO Global Health Expenditure Database</h2>
        <p>The WHO Global Health Expenditure Database (GHED) is the most comprehensive global database on health spending. It tracks public and private health expenditures in countries worldwide and provides internationally comparable data on health financing.</p>

        <div className="source-item">
          <h3>What WHO GHED Includes</h3>
          <p>WHO GHED consolidates health financing data from multiple original sources into a single, standardized database:</p>
          <ul>
            <li><strong>National Health Accounts:</strong> Official government health expenditure reports</li>
            <li><strong>Government Budget Documents:</strong> Ministry of Finance and Health budget data</li>
            <li><strong>International Financial Institutions:</strong> IMF, World Bank economic data used in calculations</li>
            <li><strong>WHO Country Offices:</strong> Ground-level validation and data collection</li>
            <li><strong>UN Statistical Division:</strong> Population and demographic data for per capita calculations</li>
            <li><strong>WHO Programs:</strong> UHC monitoring, health outcomes, SDG indicators</li>
          </ul>
          <p style={{ marginTop: '1rem' }}><strong>Note:</strong> While WHO GHED integrates data from these various sources, users of this platform download all data directly from WHO GHED as a single, unified dataset.</p>
        </div>
      </div>

      <div className="source-section">
        <h2>Data Access & Download</h2>
        <p>The health financing data displayed on this platform was downloaded from the <strong>WHO Global Health Expenditure Database</strong> using their bulk data download feature.</p>

        <div className="data-access-info">
          <h3>How to Access the Data</h3>
          <ol>
            <li>Visit the <a href="https://apps.who.int/nha/database/Home/IndicatorsDownload/en" target="_blank" rel="noopener noreferrer">WHO NHA Indicators Download page</a></li>
            <li>Select your desired indicators, countries, and time period</li>
            <li>Download the data in CSV, Excel, or other formats</li>
            <li>The data is freely available and updated regularly by WHO</li>
          </ol>

          <h3>Data Processing</h3>
          <p>The downloaded WHO data has been processed and structured for this platform to enable:</p>
          <ul>
            <li>Interactive visualizations and trend analysis</li>
            <li>Cross-country and cross-indicator comparisons</li>
            <li>Policy benchmark tracking (Abuja Declaration, SDG targets)</li>
            <li>Regional and income group aggregations</li>
          </ul>
        </div>
      </div>

      <div className="source-section">
        <h2>Methodology & Standards</h2>

        <div className="methodology-info">
          <h3>Health Accounting Framework</h3>
          <p>All health financing indicators follow the <strong>System of Health Accounts 2011 (SHA 2011)</strong> framework, which is the international standard for health expenditure tracking developed by WHO, OECD, and Eurostat.</p>

          <h3>Data Collection & Validation</h3>
          <p>WHO collects health expenditure data through:</p>
          <ul>
            <li>National Health Accounts (NHA) reports submitted by countries</li>
            <li>Government budget documents and financial reports</li>
            <li>International databases (IMF, World Bank, OECD)</li>
            <li>WHO country offices and technical support</li>
          </ul>
          <p>All data undergoes validation and quality checks by WHO technical teams before publication.</p>

          <h3>Calculation Methods</h3>
          <p>Per capita indicators are calculated using:</p>
          <ul>
            <li><strong>WHO/World Bank population estimates</strong> for denominator</li>
            <li><strong>Current US dollars</strong> for international comparability</li>
            <li><strong>Constant prices</strong> available for trend analysis</li>
          </ul>

          <h3>Policy Benchmarks</h3>
          <ul>
            <li><strong>Abuja Declaration (2001):</strong> 15% of government budget to health</li>
            <li><strong>WHO Recommendation:</strong> 5% of GDP to health for progress toward UHC</li>
            <li><strong>Financial Protection Target:</strong> Out-of-pocket spending ≤20% of total health expenditure</li>
            <li><strong>SDG 3.8:</strong> Achieve universal health coverage by 2030</li>
          </ul>
        </div>
      </div>

      <div className="source-section">
        <h2>Data Updates & Versioning</h2>
        <p><strong>Current Data Version:</strong> Downloaded from WHO GHED (2024)</p>
        <p><strong>Data Coverage:</strong> 2000-2023 (24 years)</p>
        <p><strong>Last Updated:</strong> Platform data reflects WHO database as of download date</p>
        <p><strong>Update Frequency:</strong> WHO updates the Global Health Expenditure Database annually, typically in Q2-Q3 of each year with data lagging by 1-2 years.</p>

        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
            <strong>Note:</strong> For the most current data, visit the <a href="https://apps.who.int/nha/database" target="_blank" rel="noopener noreferrer">WHO GHED online database</a> which is updated regularly.
          </p>
        </div>
      </div>

      <div className="source-section">
        <h2>Citation & Attribution</h2>
        <div className="citation-box">
          <h3>How to Cite This Platform</h3>
          <p style={{ fontFamily: 'monospace', background: '#f8fafc', padding: '1rem', borderLeft: '4px solid #3b82f6' }}>
            United Nations Economic Commission for Africa (UN-ECA). (2026). <em>Africa Health Financing Gap Analysis Platform</em>. Data sourced from WHO Global Health Expenditure Database (2000-2023). Addis Ababa, Ethiopia.
          </p>

          <h3>Data Source Citation</h3>
          <p style={{ fontFamily: 'monospace', background: '#f8fafc', padding: '1rem', borderLeft: '4px solid #3b82f6' }}>
            World Health Organization. (2024). <em>Global Health Expenditure Database</em>. Retrieved from <a href="https://apps.who.int/nha/database/Home/IndicatorsDownload/en" target="_blank" rel="noopener noreferrer">https://apps.who.int/nha/database</a>
          </p>
        </div>
      </div>

      <div className="source-section">
        <h2>Contact & Support</h2>
        <p>For questions about the data or platform:</p>
        <ul>
          <li><strong>Platform:</strong> Contact UN-ECA at <a href="https://www.uneca.org" target="_blank" rel="noopener noreferrer">www.uneca.org</a></li>
          <li><strong>WHO Data:</strong> Visit the <a href="https://www.who.int/health-topics/health-financing" target="_blank" rel="noopener noreferrer">WHO Health Financing portal</a> or contact <a href="mailto:healthaccounts@who.int">healthaccounts@who.int</a></li>
          <li><strong>Technical Issues:</strong> Report issues or provide feedback on platform functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default Sources;
