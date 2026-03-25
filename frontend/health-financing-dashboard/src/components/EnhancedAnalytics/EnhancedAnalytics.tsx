import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { calculateDynamicAnalytics } from '../../utils/analyticsCalculator';
import AfricaMap from './AfricaMap';
import './EnhancedAnalytics.css';

interface Props {
  masterData: any[];
  field: string;
  threshold?: number;
  thresholdDirection?: 'above' | 'below';
  unit?: string;
  baselineYear?: number;
}

const EnhancedAnalytics: React.FC<Props> = ({
  masterData,
  field,
  threshold,
  thresholdDirection = 'above',
  unit = '',
  baselineYear = 2000
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'progress' | 'equity' | 'geography'>('overview');

  // Get available years from data
  const availableYears = useMemo(() => {
    if (!masterData || masterData.length === 0) return [];
    const years = Array.from(new Set(masterData.map(d => d.year))).filter(y => y != null);
    return years.sort((a, b) => b - a); // Most recent first
  }, [masterData]);

  // Default to most recent year
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return availableYears.length > 0 ? availableYears[0] : 2023;
  });

  // Calculate analytics dynamically based on selected year
  const analytics = useMemo(() => {
    if (!masterData || masterData.length === 0) return null;

    return calculateDynamicAnalytics(
      masterData,
      field,
      selectedYear,
      baselineYear,
      threshold,
      thresholdDirection,
      unit
    );
  }, [masterData, field, selectedYear, baselineYear, threshold, thresholdDirection, unit]);

  // If no analytics data available
  if (!analytics) {
    return (
      <div className="enhanced-analytics">
        <div className="analytics-header">
          <h2>📊 Policy-Relevant Insights</h2>
          <p className="analytics-subtitle">Insufficient data for analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-analytics">
      <div className="analytics-header">
        <div className="analytics-title-section">
          <h2>📊 Policy-Relevant Insights</h2>
          <p className="analytics-subtitle">Comprehensive analysis for evidence-based decision-making</p>
        </div>
        <div className="year-selector">
          <label htmlFor="analytics-year">Analysis Year:</label>
          <select
            id="analytics-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-dropdown"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Continental Overview
        </button>
        {analytics.targetAchievement && (
          <button
            className={`tab ${activeTab === 'targets' ? 'active' : ''}`}
            onClick={() => setActiveTab('targets')}
          >
            Target Achievement
          </button>
        )}
        <button
          className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress Analysis
        </button>
        <button
          className={`tab ${activeTab === 'equity' ? 'active' : ''}`}
          onClick={() => setActiveTab('equity')}
        >
          Equity & Distribution
        </button>
        <button
          className={`tab ${activeTab === 'geography' ? 'active' : ''}`}
          onClick={() => setActiveTab('geography')}
        >
          Geographic Patterns
        </button>
      </div>

      {/* Tab Content */}
      <div className="analytics-content">
        {/* Continental Overview */}
        {activeTab === 'overview' && (
          <div className="analytics-section">
            <div className="methodology-note">
              <p><strong>Trend Methodology:</strong> For indicators already measured as percentages (e.g., % of GDP), trends show average annual <em>percentage point</em> changes. For indicators in other units (e.g., USD, index scores), trends show average <em>year-on-year percentage</em> changes. Period: 2016-2023.</p>
            </div>

            <div className="metric-card highlight">
              <div className="metric-icon">🌍</div>
              <div className="metric-content">
                <h3>Continental Overview</h3>
                <p className="metric-value">{analytics.continentalOverview.current}</p>
                <p className="metric-change">
                  <span className="baseline">Baseline: {analytics.continentalOverview.baseline}</span>
                  <span className="trend">{analytics.continentalOverview.trend}</span>
                </p>
              </div>
            </div>

            <div className="overview-note">
              <p><strong>Data Year:</strong> {selectedYear} snapshot compared to {baselineYear} baseline.</p>
            </div>
          </div>
        )}

        {/* Target Achievement */}
        {activeTab === 'targets' && analytics.targetAchievement && (
          <div className="analytics-section">
            <div className="target-description">
              <h3>Target Definition</h3>
              <p>{analytics.targetAchievement.targetDescription}</p>
              <p className="data-year-note"><strong>Data Year:</strong> {selectedYear}</p>
            </div>

            <div className="achievement-summary">
              <div className="achievement-chart-container">
                <h3>Target Achievement Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Meeting Target', value: analytics.targetAchievement.countriesMet, fill: '#059669' },
                        { name: 'Not Meeting Target', value: analytics.targetAchievement.countriesNotMet, fill: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value} (${((entry.value / 54) * 100).toFixed(1)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="achievement-details">
                <div className="achievement-card success">
                  <div className="achievement-number">{analytics.targetAchievement.countriesMet}</div>
                  <div className="achievement-label">Countries Meeting Target</div>
                  <div className="country-list">
                    {analytics.targetAchievement.countriesMetNames.map((country, idx) => (
                      <span key={idx} className="country-badge success">{country}</span>
                    ))}
                  </div>
                </div>

                <div className="achievement-card warning">
                  <div className="achievement-number">{analytics.targetAchievement.countriesNotMet}</div>
                  <div className="achievement-label">Countries Not Meeting Target</div>
                  <div className="gap-info">
                    <p><strong>Average Gap:</strong> {analytics.targetAchievement.averageGap}</p>
                  </div>
                </div>
              </div>
            </div>

            {analytics.targetAchievement.gapDistribution && (
              <div className="gap-distribution">
                <h3>Gap Distribution</h3>
                <div className="distribution-bars">
                  <div className="dist-bar">
                    <div className="dist-label">Close to target (within 20%)</div>
                    <div className="dist-bar-fill close" style={{width: `${(analytics.targetAchievement.gapDistribution.close / analytics.targetAchievement.countriesNotMet) * 100}%`}}>
                      {analytics.targetAchievement.gapDistribution.close} countries
                    </div>
                  </div>
                  <div className="dist-bar">
                    <div className="dist-label">Moderate gap (20-50% below)</div>
                    <div className="dist-bar-fill moderate" style={{width: `${(analytics.targetAchievement.gapDistribution.moderate / analytics.targetAchievement.countriesNotMet) * 100}%`}}>
                      {analytics.targetAchievement.gapDistribution.moderate} countries
                    </div>
                  </div>
                  <div className="dist-bar">
                    <div className="dist-label">Far from target (&gt;50% below)</div>
                    <div className="dist-bar-fill far" style={{width: `${(analytics.targetAchievement.gapDistribution.far / analytics.targetAchievement.countriesNotMet) * 100}%`}}>
                      {analytics.targetAchievement.gapDistribution.far} countries
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Analysis */}
        {activeTab === 'progress' && (
          <div className="analytics-section">
            <div className="methodology-note">
              <p><strong>Progress Classification:</strong> Based on 5-year trend analysis ({selectedYear - 5}-{selectedYear}). Countries are classified as improving, stagnating, or worsening based on their trajectory pattern, not just year-to-year comparison.</p>
              <p><strong>Average Annual Change:</strong> For percentage indicators (e.g., % of GDP), this shows the average annual <em>percentage point</em> change (2016-2023). For other indicators (e.g., USD, index scores), this shows the average of <em>year-on-year percentage changes</em> (2016-2023), which properly accounts for compounding growth.</p>
            </div>

            <div className="progress-summary">
              <div className="progress-card improving">
                <div className="progress-icon">📈</div>
                <div className="progress-number">{analytics.progressAnalysis.improving}</div>
                <div className="progress-label">Countries Improving</div>
                <div className="progress-sublabel">Consistent upward trend</div>
              </div>
              <div className="progress-card stagnating">
                <div className="progress-icon">➡️</div>
                <div className="progress-number">{analytics.progressAnalysis.stagnating}</div>
                <div className="progress-label">Countries Stagnating</div>
                <div className="progress-sublabel">Minimal or erratic change</div>
              </div>
              <div className="progress-card worsening">
                <div className="progress-icon">📉</div>
                <div className="progress-number">{analytics.progressAnalysis.worsening}</div>
                <div className="progress-label">Countries Worsening</div>
                <div className="progress-sublabel">Consistent downward trend</div>
              </div>
            </div>

            <div className="progress-details">
              <div className="detail-row">
                <span className="detail-label">Average Annual Change (2016-2023):</span>
                <span className="detail-value">{analytics.progressAnalysis.averageAnnualChange}</span>
              </div>
              <div className="recent-trend">
                <h4>Recent Trend Assessment</h4>
                <p>{analytics.progressAnalysis.recentTrend}</p>
              </div>
            </div>
          </div>
        )}

        {/* Equity & Distribution */}
        {activeTab === 'equity' && (
          <div className="analytics-section">
            <div className="methodology-note">
              <p><strong>Data Year:</strong> {selectedYear} snapshot. Rankings and inequality measures based on selected year data.</p>
            </div>

            {analytics.equity.giniCoefficient && (
              <div className="inequality-metric">
                <h3>Inequality Level</h3>
                <div className="gini-display">
                  <div className="gini-value">{analytics.equity.giniCoefficient}</div>
                  <p className="gini-interpretation">
                    Gini coefficient measures inequality from 0 (perfect equality) to 1 (maximum inequality)
                  </p>
                </div>
              </div>
            )}

            <div className="performers-section">
              <div className="performers-column">
                <h3>Top 5 Performers ({selectedYear})</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.equity.topPerformers.map(p => ({
                    country: p.country,
                    value: parseFloat(p.value.replace('$', ''))
                  }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" label={{ value: 'USD per capita', position: 'insideBottom', offset: -5 }} />
                    <YAxis type="category" dataKey="country" width={100} />
                    <Tooltip formatter={(value) => `$${value} per capita`} />
                    <Bar dataKey="value" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="performers-column">
                <h3>Bottom 5 Performers ({selectedYear})</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.equity.bottomPerformers.map(p => ({
                    country: p.country,
                    value: parseFloat(p.value.replace('$', ''))
                  }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" label={{ value: 'USD per capita', position: 'insideBottom', offset: -5 }} />
                    <YAxis type="category" dataKey="country" width={100} />
                    <Tooltip formatter={(value) => `$${value} per capita`} />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Geographic Patterns */}
        {activeTab === 'geography' && (
          <div className="analytics-section">
            <div className="methodology-note">
              <p><strong>Data Year:</strong> {selectedYear} snapshot. Geographic patterns and regional clustering based on selected year data.</p>
            </div>

            {/* Interactive Map */}
            {analytics.geographicPatterns.targetAchievementMap ? (
              <AfricaMap
                data={analytics.geographicPatterns.targetAchievementMap}
                title={`Target Achievement Status (${selectedYear})`}
              />
            ) : (
              <div className="map-note">
                <p><strong>Note:</strong> Interactive map is available for indicators with defined thresholds. This indicator does not have a threshold-based target, so geographic patterns are shown as regional summaries below.</p>
              </div>
            )}

            <div className="geography-grid">
              <div className="geography-card">
                <div className="geo-icon">🏆</div>
                <h4>Leading Region</h4>
                <p>{analytics.geographicPatterns.leadingRegion}</p>
              </div>

              <div className="geography-card">
                <div className="geo-icon">⚠️</div>
                <h4>Lagging Region</h4>
                <p>{analytics.geographicPatterns.laggingRegion}</p>
              </div>

              <div className="geography-card">
                <div className="geo-icon">🗺️</div>
                <h4>Clustering Patterns</h4>
                <p>{analytics.geographicPatterns.clustering}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Policy Insights - Always Visible */}
      <div className="policy-insights-section">
        <h3>🎯 Key Policy Insights</h3>
        <ul className="policy-insights-list">
          {analytics.policyInsights.map((insight, idx) => (
            <li key={idx} className="policy-insight-item">
              <span className="insight-number">{idx + 1}</span>
              <span className="insight-text">{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;
