import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { calculateDynamicAnalytics, DEFAULT_THRESHOLDS, ClassificationThresholds } from '../../utils/analyticsCalculator';
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
  const [showThresholdSettings, setShowThresholdSettings] = useState(true);
  const [classificationThresholds, setClassificationThresholds] = useState<ClassificationThresholds>({ ...DEFAULT_THRESHOLDS });

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
      unit,
      classificationThresholds
    );
  }, [masterData, field, selectedYear, baselineYear, threshold, thresholdDirection, unit, classificationThresholds]);

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
              <p><strong>Trend Methodology:</strong> For indicators already measured as percentages (e.g., % of GDP), trends show average annual <em>percentage point</em> changes. For indicators in other units (e.g., USD, index scores), trends show average <em>year-on-year percentage</em> changes. Period: 2018-2023.</p>
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
                        { name: 'Meeting', value: analytics.targetAchievement.countriesMet, fill: '#059669' },
                        { name: 'Not Meeting', value: analytics.targetAchievement.countriesNotMet, fill: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-(midAngle || 0) * RADIAN);
                        const y = cy + radius * Math.sin(-(midAngle || 0) * RADIAN);
                        return (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
                            {value}
                          </text>
                        );
                      }}
                      outerRadius={90}
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} countries (${((Number(value) / 54) * 100).toFixed(1)}%)`} />
                    <Legend
                      formatter={(value: any) => {
                        const met = analytics.targetAchievement!.countriesMet;
                        const notMet = analytics.targetAchievement!.countriesNotMet;
                        const count = value === 'Meeting' ? met : notMet;
                        const pct = ((count / 54) * 100).toFixed(1);
                        return `${value}: ${count} (${pct}%)`;
                      }}
                    />
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
                  {[
                    { label: 'Close to target (within 20%)', value: analytics.targetAchievement.gapDistribution.close, className: 'close' },
                    { label: 'Moderate gap (20-50% below)', value: analytics.targetAchievement.gapDistribution.moderate, className: 'moderate' },
                    { label: 'Far from target (>50% below)', value: analytics.targetAchievement.gapDistribution.far, className: 'far' },
                  ].map((item) => {
                    const pct = (item.value / analytics.targetAchievement!.countriesNotMet) * 100;
                    const isNarrow = pct < 20;
                    return (
                      <div className="dist-bar" key={item.className}>
                        <div className="dist-label">{item.label}</div>
                        <div className="dist-bar-track">
                          <div className={`dist-bar-fill ${item.className}`} style={{ width: `${Math.max(pct, 2)}%` }}>
                            {!isNarrow && <span>{item.value} countries</span>}
                          </div>
                          {isNarrow && <span className="dist-bar-text-outside">{item.value} countries</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Analysis */}
        {activeTab === 'progress' && (
          <div className="analytics-section">
            <div className="methodology-note">
              <p><strong>Progress Classification:</strong> Based on 5-year trend analysis ({selectedYear - 5}-{selectedYear}). Countries are classified as improving, stagnating, or worsening.</p>
              {(() => {
                const isPct = field.includes('GDP') || field.includes('budget') ||
                  field.includes('on health exp') || field.includes('Out-of-pocket') ||
                  field.includes('Govern on health') || field.includes('External on health') ||
                  field.includes('Voluntary') || field.includes('Private on health') ||
                  field.includes('as % of');
                const isMortality = field.includes('mortality');
                const isIndex = field.includes('coverage');
                const usesCagr = (!isPct || isMortality) && !isIndex;
                const usesPp = isPct && !isMortality;
                const lowerBetter = isMortality || field.includes('Out-of-pocket') || field.includes('External on health') || field.includes('financial hardship');

                return (
                  <>
                    <p>
                      <strong>Stagnation threshold:</strong>{' '}
                      {usesCagr && <>Compound Annual Growth Rate (CAGR) &lt; {classificationThresholds.cagrThreshold}%. CAGR = (V<sub>end</sub> / V<sub>begin</sub>)<sup>1/n</sup> - 1, where n = number of years.</>}
                      {usesPp && <>Absolute change &lt; {classificationThresholds.ppThreshold} percentage points over 5 years.</>}
                      {isIndex && <>Absolute change &lt; {classificationThresholds.indexPointsPerYear} point(s) per year (&lt; {classificationThresholds.indexPointsPerYear * 5} points over 5 years).</>}
                    </p>
                    {lowerBetter && (
                      <p>For this indicator, a decrease is classified as improving.</p>
                    )}
                  </>
                );
              })()}
              <p><strong>Pace Assessment:</strong> Projects how many years it will take to reach the target at the current rate of change, and compares this with the pace required to reach the target by 2030.</p>
            </div>

            {/* Classification Threshold Settings */}
            <div className="threshold-settings">
              <button
                className="threshold-toggle"
                onClick={() => setShowThresholdSettings(!showThresholdSettings)}
              >
                {showThresholdSettings ? '▼' : '▶'} Adjust Classification Thresholds
              </button>
              {showThresholdSettings && (() => {
                // Detect which threshold type applies to this indicator
                const isPct = field.includes('GDP') || field.includes('budget') ||
                  field.includes('on health exp') || field.includes('Out-of-pocket') ||
                  field.includes('Govern on health') || field.includes('External on health') ||
                  field.includes('Voluntary') || field.includes('Private on health') ||
                  field.includes('as % of');
                const isMortality = field.includes('mortality');
                const isIndex = field.includes('coverage');
                const usesCagr = (!isPct || isMortality) && !isIndex;
                const usesPp = isPct && !isMortality;

                return (
                  <div className="threshold-controls">
                    {usesCagr && (
                      <div className="threshold-control">
                        <label>
                          CAGR stagnation threshold:
                          <strong> {classificationThresholds.cagrThreshold.toFixed(1)}%</strong>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="5"
                          step="0.5"
                          value={classificationThresholds.cagrThreshold}
                          onChange={(e) => setClassificationThresholds(prev => ({
                            ...prev,
                            cagrThreshold: parseFloat(e.target.value)
                          }))}
                        />
                        <span className="threshold-range">0.5% — 5%</span>
                      </div>
                    )}
                    {usesPp && (
                      <div className="threshold-control">
                        <label>
                          Percentage-point stagnation threshold:
                          <strong> {classificationThresholds.ppThreshold.toFixed(1)} pp</strong>
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="2.0"
                          step="0.1"
                          value={classificationThresholds.ppThreshold}
                          onChange={(e) => setClassificationThresholds(prev => ({
                            ...prev,
                            ppThreshold: parseFloat(e.target.value)
                          }))}
                        />
                        <span className="threshold-range">0.1 pp — 2.0 pp</span>
                      </div>
                    )}
                    {isIndex && (
                      <div className="threshold-control">
                        <label>
                          Index points/year stagnation threshold:
                          <strong> {classificationThresholds.indexPointsPerYear.toFixed(1)} pts/yr</strong>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.5"
                          value={classificationThresholds.indexPointsPerYear}
                          onChange={(e) => setClassificationThresholds(prev => ({
                            ...prev,
                            indexPointsPerYear: parseFloat(e.target.value)
                          }))}
                        />
                        <span className="threshold-range">0.5 — 3.0 pts/yr</span>
                      </div>
                    )}
                    <button
                      className="threshold-reset"
                      onClick={() => setClassificationThresholds({ ...DEFAULT_THRESHOLDS })}
                    >
                      Reset to Default
                    </button>
                  </div>
                );
              })()}
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
              <div className="pace-assessment">
                <h4>Pace Assessment</h4>
                <p>{analytics.progressAnalysis.paceAssessment}</p>
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
