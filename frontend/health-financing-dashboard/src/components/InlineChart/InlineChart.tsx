import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ChartConfig } from '../../config/charts';
import './InlineChart.css';

interface InlineChartProps {
  config: ChartConfig;
  topicColor?: string;
}

// API base URL
const API_BASE = 'http://localhost:5000';

// Disaggregation options
type DisaggregationType = 'overall' | 'income' | 'subregion';

// Thresholds for reference lines (from Statistical Product for Health Financing Gap.docx)
const THRESHOLDS: Record<string, { value: number; label: string }> = {
  'Gov exp Health on budget': { value: 15, label: 'Abuja Target (15%)' },
  'Out-of-pocket on health exp': { value: 20, label: 'Benchmark (20%)' },
  'Govern on health exp': { value: 50, label: 'Dominant Share (50%)' },
  'Neonatal mortality rate': { value: 12, label: 'Target (<12 per 1,000)' },
  'Maternal mortality ratio': { value: 70, label: 'Target (<70 per 100,000)' },
  // Note: UHC uses 50th/75th percentiles from data, not fixed threshold
  // Note: GDP share threshold not specified in source document
};

// Colors for income groups (matches actual data format with hyphens)
const INCOME_COLORS: Record<string, string> = {
  'Low': '#ef4444',           // red
  'Lower-middle': '#f59e0b',  // amber
  'Upper-middle': '#10b981',  // green
};

// Colors for subregions (matches actual data format with spaces)
const SUBREGION_COLORS: Record<string, string> = {
  'Northern Africa': '#3b82f6',   // blue
  'Western Africa': '#f59e0b',    // amber
  'Eastern Africa': '#10b981',    // green
  'Central Africa': '#8b5cf6',     // purple
  'Southern Africa': '#ef4444',   // red
};

// Colors for multiple series (cross-dimensional)
const SERIES_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
];

// Short labels for fields
const FIELD_LABELS: Record<string, string> = {
  'Gov exp Health per capita': 'Gov Health Exp/Capita ($)',
  'Gov exp Health on budget': 'Health Budget Share (%)',
  'Gov exp Health on GDP': 'Health/GDP (%)',
  'Out-of-pocket on health exp': 'Out-of-Pocket (%)',
  'External on health exp': 'External Financing (%)',
  'Govern on health exp': 'Government Share (%)',
  'Universal health coverage': 'UHC Index',
  'Neonatal mortality rate': 'Neonatal Mortality (per 1000)',
  'Maternal mortality ratio': 'Maternal Mortality (per 100k)',
};

// Unit mapping for value formatting
const FIELD_UNITS: Record<string, { symbol: string; position: 'prefix' | 'suffix'; decimals: number }> = {
  'Gov exp Health per capita': { symbol: '$', position: 'prefix', decimals: 2 },
  'Gap for Gov exp Health per capita': { symbol: '$', position: 'prefix', decimals: 2 },
  'Expenditure per capita current': { symbol: '$', position: 'prefix', decimals: 2 },
  'Gov exp Health on budget': { symbol: '%', position: 'suffix', decimals: 1 },
  'Gov exp Health on GDP': { symbol: '%', position: 'suffix', decimals: 1 },
  'Exp Health on GDP': { symbol: '%', position: 'suffix', decimals: 1 },
  'Out-of-pocket on health exp': { symbol: '%', position: 'suffix', decimals: 1 },
  'External on health exp': { symbol: '%', position: 'suffix', decimals: 1 },
  'Govern on health exp': { symbol: '%', position: 'suffix', decimals: 1 },
  'Voluntary Prepayments on health exp': { symbol: '%', position: 'suffix', decimals: 1 },
  'Other Private on health exp': { symbol: '%', position: 'suffix', decimals: 1 },
  'Universal health coverage': { symbol: '', position: 'suffix', decimals: 1 },
  'Neonatal mortality rate': { symbol: '', position: 'suffix', decimals: 1 },
  'Maternal mortality ratio': { symbol: '', position: 'suffix', decimals: 1 },
};

// Helper function to format values with appropriate units
const formatValueWithUnit = (value: number, fieldName: string): string => {
  const unitInfo = FIELD_UNITS[fieldName];
  if (!unitInfo) {
    return value.toFixed(2);
  }

  const formattedValue = value.toFixed(unitInfo.decimals);
  if (unitInfo.position === 'prefix' && unitInfo.symbol) {
    return `${unitInfo.symbol}${formattedValue}`;
  } else if (unitInfo.symbol) {
    return `${formattedValue}${unitInfo.symbol}`;
  }
  return formattedValue;
};

// Friendly names for groups (matches actual data format)
const GROUP_LABELS: Record<string, string> = {
  'Low': 'Low Income',
  'Lower-middle': 'Lower-Middle Income',
  'Upper-middle': 'Upper-Middle Income',
  'Northern Africa': 'Northern Africa',
  'Western Africa': 'Western Africa',
  'Eastern Africa': 'Eastern Africa',
  'Central Africa': 'Central Africa',
  'Southern Africa': 'Southern Africa',
};

const InlineChart: React.FC<InlineChartProps> = ({ config, topicColor = '#3b82f6' }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disaggregation, setDisaggregation] = useState<DisaggregationType>('overall');
  const [groupKeys, setGroupKeys] = useState<string[]>([]);
  const [countryCount, setCountryCount] = useState<{ min: number; max: number } | null>(null);

  // Check if this is a multi-field (cross-dimensional) chart
  const isMultiField = Array.isArray(config.yField) && config.yField.length > 1;
  const yFields = Array.isArray(config.yField) ? config.yField : [config.yField];

  useEffect(() => {
    loadChartData();
  }, [config.id, disaggregation]);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);
    setCountryCount(null);

    try {
      // For multi-field charts, don't support disaggregation (too complex)
      if (isMultiField && config.chartType === 'line') {
        const allData: Record<number, any> = {};

        for (let i = 0; i < yFields.length; i++) {
          const field = yFields[i];
          const url = `${API_BASE}/api/aggregate/by-year?field=${encodeURIComponent(field)}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch data for ${field}`);

          const fieldData = await response.json();

          fieldData.forEach((item: any) => {
            if (!allData[item.year]) {
              allData[item.year] = { year: item.year };
            }
            allData[item.year][`value${i}`] = item.value;
            allData[item.year][`field${i}`] = field;
          });
        }

        const mergedData = Object.values(allData).sort((a: any, b: any) => a.year - b.year);
        setData(mergedData);
        setGroupKeys([]);
      } else {
        // Single field - support disaggregation
        const yField = yFields[0];
        let url: string;

        if (config.chartType === 'line') {
          if (disaggregation === 'overall') {
            url = `${API_BASE}/api/aggregate/by-year?field=${encodeURIComponent(yField)}`;
          } else {
            url = `${API_BASE}/api/aggregate/by-year?field=${encodeURIComponent(yField)}&groupBy=${disaggregation}`;
          }
        } else if (config.chartType === 'bar') {
          url = `${API_BASE}/api/aggregate/by-country?field=${encodeURIComponent(yField)}`;
        } else {
          url = `${API_BASE}/api/data/master`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch data');

        const rawData = await response.json();

        if (config.chartType === 'bar') {
          setData(rawData.slice(0, 15));
          setGroupKeys([]);
        } else if (disaggregation !== 'overall' && rawData.length > 0) {
          // Extract group keys from first data point
          const keys = Object.keys(rawData[0]).filter(k => k !== 'year');
          setGroupKeys(keys);
          setData(rawData);
        } else {
          setData(rawData);
          setGroupKeys([]);
          // Extract country counts from the data
          if (rawData.length > 0 && rawData[0].count !== undefined) {
            const counts = rawData.map((d: any) => d.count).filter((c: any) => c !== undefined);
            if (counts.length > 0) {
              setCountryCount({
                min: Math.min(...counts),
                max: Math.max(...counts)
              });
            }
          }
        }
      }
    } catch (err) {
      setError('Unable to load chart data');
      console.error('Error loading chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getThreshold = (fieldIndex: number = 0) => {
    const field = yFields[fieldIndex];
    return THRESHOLDS[field];
  };

  const getFieldLabel = (field: string) => {
    return FIELD_LABELS[field] || field;
  };

  const getGroupColor = (key: string) => {
    if (disaggregation === 'income') {
      return INCOME_COLORS[key] || '#94a3b8';
    } else if (disaggregation === 'subregion') {
      return SUBREGION_COLORS[key] || '#94a3b8';
    }
    return topicColor;
  };

  const getGroupLabel = (key: string) => {
    return GROUP_LABELS[key] || key.replace(/_/g, ' ');
  };

  const renderDisaggregationSelector = () => {
    // Only show for line charts that aren't multi-field
    if (config.chartType !== 'line' || isMultiField) return null;

    return (
      <div className="disaggregation-selector">
        <button
          className={`disagg-btn ${disaggregation === 'overall' ? 'active' : ''}`}
          onClick={() => setDisaggregation('overall')}
        >
          Regional Average
        </button>
        <button
          className={`disagg-btn ${disaggregation === 'income' ? 'active' : ''}`}
          onClick={() => setDisaggregation('income')}
        >
          By Income Group
        </button>
        <button
          className={`disagg-btn ${disaggregation === 'subregion' ? 'active' : ''}`}
          onClick={() => setDisaggregation('subregion')}
        >
          By Sub-region
        </button>
      </div>
    );
  };

  const renderChart = () => {
    if (data.length === 0) {
      return <div className="no-data">No data available for this indicator</div>;
    }

    const threshold = getThreshold();

    switch (config.chartType) {
      case 'line':
        if (isMultiField) {
          // Cross-dimensional chart with dual Y-axes
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#94a3b8' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: SERIES_COLORS[0] }}
                  tickLine={{ stroke: SERIES_COLORS[0] }}
                  domain={['auto', 'auto']}
                  label={{
                    value: getFieldLabel(yFields[0]),
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: SERIES_COLORS[0] }
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: SERIES_COLORS[1] }}
                  tickLine={{ stroke: SERIES_COLORS[1] }}
                  domain={['auto', 'auto']}
                  label={{
                    value: getFieldLabel(yFields[1]),
                    angle: 90,
                    position: 'insideRight',
                    style: { fontSize: 10, fill: SERIES_COLORS[1] }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any, name: any) => {
                    // name is the raw field name, format with units
                    const formattedValue = typeof value === 'number' ? formatValueWithUnit(value, name) : value;
                    return [formattedValue, getFieldLabel(name) || name];
                  }}
                />
                <Legend formatter={(name: string) => getFieldLabel(name) || name} />
                {THRESHOLDS[yFields[0]] && (
                  <ReferenceLine
                    yAxisId="left"
                    y={THRESHOLDS[yFields[0]].value}
                    stroke={SERIES_COLORS[0]}
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                  />
                )}
                {THRESHOLDS[yFields[1]] && (
                  <ReferenceLine
                    yAxisId="right"
                    y={THRESHOLDS[yFields[1]].value}
                    stroke={SERIES_COLORS[1]}
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                  />
                )}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="value0"
                  stroke={SERIES_COLORS[0]}
                  strokeWidth={3}
                  dot={{ fill: SERIES_COLORS[0], strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                  name={yFields[0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="value1"
                  stroke={SERIES_COLORS[1]}
                  strokeWidth={3}
                  dot={{ fill: SERIES_COLORS[1], strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                  name={yFields[1]}
                />
              </LineChart>
            </ResponsiveContainer>
          );
        }

        // Disaggregated line chart
        if (disaggregation !== 'overall' && groupKeys.length > 0) {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#94a3b8' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#94a3b8' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any, name: any) => {
                    // name is the group key, use yFields[0] for the actual field
                    const formattedValue = typeof value === 'number' ? formatValueWithUnit(value, yFields[0]) : value;
                    return [formattedValue, getGroupLabel(name)];
                  }}
                />
                <Legend formatter={(value: string) => getGroupLabel(value)} />
                {threshold && (
                  <ReferenceLine
                    y={threshold.value}
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    label={{ value: threshold.label, position: 'right', fontSize: 10, fill: '#94a3b8' }}
                  />
                )}
                {groupKeys.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={getGroupColor(key)}
                    strokeWidth={2}
                    dot={{ fill: getGroupColor(key), strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5 }}
                    name={key}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          );
        }

        // Single field line chart (overall)
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#94a3b8' }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#94a3b8' }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any) => [typeof value === 'number' ? formatValueWithUnit(value, yFields[0]) : value, 'Value']}
              />
              <Legend />
              {threshold && (
                <ReferenceLine
                  y={threshold.value}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: threshold.label, position: 'right', fontSize: 11, fill: '#ef4444' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={topicColor}
                strokeWidth={3}
                dot={{ fill: topicColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="African Average"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={Math.max(400, data.length * 28)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                domain={[0, 'auto']}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: any, props: any) => {
                  const income = props.payload?.income;
                  const formattedValue = typeof value === 'number' ? formatValueWithUnit(value, yFields[0]) : value;
                  return [
                    `${formattedValue}${income ? ` (${income})` : ''}`,
                    'Value'
                  ];
                }}
              />
              {threshold && (
                <ReferenceLine
                  x={threshold.value}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: threshold.label, position: 'top', fontSize: 10, fill: '#ef4444' }}
                />
              )}
              <Bar
                dataKey="value"
                fill={topicColor}
                radius={[0, 4, 4, 0]}
                name="Value"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="no-data">Chart type not supported</div>;
    }
  };

  const getFooterText = () => {
    let countText = '';
    if (countryCount) {
      if (countryCount.min === countryCount.max) {
        countText = ` • Based on data from ${countryCount.max} African countries`;
      } else {
        countText = ` • Based on ${countryCount.min}-${countryCount.max} African countries with available data (varies by year)`;
      }
    }

    if (isMultiField) {
      return `Cross-dimensional analysis: African averages over time${countText}`;
    }
    if (disaggregation === 'income') {
      return `Disaggregated by income group (Low, Lower-Middle, Upper-Middle)${countText}`;
    }
    if (disaggregation === 'subregion') {
      return `Disaggregated by sub-region (Northern, Western, Eastern, Middle, Southern Africa)${countText}`;
    }
    if (config.chartType === 'line') {
      return `Showing African average over time${countText}`;
    }
    return 'Showing top 15 countries by latest year';
  };

  if (loading) {
    return (
      <div className="inline-chart-loading">
        <div className="loading-spinner"></div>
        <span>Loading chart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-chart-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="inline-chart">
      {renderDisaggregationSelector()}
      {renderChart()}
      <div className="chart-footer">
        <span className="data-note">{getFooterText()}</span>
      </div>
    </div>
  );
};

export default InlineChart;
