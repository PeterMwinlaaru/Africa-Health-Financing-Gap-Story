import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import './DataExplorer.css';

// Indicator metadata - ONLY indicators that have corresponding charts in the platform
const INDICATOR_INFO: Record<string, {
  title: string;
  description: string;
  interpretation: string;
  benchmark?: string;
  unit: string;
}> = {
  // 3.1 Public Health Financing (1 indicator)
  'Gov exp Health per capita': {
    title: 'Government Health Expenditure Per Capita',
    description: 'The amount of money governments spend on health per person.',
    interpretation: 'Higher values indicate greater government investment in health. Low-income countries should aim for at least $112 per capita, lower-middle-income countries $146, and upper-middle-income countries $477.',
    benchmark: 'International thresholds: $112 (Low), $146 (Lower-middle), $477 (Upper-middle) per capita',
    unit: 'US$ per capita'
  },

  // 3.2 Budget Priority (3 indicators)
  'Gov exp Health on budget': {
    title: 'Government Health Budget Share',
    description: 'The percentage of total government spending allocated to health.',
    interpretation: 'The 2001 Abuja Declaration committed African governments to allocate at least 15% of their budgets to health. Most countries have not achieved this target.',
    benchmark: 'Abuja Declaration target: 15% of government budget',
    unit: 'Percentage of government budget'
  },
  'Gov exp Health on GDP': {
    title: 'Government Health Expenditure as % of GDP',
    description: 'Government health spending as a percentage of gross domestic product.',
    interpretation: 'Shows the macroeconomic priority given to health. WHO recommends at least 5% of GDP for health.',
    benchmark: '5% of GDP recommended',
    unit: 'Percentage of GDP'
  },
  'Exp Health on GDP': {
    title: 'Total Health Expenditure as % of GDP',
    description: 'Total health expenditure (all sources) as percentage of GDP.',
    interpretation: 'Shows overall health sector size relative to economy. Includes government, private, and external financing.',
    unit: 'Percentage of GDP'
  },

  // 3.3 Financial Protection (1 indicator)
  'Out-of-pocket on health exp': {
    title: 'Out-of-Pocket Health Expenditure',
    description: 'The share of health spending that households pay directly when receiving care.',
    interpretation: 'Lower values are better. When OOP exceeds 20%, households face high financial risk.',
    benchmark: 'Should be below 20%',
    unit: 'Percentage of total health expenditure'
  },

  // 3.4 Financing Structure (4 indicators)
  'Govern on health exp': {
    title: 'Government Share of Health Expenditure',
    description: 'The proportion of total health spending from government sources.',
    interpretation: 'Government should be the dominant funder (>50%) for sustainable health systems.',
    benchmark: 'Government share should exceed 50%',
    unit: 'Percentage of total health expenditure'
  },
  'External on health exp': {
    title: 'External/Donor Health Financing',
    description: 'The proportion of health spending from external sources like donors.',
    interpretation: 'High external dependence indicates financing vulnerability. Countries should transition to domestic funding.',
    benchmark: '≤22.5% for sustainability',
    unit: 'Percentage of total health expenditure'
  },
  'Domest Private on health exp': {
    title: 'Domestic Private Health Expenditure',
    description: 'Total private health spending from domestic sources (OOP + voluntary + other private).',
    interpretation: 'Shows the burden on private households and employers.',
    unit: 'Percentage of total health expenditure'
  },
  'Voluntary Prepayments on health exp': {
    title: 'Voluntary Health Insurance Share',
    description: 'Percentage from voluntary prepaid schemes like private insurance.',
    interpretation: 'Can complement public financing but should not replace it.',
    unit: 'Percentage of total health expenditure'
  },

  // 3.5 Universal Health Coverage (1 indicator)
  'Universal health coverage': {
    title: 'Universal Health Coverage (UHC) Index',
    description: 'Measures the extent to which populations can access essential health services. Index ranges from 0 to 100.',
    interpretation: 'Higher scores mean better coverage. Africa\'s average is around 45-50.',
    benchmark: 'Analysis threshold: 75 for strong UHC achievement',
    unit: 'Index (0-100)'
  },

  // 3.6 Health Outcomes (2 indicators)
  'Neonatal mortality rate': {
    title: 'Neonatal Mortality Rate',
    description: 'Deaths during the first 28 days of life, per 1,000 live births.',
    interpretation: 'Lower rates indicate better maternal and newborn health services.',
    benchmark: 'SDG Target: 12 or fewer per 1,000 live births',
    unit: 'Deaths per 1,000 live births'
  },
  'Maternal mortality ratio': {
    title: 'Maternal Mortality Ratio',
    description: 'Women who die from pregnancy-related causes per 100,000 live births.',
    interpretation: 'Lower values indicate better maternal health services.',
    benchmark: 'SDG Target: Below 70 per 100,000 live births',
    unit: 'Deaths per 100,000 live births'
  }
};

// Threshold configurations for indicators with targets
// Note: Gov exp Health per capita excluded per user request
const INDICATOR_THRESHOLDS: Record<string, {
  value: number | number[];
  label: string | string[];
  stroke?: string;
}> = {
  'Gov exp Health on budget': {
    value: 15,
    label: 'Abuja Target: 15%',
    stroke: '#ef4444'
  },
  'Gov exp Health on GDP': {
    value: 5,
    label: 'WHO Target: 5%',
    stroke: '#ef4444'
  },
  'Out-of-pocket on health exp': {
    value: 20,
    label: 'Financial Protection: 20%',
    stroke: '#ef4444'
  },
  'Govern on health exp': {
    value: 50,
    label: 'Dominant Share: 50%',
    stroke: '#10b981'
  },
  'External on health exp': {
    value: 22.5,
    label: 'Sustainability: 22.5%',
    stroke: '#ef4444'
  },
  'Universal health coverage': {
    value: 75,
    label: 'Strong UHC: 75',
    stroke: '#10b981'
  },
  'Neonatal mortality rate': {
    value: 12,
    label: 'SDG Target: 12',
    stroke: '#ef4444'
  },
  'Maternal mortality ratio': {
    value: 70,
    label: 'SDG Target: 70',
    stroke: '#ef4444'
  }
};

const DataExplorer: React.FC = () => {
  const location = useLocation();
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [indicator, setIndicator] = useState<string>('Gov exp Health per capita');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [masterData, setMasterData] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // Force scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Load countries and master data once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try{
        console.log('Loading countries...');
        const countryList = await api.getCountries();
        console.log('Countries loaded:', countryList?.length);

        console.log('Loading master data...');
        const rawData = await api.getMasterData();
        console.log('Raw data type:', typeof rawData, 'isArray:', Array.isArray(rawData));

        setCountries(Array.isArray(countryList) ? countryList : []);

        // Handle different response formats
        let parsedData: any[] = [];
        if (Array.isArray(rawData)) {
          parsedData = rawData;
        } else if (typeof rawData === 'string') {
          try {
            parsedData = JSON.parse(rawData);
          } catch (e) {
            console.error('Failed to parse rawData as JSON:', e);
          }
        } else if (rawData && typeof rawData === 'object') {
          const obj = rawData as any;
          parsedData = obj.data || obj.records || [];
        }

        console.log('Parsed data records:', parsedData.length);
        setMasterData(parsedData);
        setDataLoaded(true);

        // Check for country parameter in URL
        const searchParams = new URLSearchParams(location.search);
        const countryParam = searchParams.get('country');

        if (countryParam && Array.isArray(countryList) && countryList.includes(countryParam)) {
          // If country param exists and is valid, select only that country
          console.log('Pre-selecting country from URL:', countryParam);
          setSelectedCountries([countryParam]);
        } else if (Array.isArray(countryList) && countryList.length >= 2) {
          // Default: select first two countries
          setSelectedCountries([countryList[0], countryList[1]]);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [location.search]);

  // Process chart data when selection changes
  useEffect(() => {
    if (!dataLoaded || selectedCountries.length === 0 || !Array.isArray(masterData) || masterData.length === 0) {
      setData([]);
      return;
    }

    const filtered = masterData.filter((d: any) => selectedCountries.includes(d.location));
    const byYear = filtered.reduce((acc: any, d: any) => {
      if (!acc[d.year]) acc[d.year] = { year: d.year };
      const value = d[indicator];
      if (value !== undefined && value !== null) {
        acc[d.year][d.location] = value;
      }
      return acc;
    }, {});

    setData(Object.values(byYear).sort((a: any, b: any) => a.year - b.year));
  }, [selectedCountries, indicator, masterData, dataLoaded]);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleDownloadChart = async () => {
    const chartElement = document.querySelector('.chart-panel .recharts-wrapper');
    if (!chartElement) {
      alert('Chart not found!');
      return;
    }

    try {
      const canvas = await html2canvas(chartElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `data-explorer-${indicator}-chart.png`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error downloading chart:', err);
      alert('Failed to download chart. Please try again.');
    }
  };

  const handleDownloadCSV = () => {
    if (data.length === 0) return;

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-explorer-${indicator}-data.csv`;
    a.click();
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const handleEmbed = async () => {
    const url = window.location.href;
    const embedCode = `<iframe src="${url}" width="100%" height="800" frameborder="0" style="border:0;" allowfullscreen></iframe>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      alert('Embed code copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = embedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Embed code copied to clipboard!');
    }
  };

  const indicatorInfo = INDICATOR_INFO[indicator] || {
    title: indicator,
    description: 'No description available',
    interpretation: 'No interpretation available',
    unit: 'Value'
  };

  // Determine if indicator is monetary, percentage, or other
  const getIndicatorType = (indicatorName: string): 'monetary' | 'percentage' | 'rate' | 'index' => {
    // Monetary indicators: anything with "per capita", "USD", "Gap for", or "Expenditure"
    if (indicatorName.includes('per capita') ||
        indicatorName.includes('USD') ||
        indicatorName.includes('Gap for') ||
        indicatorName.includes('Expenditure per capita')) return 'monetary';

    // Percentage indicators: budget share, GDP share, expenditure composition
    if (indicatorName.includes('on budget') ||
        indicatorName.includes('on GDP') ||
        indicatorName.includes('on health exp') ||
        indicatorName.includes('Out-of-pocket') ||
        indicatorName.includes('Govern on health') ||
        indicatorName.includes('External on health') ||
        indicatorName.includes('Voluntary') ||
        indicatorName.includes('Private on health') ||
        indicatorName.includes('Gap Gov exp Health on GDP')) return 'percentage';

    // Rate indicators: mortality rates
    if (indicatorName.includes('mortality')) return 'rate';

    // Index indicators: coverage, other scores
    if (indicatorName.includes('coverage')) return 'index';

    return 'index';
  };

  const indicatorType = getIndicatorType(indicator);

  // Format value based on indicator type
  const formatValue = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';

    switch (indicatorType) {
      case 'monetary':
        return `$${value.toFixed(2)}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'rate':
        return value.toFixed(1);
      case 'index':
        return value.toFixed(1);
      default:
        return value.toFixed(1);
    }
  };

  // Calculate dynamic insights based on selected data
  const calculateInsights = () => {
    if (data.length === 0 || selectedCountries.length === 0) return null;

    // Get latest year data
    const latestYear = data[data.length - 1];
    const earliestYear = data[0];

    // Calculate statistics for latest year
    const latestValues: { country: string; value: number }[] = [];
    selectedCountries.forEach(country => {
      const value = latestYear[country];
      if (value !== undefined && value !== null && !isNaN(value)) {
        latestValues.push({ country, value: Number(value) });
      }
    });

    if (latestValues.length === 0) return null;

    // Determine if lower values are better for this indicator
    const lowerIsBetter = indicator.includes('Out-of-pocket') ||
                          indicator.includes('mortality') ||
                          indicator.includes('External');

    // Sort by value - direction depends on indicator type
    const sortedValues = [...latestValues].sort((a, b) =>
      lowerIsBetter ? a.value - b.value : b.value - a.value
    );
    const best = sortedValues[0];
    const worst = sortedValues[sortedValues.length - 1];
    const average = latestValues.reduce((sum, v) => sum + v.value, 0) / latestValues.length;

    // Calculate trends (comparing first and last year)
    const trends: { country: string; change: number; percentChange: number }[] = [];
    selectedCountries.forEach(country => {
      const latestValue = latestYear[country];
      const earliestValue = earliestYear[country];
      if (latestValue !== undefined && earliestValue !== undefined &&
          !isNaN(latestValue) && !isNaN(earliestValue) && Number(earliestValue) !== 0) {
        const change = Number(latestValue) - Number(earliestValue);
        const percentChange = (change / Number(earliestValue)) * 100;
        trends.push({ country, change, percentChange });
      }
    });

    // Check threshold performance
    const threshold = INDICATOR_THRESHOLDS[indicator];
    let thresholdInsight = null;
    if (threshold) {
      const thresholdValue = Array.isArray(threshold.value) ? threshold.value[0] : threshold.value;
      const meetingThreshold = latestValues.filter(v => {
        // For indicators where lower is better
        if (indicator.includes('Out-of-pocket') || indicator.includes('mortality') || indicator.includes('External')) {
          return v.value <= thresholdValue;
        }
        // For indicators where higher is better
        return v.value >= thresholdValue;
      });
      thresholdInsight = {
        total: latestValues.length,
        meeting: meetingThreshold.length,
        notMeeting: latestValues.length - meetingThreshold.length,
        threshold: thresholdValue
      };
    }

    return {
      latestYear: latestYear.year,
      earliestYear: earliestYear.year,
      best,
      worst,
      average,
      trends,
      threshold: thresholdInsight
    };
  };

  const insights = calculateInsights();

  // Y-axis tick formatter
  const formatYAxis = (value: number): string => {
    switch (indicatorType) {
      case 'monetary':
        return `$${value.toFixed(0)}`;
      case 'percentage':
        return `${value.toFixed(0)}%`;
      default:
        return value.toFixed(0);
    }
  };

  // Calculate Y-axis domain to include threshold lines
  const getYAxisDomain = (): [number, number | 'auto'] => {
    if (data.length === 0) return [0, 'auto'];

    const threshold = INDICATOR_THRESHOLDS[indicator];
    if (!threshold) return [0, 'auto'];

    // Get all data values
    const allValues: number[] = [];
    data.forEach((d: any) => {
      selectedCountries.forEach((country) => {
        const value = d[country];
        if (value !== undefined && value !== null && !isNaN(value)) {
          allValues.push(Number(value));
        }
      });
    });

    if (allValues.length === 0) return [0, 'auto'];

    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);

    // Get threshold values
    const thresholdValues = Array.isArray(threshold.value) ? threshold.value : [threshold.value];
    const maxThreshold = Math.max(...thresholdValues);
    const minThreshold = Math.min(...thresholdValues);

    // Calculate domain with padding
    const rangeMin = Math.min(dataMin, minThreshold);
    const rangeMax = Math.max(dataMax, maxThreshold);
    const padding = (rangeMax - rangeMin) * 0.1;

    return [
      Math.max(0, rangeMin - padding),
      rangeMax + padding
    ];
  };

  return (
    <div className="data-explorer-page">
      <h1>Data Explorer</h1>
      <p className="subtitle">Create custom visualizations from the platform's health financing indicators</p>

      <div className="explorer-container">
        <div className="controls-panel">
          <div className="control-group">
            <h3>1. Select Indicator</h3>
            <select value={indicator} onChange={(e) => setIndicator(e.target.value)}>
              <optgroup label="Public Health Financing">
                <option value="Gov exp Health per capita">Government Health Expenditure Per Capita</option>
              </optgroup>
              <optgroup label="Budget Priority">
                <option value="Gov exp Health on budget">Government Health Budget Share (Abuja)</option>
                <option value="Gov exp Health on GDP">Government Health Expenditure as % GDP</option>
                <option value="Exp Health on GDP">Total Health Expenditure as % GDP</option>
              </optgroup>
              <optgroup label="Financial Protection">
                <option value="Out-of-pocket on health exp">Out-of-Pocket Expenditure Share</option>
              </optgroup>
              <optgroup label="Financing Structure">
                <option value="Govern on health exp">Government Share of Health Exp</option>
                <option value="External on health exp">External/Donor Share of Health Exp</option>
                <option value="Domest Private on health exp">Domestic Private Health Expenditure</option>
                <option value="Voluntary Prepayments on health exp">Voluntary Health Insurance Share</option>
              </optgroup>
              <optgroup label="Universal Health Coverage">
                <option value="Universal health coverage">UHC Service Coverage Index</option>
              </optgroup>
              <optgroup label="Health Outcomes">
                <option value="Neonatal mortality rate">Neonatal Mortality Rate</option>
                <option value="Maternal mortality ratio">Maternal Mortality Ratio</option>
              </optgroup>
            </select>
          </div>

          <div className="control-group">
            <h3>2. Select Countries (max 5)</h3>
            <div className="country-checkboxes">
              {countries.map(country => (
                <label key={country}>
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country)}
                    onChange={() => handleCountryToggle(country)}
                    disabled={selectedCountries.length >= 5 && !selectedCountries.includes(country)}
                  />
                  {country}
                </label>
              ))}
            </div>
            <p className="helper-text">
              {selectedCountries.length === 0 && 'Select at least one country to generate a chart'}
              {selectedCountries.length > 0 && selectedCountries.length < 5 && `${selectedCountries.length} selected. You can select up to 5 countries.`}
              {selectedCountries.length === 5 && 'Maximum 5 countries selected'}
            </p>
          </div>
        </div>

        <div className="chart-panel">
          <h3>Your Custom Chart</h3>
          {loading ? (
            <p className="no-data">Loading chart data...</p>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  domain={getYAxisDomain()}
                  tickFormatter={formatYAxis}
                />
                <Tooltip
                  formatter={(value: any) => formatValue(Number(value))}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend />
                {selectedCountries.map((country, idx) => (
                  <Line
                    key={country}
                    type="monotone"
                    dataKey={country}
                    stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx]}
                    strokeWidth={2}
                  />
                ))}

                {/* Threshold Reference Lines */}
                {INDICATOR_THRESHOLDS[indicator] && (() => {
                  const threshold = INDICATOR_THRESHOLDS[indicator];
                  const values = Array.isArray(threshold.value) ? threshold.value : [threshold.value];
                  const labels = Array.isArray(threshold.label) ? threshold.label : [threshold.label];

                  return values.map((value, idx) => (
                    <ReferenceLine
                      key={`threshold-${idx}`}
                      y={value}
                      stroke={threshold.stroke || '#ef4444'}
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{
                        value: labels[idx],
                        position: 'insideTopRight',
                        fill: threshold.stroke || '#ef4444',
                        fontSize: 12,
                        fontWeight: 700,
                        offset: 10,
                        style: {
                          textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }
                      }}
                    />
                  ));
                })()}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Select countries to generate a chart</p>
          )}

          {/* Chart Controls */}
          {data.length > 0 && (
            <div className="chart-controls" style={{ marginTop: '1rem' }}>
              <button onClick={handleDownloadChart} className="btn-download-chart">
                📊 Download Chart (PNG)
              </button>
              <button onClick={handleDownloadCSV} className="btn-download">
                📥 Download Data (CSV)
              </button>
              <button onClick={handleShare} className="btn-share">🔗 Share</button>
              <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Insights Section */}
      {insights && data.length > 0 && (() => {
        // Determine if lower values are better for this indicator
        const lowerIsBetter = indicator.includes('Out-of-pocket') ||
                              indicator.includes('mortality') ||
                              indicator.includes('External');

        return (
          <div className="policy-insights-section" style={{ marginTop: '2rem' }}>
            <h3>📊 Key Insights for Selected Countries</h3>
            <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>

              {/* Best Performer */}
              <div className="insight-card" style={{ padding: '1.5rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#059669', fontSize: '0.95rem' }}>
                  🏆 Best Performance ({insights.latestYear})
                </h4>
                <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#047857' }}>{insights.best.country}</p>
                <p style={{ margin: '0.5rem 0 0 0', color: '#065f46' }}>
                  {formatValue(insights.best.value)}
                  <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({lowerIsBetter ? 'lowest' : 'highest'})
                  </span>
                </p>
              </div>

              {/* Worst Performer */}
              {selectedCountries.length > 1 && (
                <div className="insight-card" style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #ef4444' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626', fontSize: '0.95rem' }}>
                    📉 Needs Improvement ({insights.latestYear})
                  </h4>
                  <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c' }}>{insights.worst.country}</p>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#991b1b' }}>
                    {formatValue(insights.worst.value)}
                    <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                      ({lowerIsBetter ? 'highest' : 'lowest'})
                    </span>
                  </p>
                </div>
              )}

            {/* Average */}
            {selectedCountries.length > 1 && (
              <div className="insight-card" style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2563eb', fontSize: '0.95rem' }}>📊 Average Across Selected</h4>
                <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{formatValue(insights.average)}</p>
                <p style={{ margin: '0.5rem 0 0 0', color: '#1e40af', fontSize: '0.9rem' }}>Based on {selectedCountries.length} countries</p>
              </div>
            )}

            {/* Threshold Performance */}
            {insights.threshold && (
              <div className="insight-card" style={{ padding: '1.5rem', background: '#fefce8', borderRadius: '8px', border: '1px solid #eab308' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#ca8a04', fontSize: '0.95rem' }}>🎯 Target Achievement</h4>
                <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#a16207' }}>
                  {insights.threshold.meeting} of {insights.threshold.total}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', color: '#854d0e', fontSize: '0.9rem' }}>
                  {insights.threshold.meeting === insights.threshold.total ? 'All countries meet target' :
                   insights.threshold.meeting === 0 ? 'No countries meet target' :
                   `${insights.threshold.notMeeting} countries below target`}
                </p>
              </div>
            )}
          </div>

          {/* Trends */}
          {insights.trends.length > 0 && (() => {
            // Determine if lower values are better for this indicator
            const lowerIsBetter = indicator.includes('Out-of-pocket') ||
                                  indicator.includes('mortality') ||
                                  indicator.includes('External');

            return (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#475569' }}>📈 Trends ({insights.earliestYear} to {insights.latestYear})</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {insights.trends.map(trend => {
                    // For indicators where lower is better, reverse the color logic
                    const isPositiveTrend = lowerIsBetter ?
                      trend.percentChange < 0 :  // Decrease is good when lower is better
                      trend.percentChange >= 0;  // Increase is good when higher is better

                    return (
                      <div key={trend.country} style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{trend.country}</p>
                        <p style={{ margin: '0', fontSize: '1.1rem', fontWeight: 'bold', color: isPositiveTrend ? '#059669' : '#dc2626' }}>
                          {trend.percentChange >= 0 ? '↗' : '↘'} {Math.abs(trend.percentChange).toFixed(1)}%
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                          {trend.change >= 0 ? '+' : ''}{formatValue(trend.change)} change
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          </div>
        );
      })()}

      {/* Indicator Explanation */}
      <div className="indicator-explanation">
        <h2>About this indicator</h2>

        <div className="explanation-section">
          <h3>{indicatorInfo.title}</h3>
          <p className="indicator-description">{indicatorInfo.description}</p>
        </div>

        <div className="explanation-section">
          <h4>How to interpret this data</h4>
          <p>{indicatorInfo.interpretation}</p>
        </div>

        {indicatorInfo.benchmark && (
          <div className="explanation-section benchmark">
            <h4>📊 Benchmark</h4>
            <p className="benchmark-text">{indicatorInfo.benchmark}</p>
          </div>
        )}

        <div className="explanation-section">
          <h4>Measurement unit</h4>
          <p className="unit-text">{indicatorInfo.unit}</p>
        </div>

        {selectedCountries.length > 0 && (
          <div className="explanation-section countries-info">
            <h4>Countries you're comparing</h4>
            <div className="selected-countries-list">
              {selectedCountries.map((country, idx) => (
                <span key={country} className="country-badge" style={{
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  border: `2px solid ${['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx]}`,
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  display: 'inline-block',
                  margin: '0.25rem',
                  fontWeight: '500'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx],
                    marginRight: '0.5rem'
                  }}></span>
                  {country}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="explanation-section tip">
          <h4>💡 Pro Tip</h4>
          <p>
            Try comparing countries with different income levels or regions to see how
            economic development and geography impact {indicatorInfo.title.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* Data Source */}
      <div className="data-source-section">
        <h3>Data Source</h3>
        <p>
          <strong>WHO Global Health Expenditure Database</strong> - All health financing indicators are
          sourced from the World Health Organization's comprehensive database.
        </p>
        <a href="https://apps.who.int/nha/database" target="_blank" rel="noopener noreferrer">
          Visit WHO GHED →
        </a>
      </div>
    </div>
  );
};

export default DataExplorer;
