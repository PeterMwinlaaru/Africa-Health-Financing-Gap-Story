import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
} from 'recharts';
import './CrossDimensionalExplorer.css';

// Comprehensive indicator list organized by category
const INDICATOR_CATEGORIES = {
  'Public Health Financing': [
    { value: 'Gov exp Health per capita', label: 'Government Health Expenditure Per Capita', unit: 'US$' },
    { value: 'Gap for Gov exp Health per capita', label: 'Health Financing Gap (Per Capita)', unit: 'US$' },
    { value: 'Expenditure per capita current', label: 'Total Health Expenditure Per Capita', unit: 'US$' },
  ],
  'Budget Priority': [
    { value: 'Gov exp Health on budget', label: 'Government Health Budget Share (% of budget)', unit: '%' },
    { value: 'Gov exp Health on GDP', label: 'Government Health Expenditure (% of GDP)', unit: '%' },
    { value: 'Exp Health on GDP', label: 'Total Health Expenditure (% of GDP)', unit: '%' },
    { value: 'Gap Gov exp Health on GDP', label: 'Gap to 5% GDP Benchmark', unit: '%' },
  ],
  'Financial Protection': [
    { value: 'Out-of-pocket on health exp', label: 'Out-of-Pocket (% of Current Health Expenditure)', unit: '%' },
    { value: 'financial hardship', label: 'Catastrophic Health Spending (% of population)', unit: '%' },
  ],
  'Financing Structure': [
    { value: 'Govern on health exp', label: 'Government (% of THE)', unit: '%' },
    { value: 'External on health exp', label: 'External Health Expenditure (% of Current Health Expenditure)', unit: '%' },
    { value: 'Voluntary Prepayments on health exp', label: 'Voluntary Prepayments (% of THE)', unit: '%' },
    { value: 'Domest Private on health exp', label: 'Domestic Private (% of THE)', unit: '%' },
    { value: 'Exc Out-of-pocket on health exp', label: 'Excluding OOP Private (% of THE)', unit: '%' },
    { value: 'Other Private on health exp', label: 'Other Private (% of THE)', unit: '%' },
  ],
  'UHC Coverage': [
    { value: 'Universal health coverage', label: 'UHC Service Coverage Index', unit: 'Index (0-100)' },
  ],
  'Health Outcomes': [
    { value: 'Neonatal mortality rate', label: 'Neonatal Mortality Rate', unit: 'per 1,000 live births' },
    { value: 'Maternal mortality ratio', label: 'Maternal Mortality Ratio', unit: 'per 100,000 live births' },
  ],
  'Fiscal Space & Economic': [
    { value: 'GDP per capita Constant 2023', label: 'GDP Per Capita (Constant 2023)', unit: 'US$' },
    { value: 'Tax Revenue per GDP', label: 'Tax Revenue (% of GDP)', unit: '%' },
    { value: 'Population', label: 'Total Population', unit: 'persons' },
  ],
};

const VISUALIZATION_TYPES = [
  { id: 'scatter', label: 'Scatter Plot' },
  { id: 'table', label: 'Cross-tabulation' },
  { id: 'dual-axis', label: 'Dual-axis Chart' },
  { id: 'correlation', label: 'Correlation Matrix' },
];

// Allowed input indicators for first dropdown
const ALLOWED_INPUT_INDICATORS = [
  'Gov exp Health per capita',
  'Expenditure per capita current',
  'Gov exp Health on budget',
  'Gov exp Health on GDP',
  'Out-of-pocket on health exp',
  'External on health exp',
];

const CrossDimensionalExplorer: React.FC = () => {
  const [visualizationType, setVisualizationType] = useState('scatter');
  const [indicator1, setIndicator1] = useState('Gov exp Health per capita');
  const [indicator2, setIndicator2] = useState('Universal health coverage');
  const [correlationIndicators1, setCorrelationIndicators1] = useState<string[]>([]);
  const [correlationIndicators2, setCorrelationIndicators2] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'income' | 'subregion'>('none');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [showMethodology, setShowMethodology] = useState(false);

  // Get all indicators as flat list
  const getAllIndicators = () => {
    const all: Array<{ value: string; label: string; unit: string; category: string }> = [];
    Object.entries(INDICATOR_CATEGORIES).forEach(([category, indicators]) => {
      indicators.forEach((ind) => {
        all.push({ ...ind, category });
      });
    });
    return all;
  };

  const allIndicators = getAllIndicators();

  // Get indicator info by value
  const getIndicatorInfo = (value: string) => {
    return allIndicators.find((ind) => ind.value === value);
  };

  // Initialize correlation indicators when switching to correlation view
  useEffect(() => {
    if (visualizationType === 'correlation' && correlationIndicators1.length === 0) {
      // Default: select all allowed input indicators
      setCorrelationIndicators1(ALLOWED_INPUT_INDICATORS);
      // Default: select all outcome indicators (UHC + Health Outcomes)
      const outcomeInds = [
        ...INDICATOR_CATEGORIES['UHC Coverage'].map(ind => ind.value),
        ...INDICATOR_CATEGORIES['Health Outcomes'].map(ind => ind.value)
      ];
      setCorrelationIndicators2(outcomeInds);
    }
  }, [visualizationType]);

  // Fetch data when indicators change
  useEffect(() => {
    if (visualizationType === 'correlation') {
      if (correlationIndicators1.length > 0 && correlationIndicators2.length > 0) {
        fetchData();
      }
    } else {
      if (indicator1 && indicator2) {
        fetchData();
      }
    }
  }, [indicator1, indicator2, correlationIndicators1, correlationIndicators2, visualizationType, filterYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/data/master');
      const allData = await response.json();

      // For correlation matrix, we need all selected indicators
      const requiredFields = visualizationType === 'correlation'
        ? [...correlationIndicators1, ...correlationIndicators2]
        : [indicator1, indicator2];

      // Filter data - keep rows that have at least some valid data
      let filtered = allData.filter((row: any) => {
        return requiredFields.some(field =>
          row[field] != null && !isNaN(parseFloat(row[field]))
        );
      });

      // Apply year filter
      if (filterYear !== 'all') {
        filtered = filtered.filter((row: any) => row.year === filterYear);
      }

      setData(filtered);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const getUniqueYears = () => {
    return Array.from(new Set(data.map((d) => d.year))).sort();
  };

  const getUniqueCountries = () => {
    return Array.from(new Set(data.map((d) => d.location))).filter(Boolean).sort();
  };

  // Render Scatter Plot
  const renderScatterPlot = () => {
    const indicator1Info = getIndicatorInfo(indicator1);
    const indicator2Info = getIndicatorInfo(indicator2);

    let scatterData = data
      .filter(row =>
        row[indicator1] != null && row[indicator2] != null &&
        !isNaN(parseFloat(row[indicator1])) && !isNaN(parseFloat(row[indicator2]))
      )
      .map((row) => ({
        x: parseFloat(row[indicator1]),
        y: parseFloat(row[indicator2]),
        country: row.location,
        year: row.year,
        income: row.income,
        subregion: row.Subregion,
      }));

    // Filter by country if selected
    if (selectedCountry !== 'all') {
      scatterData = scatterData.filter((d) => d.country === selectedCountry);
    }

    // Color definitions
    const incomeColors: Record<string, string> = {
      'Low': '#e74c3c',
      'Lower-middle': '#f39c12',
      'Upper-middle': '#3498db',
      'High': '#2ecc71',
    };

    const subregionColors: Record<string, string> = {
      'Eastern Africa': '#3498db',
      'Western Africa': '#e74c3c',
      'Southern Africa': '#2ecc71',
      'Northern Africa': '#f39c12',
      'Central Africa': '#9b59b6',
    };

    // Default color for ungrouped
    const defaultColor = '#3b82f6';

    // Determine subtitle based on grouping and country selection
    let subtitle = 'Scatter plot showing relationship between indicators';
    if (selectedCountry !== 'all') {
      subtitle = `Time-series relationship for ${selectedCountry}`;
    } else if (groupBy === 'income') {
      subtitle = 'Grouped by income level';
    } else if (groupBy === 'subregion') {
      subtitle = 'Grouped by sub-region';
    }

    return (
      <div className="visualization-container">
        <h3>{indicator1Info?.label} vs {indicator2Info?.label}</h3>
        <p className="subtitle">{subtitle}</p>
        <ResponsiveContainer width="100%" height={550}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name={indicator1Info?.label}
              label={{ value: `${indicator1Info?.label} (${indicator1Info?.unit})`, position: 'insideBottom', offset: -15 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={indicator2Info?.label}
              label={{ value: `${indicator2Info?.label} (${indicator2Info?.unit})`, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      <p><strong>{data.country}</strong></p>
                      <p>Year: {data.year}</p>
                      <p>Income: {data.income}</p>
                      {groupBy === 'subregion' && <p>Region: {data.subregion}</p>}
                      <p>{indicator1Info?.label}: {data.x.toFixed(2)} {indicator1Info?.unit}</p>
                      <p>{indicator2Info?.label}: {data.y.toFixed(2)} {indicator2Info?.unit}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {groupBy === 'none' && (
              <Scatter
                name={selectedCountry !== 'all' ? selectedCountry : 'All Countries'}
                data={scatterData}
                fill={defaultColor}
              />
            )}
            {groupBy === 'income' && Object.entries(incomeColors).map(([income, color]) => (
              <Scatter
                key={income}
                name={income}
                data={scatterData.filter((d) => d.income === income)}
                fill={color}
              />
            ))}
            {groupBy === 'subregion' && Object.entries(subregionColors).map(([subregion, color]) => (
              <Scatter
                key={subregion}
                name={subregion}
                data={scatterData.filter((d) => d.subregion === subregion)}
                fill={color}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <div className="scatter-insights">
          <p><strong>Total observations:</strong> {scatterData.length}</p>
          <p><strong>Correlation:</strong> {calculateCorrelation(scatterData).toFixed(3)}</p>
          {selectedCountry !== 'all' && (
            <p><strong>Time range:</strong> {Math.min(...scatterData.map(d => d.year))} - {Math.max(...scatterData.map(d => d.year))}</p>
          )}
        </div>
      </div>
    );
  };

  // Calculate Pearson correlation coefficient
  const calculateCorrelation = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return 0;

    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumY2 = points.reduce((sum, p) => sum + p.y * p.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Generate dynamic insights based on current selections
  const generateInsights = () => {
    if (loading || data.length === 0) return null;

    const indicator1Info = getIndicatorInfo(indicator1);
    const indicator2Info = getIndicatorInfo(indicator2);

    if (visualizationType === 'scatter' || visualizationType === 'dual-axis') {
      let validData = data.filter(row =>
        row[indicator1] != null && row[indicator2] != null &&
        !isNaN(parseFloat(row[indicator1])) && !isNaN(parseFloat(row[indicator2]))
      );

      if (selectedCountry !== 'all') {
        validData = validData.filter(row => row.location === selectedCountry);
      }

      const points = validData.map(row => ({
        x: parseFloat(row[indicator1]),
        y: parseFloat(row[indicator2])
      }));

      // Return null if no valid data points
      if (points.length === 0) return null;

      const correlation = calculateCorrelation(points);
      const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

      // Interpret correlation strength
      const absCorr = Math.abs(correlation);
      let strength = '';
      if (absCorr >= 0.7) strength = 'strong';
      else if (absCorr >= 0.4) strength = 'moderate';
      else strength = 'weak';

      const direction = correlation > 0 ? 'positive' : 'negative';

      // Group analysis if grouping is active
      let groupInsights = null;
      if (groupBy !== 'none' && selectedCountry === 'all') {
        const groupField = groupBy === 'income' ? 'income' : 'Subregion';
        const groups = Array.from(new Set(validData.map(d => d[groupField]))).filter(Boolean);

        const groupStats = groups.map(group => {
          const groupData = validData.filter(d => d[groupField] === group);
          const groupPoints = groupData.map(d => ({
            x: parseFloat(d[indicator1]),
            y: parseFloat(d[indicator2])
          }));

          // Handle empty groups
          if (groupPoints.length === 0) {
            return null;
          }

          return {
            name: group,
            count: groupPoints.length,
            avgX: groupPoints.reduce((sum, p) => sum + p.x, 0) / groupPoints.length,
            avgY: groupPoints.reduce((sum, p) => sum + p.y, 0) / groupPoints.length,
            correlation: calculateCorrelation(groupPoints)
          };
        }).filter(Boolean); // Remove null entries

        groupInsights = groupStats.length > 0 ? groupStats : null;
      }

      return {
        type: 'bivariate',
        correlation,
        strength,
        direction,
        observations: points.length,
        avgX,
        avgY,
        indicator1: indicator1Info?.label,
        indicator2: indicator2Info?.label,
        unit1: indicator1Info?.unit,
        unit2: indicator2Info?.unit,
        groupInsights,
        country: selectedCountry !== 'all' ? selectedCountry : null,
        yearRange: selectedCountry !== 'all' && validData.length > 0 ? {
          min: Math.min(...validData.map(d => d.year).filter(y => !isNaN(y))),
          max: Math.max(...validData.map(d => d.year).filter(y => !isNaN(y)))
        } : null
      };
    } else if (visualizationType === 'correlation') {
      // Correlation matrix insights
      if (correlationIndicators1.length === 0 || correlationIndicators2.length === 0) return null;

      const strongCorrelations: Array<{ind1: string; ind2: string; corr: number}> = [];

      correlationIndicators1.forEach(ind1 => {
        correlationIndicators2.forEach(ind2 => {
          let validData = data.filter(d => d[ind1] != null && d[ind2] != null);
          if (selectedCountry !== 'all') {
            validData = validData.filter(d => d.location === selectedCountry);
          }

          const points = validData.map(d => ({
            x: parseFloat(d[ind1]),
            y: parseFloat(d[ind2])
          }));

          const corr = calculateCorrelation(points);
          if (Math.abs(corr) >= 0.6) {
            strongCorrelations.push({
              ind1: getIndicatorInfo(ind1)?.label || ind1,
              ind2: getIndicatorInfo(ind2)?.label || ind2,
              corr
            });
          }
        });
      });

      // Sort by absolute correlation strength
      strongCorrelations.sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr));

      return {
        type: 'correlation',
        strongCorrelations: strongCorrelations.slice(0, 5), // Top 5
        totalPairs: correlationIndicators1.length * correlationIndicators2.length,
        country: selectedCountry !== 'all' ? selectedCountry : null
      };
    } else if (visualizationType === 'table') {
      // Cross-tabulation insights
      let validData = data.filter(row =>
        row[indicator1] != null && row[indicator2] != null &&
        !isNaN(parseFloat(row[indicator1])) && !isNaN(parseFloat(row[indicator2]))
      );

      return {
        type: 'crosstab',
        observations: validData.length,
        indicator1: indicator1Info?.label,
        indicator2: indicator2Info?.label,
        groupBy: groupBy
      };
    }

    return null;
  };

  const insights = generateInsights();

  // Render Cross-tabulation Table
  const renderCrossTabulation = () => {
    const indicator1Info = getIndicatorInfo(indicator1);
    const indicator2Info = getIndicatorInfo(indicator2);

    let validData = data.filter(row =>
      row[indicator1] != null && row[indicator2] != null &&
      !isNaN(parseFloat(row[indicator1])) && !isNaN(parseFloat(row[indicator2]))
    );

    // Helper function to create a single cross-tabulation table
    const createTable = (tableData: any[], groupName?: string) => {
      // Calculate quartiles for both indicators
      const values1 = tableData.map((d) => parseFloat(d[indicator1])).sort((a, b) => a - b);
      const values2 = tableData.map((d) => parseFloat(d[indicator2])).sort((a, b) => a - b);

      const q1_1 = values1[Math.floor(values1.length * 0.25)];
      const q3_1 = values1[Math.floor(values1.length * 0.75)];
      const q1_2 = values2[Math.floor(values2.length * 0.25)];
      const q3_2 = values2[Math.floor(values2.length * 0.75)];

      const categorize1 = (val: number) => {
        if (val <= q1_1) return 'Low';
        if (val <= q3_1) return 'Medium';
        return 'High';
      };

      const categorize2 = (val: number) => {
        if (val <= q1_2) return 'Low';
        if (val <= q3_2) return 'Medium';
        return 'High';
      };

      // Create cross-tabulation
      const categories = ['Low', 'Medium', 'High'];
      const table: Record<string, Record<string, number>> = {};
      categories.forEach((cat1) => {
        table[cat1] = {};
        categories.forEach((cat2) => {
          table[cat1][cat2] = 0;
        });
      });

      tableData.forEach((row) => {
        const cat1 = categorize1(parseFloat(row[indicator1]));
        const cat2 = categorize2(parseFloat(row[indicator2]));
        table[cat1][cat2]++;
      });

      return (
        <div key={groupName} className="cross-tab-group">
          {groupName && <h4 className="group-title">{groupName}</h4>}
          <table className="cross-tab-table">
            <thead>
              <tr>
                <th></th>
                <th colSpan={3}>{indicator2Info?.label}</th>
              </tr>
              <tr>
                <th>{indicator1Info?.label}</th>
                {categories.map((cat) => (
                  <th key={cat}>{cat}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat1) => (
                <tr key={cat1}>
                  <td><strong>{cat1}</strong></td>
                  {categories.map((cat2) => (
                    <td key={cat2} className="cell-value">
                      {table[cat1][cat2]}
                      <span className="cell-percent">
                        ({((table[cat1][cat2] / tableData.length) * 100).toFixed(1)}%)
                      </span>
                    </td>
                  ))}
                  <td><strong>{Object.values(table[cat1]).reduce((a, b) => a + b, 0)}</strong></td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>Total</strong></td>
                {categories.map((cat2) => (
                  <td key={cat2}>
                    <strong>{categories.reduce((sum, cat1) => sum + table[cat1][cat2], 0)}</strong>
                  </td>
                ))}
                <td><strong>{tableData.length}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    };

    // Determine subtitle based on grouping
    let subtitle = 'Countries grouped by quartiles (Low, Medium, High)';
    if (groupBy === 'income') {
      subtitle = 'Countries grouped by quartiles within each income level';
    } else if (groupBy === 'subregion') {
      subtitle = 'Countries grouped by quartiles within each sub-region';
    }

    return (
      <div className="visualization-container">
        <h3>{indicator1Info?.label} vs {indicator2Info?.label}</h3>
        <p className="subtitle">{subtitle}</p>

        {/* Methodology Info */}
        <div className="methodology-info">
          <button
            className="methodology-toggle"
            onClick={() => setShowMethodology(!showMethodology)}
          >
            <span className="info-icon">ℹ️</span>
            {showMethodology ? 'Hide' : 'Show'} Categorization Methodology
          </button>

          {showMethodology && (
            <div className="methodology-content">
              <h4>How are countries categorized into Low, Medium, and High?</h4>
              <p>
                Countries are classified using <strong>quartile-based thresholds</strong> calculated from the data:
              </p>
              <ul>
                <li><strong>Low:</strong> Values ≤ 25th percentile (Q1) - bottom 25% of observations</li>
                <li><strong>Medium:</strong> Values between Q1 and Q3 - middle 50% of observations</li>
                <li><strong>High:</strong> Values &gt; 75th percentile (Q3) - top 25% of observations</li>
              </ul>

              {groupBy === 'none' && (
                <p className="grouping-note">
                  <strong>Current view:</strong> Quartiles are calculated across all countries,
                  showing the overall continental distribution.
                </p>
              )}

              {groupBy === 'income' && (
                <p className="grouping-note">
                  <strong>Current view:</strong> Quartiles are calculated <em>within each income group</em> separately.
                  This means countries are compared to their income peers - a "High" low-income country
                  is in the top quartile among low-income countries specifically.
                </p>
              )}

              {groupBy === 'subregion' && (
                <p className="grouping-note">
                  <strong>Current view:</strong> Quartiles are calculated <em>within each sub-region</em> separately.
                  This means countries are compared to their regional neighbors - a "High" Eastern African country
                  is in the top quartile among Eastern African countries specifically.
                </p>
              )}

              <p className="methodology-note">
                <strong>Why quartiles?</strong> This data-driven approach ensures balanced categories
                and works consistently across different indicators with different units and scales.
              </p>
            </div>
          )}
        </div>

        {groupBy === 'none' ? (
          // Single table for all data
          createTable(validData)
        ) : (
          // Multiple tables, one per group
          <div className="grouped-tables">
            {groupBy === 'income' && (
              ['Low', 'Lower-middle', 'Upper-middle', 'High'].map(incomeLevel => {
                const groupData = validData.filter(d => d.income === incomeLevel);
                if (groupData.length === 0) return null;
                return createTable(groupData, `${incomeLevel} Income`);
              })
            )}
            {groupBy === 'subregion' && (
              ['Eastern Africa', 'Western Africa', 'Southern Africa', 'Northern Africa', 'Central Africa'].map(subregion => {
                const groupData = validData.filter(d => d.Subregion === subregion);
                if (groupData.length === 0) return null;
                return createTable(groupData, subregion);
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Dual-axis Chart
  const renderDualAxisChart = () => {
    const indicator1Info = getIndicatorInfo(indicator1);
    const indicator2Info = getIndicatorInfo(indicator2);

    let validData = data.filter(row =>
      row[indicator1] != null && row[indicator2] != null &&
      !isNaN(parseFloat(row[indicator1])) && !isNaN(parseFloat(row[indicator2]))
    );

    // Filter by country if selected
    if (selectedCountry !== 'all') {
      validData = validData.filter((row) => row.location === selectedCountry);
    }

    // Aggregate by year and optionally by group
    if (groupBy === 'none' || selectedCountry !== 'all') {
      // No grouping - aggregate all data
      const yearlyData: Record<number, { year: number; ind1: number[]; ind2: number[] }> = {};

      validData.forEach((row) => {
        const year = row.year;
        if (!yearlyData[year]) {
          yearlyData[year] = { year, ind1: [], ind2: [] };
        }
        yearlyData[year].ind1.push(parseFloat(row[indicator1]));
        yearlyData[year].ind2.push(parseFloat(row[indicator2]));
      });

      const chartData = Object.values(yearlyData)
        .map((yd) => ({
          year: yd.year,
          avg1: yd.ind1.reduce((a, b) => a + b, 0) / yd.ind1.length,
          avg2: yd.ind2.reduce((a, b) => a + b, 0) / yd.ind2.length,
        }))
        .sort((a, b) => a.year - b.year);

      // Determine subtitle based on filters
      const subtitle = selectedCountry !== 'all'
        ? `Trend over time for ${selectedCountry}`
        : 'Average values over time (all countries)';

      return (
        <div className="visualization-container">
          <h3>{indicator1Info?.label} vs {indicator2Info?.label}</h3>
          <p className="subtitle">{subtitle}</p>
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                yAxisId="left"
                label={{ value: `${indicator1Info?.label} (${indicator1Info?.unit})`, angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: `${indicator2Info?.label} (${indicator2Info?.unit})`, angle: 90, position: 'insideRight' }}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avg1"
                stroke="#3b82f6"
                name={indicator1Info?.label}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avg2"
                stroke="#e74c3c"
                name={indicator2Info?.label}
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    } else {
      // Group by income or subregion
      const groupField = groupBy === 'income' ? 'income' : 'Subregion';
      const yearlyGroupData: Record<number, Record<string, { ind1: number[]; ind2: number[] }>> = {};

      validData.forEach((row) => {
        const year = row.year;
        const group = row[groupField];
        if (!yearlyGroupData[year]) {
          yearlyGroupData[year] = {};
        }
        if (!yearlyGroupData[year][group]) {
          yearlyGroupData[year][group] = { ind1: [], ind2: [] };
        }
        yearlyGroupData[year][group].ind1.push(parseFloat(row[indicator1]));
        yearlyGroupData[year][group].ind2.push(parseFloat(row[indicator2]));
      });

      // Get all unique groups
      const allGroups = Array.from(new Set(validData.map(d => d[groupField]))).filter(Boolean);

      // Create chart data with one column per group for each indicator
      const chartData = Object.entries(yearlyGroupData)
        .map(([year, groups]) => {
          const dataPoint: any = { year: parseInt(year) };
          allGroups.forEach(group => {
            if (groups[group]) {
              dataPoint[`${group}_ind1`] = groups[group].ind1.reduce((a, b) => a + b, 0) / groups[group].ind1.length;
              dataPoint[`${group}_ind2`] = groups[group].ind2.reduce((a, b) => a + b, 0) / groups[group].ind2.length;
            }
          });
          return dataPoint;
        })
        .sort((a, b) => a.year - b.year);

      // Color schemes
      const incomeColors: Record<string, string> = {
        'Low': '#e74c3c',
        'Lower-middle': '#f39c12',
        'Upper-middle': '#3498db',
      };

      const subregionColors: Record<string, string> = {
        'Eastern Africa': '#3498db',
        'Western Africa': '#e74c3c',
        'Southern Africa': '#2ecc71',
        'Northern Africa': '#f39c12',
        'Central Africa': '#9b59b6',
      };

      const colors = groupBy === 'income' ? incomeColors : subregionColors;

      const subtitle = groupBy === 'income'
        ? 'Trends by income level'
        : 'Trends by sub-region';

      return (
        <div className="visualization-container">
          <h3>{indicator1Info?.label} vs {indicator2Info?.label}</h3>
          <p className="subtitle">{subtitle}</p>
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                yAxisId="left"
                label={{ value: `${indicator1Info?.label} (${indicator1Info?.unit})`, angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: `${indicator2Info?.label} (${indicator2Info?.unit})`, angle: 90, position: 'insideRight' }}
              />
              <Tooltip />
              <Legend />
              {allGroups.map((group) => (
                <Line
                  key={`${group}_ind1`}
                  yAxisId="left"
                  type="monotone"
                  dataKey={`${group}_ind1`}
                  stroke={colors[group] || '#3b82f6'}
                  name={`${group} - ${indicator1Info?.label}`}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              ))}
              {allGroups.map((group) => (
                <Line
                  key={`${group}_ind2`}
                  yAxisId="right"
                  type="monotone"
                  dataKey={`${group}_ind2`}
                  stroke={colors[group] || '#e74c3c'}
                  name={`${group} - ${indicator2Info?.label}`}
                  strokeWidth={2}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    }
  };

  // Render Correlation Matrix
  const renderCorrelationMatrix = () => {
    if (correlationIndicators1.length === 0 || correlationIndicators2.length === 0) {
      return (
        <div className="visualization-container">
          <h3>Correlation Matrix</h3>
          <p className="subtitle">Select indicators below to display correlation matrix</p>
        </div>
      );
    }

    // Filter data by country if selected
    let validData = data;
    if (selectedCountry !== 'all') {
      validData = validData.filter((d) => d.location === selectedCountry);
    }

    // Calculate correlation matrix
    const matrix: number[][] = [];

    correlationIndicators1.forEach((ind1) => {
      const row: number[] = [];
      correlationIndicators2.forEach((ind2) => {
        const points = validData
          .filter((d) => d[ind1] != null && d[ind2] != null)
          .map((d) => ({
            x: parseFloat(d[ind1]),
            y: parseFloat(d[ind2]),
          }));

        const correlation = calculateCorrelation(points);
        row.push(correlation);
      });
      matrix.push(row);
    });

    // Get color based on correlation value
    const getColor = (value: number) => {
      const absValue = Math.abs(value);
      if (absValue >= 0.7) return value > 0 ? '#27ae60' : '#e74c3c';
      if (absValue >= 0.4) return value > 0 ? '#7fb3d5' : '#f1948a';
      return '#ecf0f1';
    };

    const getTextColor = (value: number) => {
      return Math.abs(value) >= 0.4 ? '#ffffff' : '#2c3e50';
    };

    // Determine subtitle based on country selection
    const subtitle = selectedCountry !== 'all'
      ? `Pearson correlation coefficients for ${selectedCountry} (time-series data)`
      : 'Pearson correlation coefficients between selected indicators (all countries)';

    return (
      <div className="visualization-container">
        <h3>Correlation Matrix</h3>
        <p className="subtitle">{subtitle}</p>
        <div className="correlation-legend">
          <span><strong>Legend:</strong></span>
          <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#27ae60'}}></span> Strong positive (&gt; 0.7)</span>
          <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#7fb3d5'}}></span> Moderate positive (0.4-0.7)</span>
          <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#ecf0f1'}}></span> Weak (-0.4 to 0.4)</span>
          <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#f1948a'}}></span> Moderate negative (-0.7 to -0.4)</span>
          <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#e74c3c'}}></span> Strong negative (&lt; -0.7)</span>
        </div>
        <div className="matrix-container">
          <table className="correlation-matrix">
            <thead>
              <tr>
                <th></th>
                {correlationIndicators2.map((ind) => {
                  const info = getIndicatorInfo(ind);
                  return (
                    <th key={ind} className="matrix-header">
                      <div className="rotated-header">{info?.label}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {correlationIndicators1.map((ind1, i) => {
                const info1 = getIndicatorInfo(ind1);
                return (
                  <tr key={ind1}>
                    <td className="row-header">{info1?.label}</td>
                    {correlationIndicators2.map((ind2, j) => (
                      <td
                        key={ind2}
                        className="matrix-cell"
                        style={{
                          backgroundColor: getColor(matrix[i][j]),
                          color: getTextColor(matrix[i][j]),
                        }}
                      >
                        {matrix[i][j].toFixed(2)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render multi-select for correlation matrix
  const renderCorrelationSelectors = () => {
    return (
      <div className="correlation-selectors">
        <div className="selector-group">
          <label>Select Input Indicators (Set 1) - Hold Ctrl/Cmd to select multiple</label>
          <select
            multiple
            value={correlationIndicators1}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setCorrelationIndicators1(selected);
            }}
            size={10}
          >
            {Object.entries(INDICATOR_CATEGORIES).map(([category, indicators]) => {
              const filteredIndicators = indicators.filter(ind => ALLOWED_INPUT_INDICATORS.includes(ind.value));
              if (filteredIndicators.length === 0) return null;
              return (
                <optgroup key={category} label={category}>
                  {filteredIndicators.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        <div className="selector-group">
          <label>Select Outcome Indicators (Set 2) - Hold Ctrl/Cmd to select multiple</label>
          <select
            multiple
            value={correlationIndicators2}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setCorrelationIndicators2(selected);
            }}
            size={10}
          >
            {Object.entries(INDICATOR_CATEGORIES)
              .filter(([category]) => category === 'UHC Coverage' || category === 'Health Outcomes')
              .map(([category, indicators]) => (
                <optgroup key={category} label={category}>
                  {indicators.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="cross-dimensional-explorer">
      <div className="page-header">
        <h1>Cross-Dimensional Analysis</h1>
        <p className="page-subtitle">
          Explore how health financing, budget priorities, and fiscal space relate to UHC coverage and health outcomes
        </p>
      </div>

      {/* Visualization Type Tabs */}
      <div className="visualization-tabs">
        {VISUALIZATION_TYPES.map((type) => (
          <button
            key={type.id}
            className={`tab ${visualizationType === type.id ? 'active' : ''}`}
            onClick={() => setVisualizationType(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Indicator Selectors */}
      {visualizationType === 'correlation' ? (
        renderCorrelationSelectors()
      ) : (
        <div className="indicator-selectors">
          <div className="selector-group">
            <label>Select Input Indicator (X-axis / Rows)</label>
            <select value={indicator1} onChange={(e) => setIndicator1(e.target.value)}>
              {Object.entries(INDICATOR_CATEGORIES).map(([category, indicators]) => {
                const filteredIndicators = indicators.filter(ind => ALLOWED_INPUT_INDICATORS.includes(ind.value));
                if (filteredIndicators.length === 0) return null;
                return (
                  <optgroup key={category} label={category}>
                    {filteredIndicators.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <div className="selector-group">
            <label>Select Outcome Indicator (Y-axis / Columns)</label>
            <select value={indicator2} onChange={(e) => setIndicator2(e.target.value)}>
              {Object.entries(INDICATOR_CATEGORIES)
                .filter(([category]) => category === 'UHC Coverage' || category === 'Health Outcomes')
                .map(([category, indicators]) => (
                  <optgroup key={category} label={category}>
                    {indicators.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* Filters - Show for all visualization types */}
      <div className="filters">
        {/* Country Selector - Disabled for Cross-tabulation */}
        <div className="filter-group">
          <label>Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              if (e.target.value !== 'all') {
                setGroupBy('none'); // Reset grouping when country is selected
              }
            }}
            disabled={visualizationType === 'table'}
          >
            <option value="all">All Countries</option>
            {getUniqueCountries().map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {selectedCountry !== 'all' && visualizationType !== 'table' && (
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
              {visualizationType === 'scatter' ? 'Viewing time series' :
               visualizationType === 'dual-axis' ? 'Single country trend' :
               visualizationType === 'correlation' ? 'Single country correlations' : 'Single country view'}
            </small>
          )}
          {visualizationType === 'table' && (
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#94a3b8' }}>
              Not applicable
            </small>
          )}
        </div>

        {/* Year Selector - Active for all types */}
        <div className="filter-group">
          <label>Year</label>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">All Years</option>
            {getUniqueYears().map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Group By - Active for scatter, dual-axis, and cross-tabulation */}
        <div className="filter-group">
          <label>Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'none' | 'income' | 'subregion')}
            disabled={
              ((visualizationType === 'scatter' || visualizationType === 'dual-axis') && selectedCountry !== 'all') ||
              visualizationType === 'correlation'
            }
          >
            <option value="none">No Grouping</option>
            <option value="income">Income Level</option>
            <option value="subregion">Sub-region</option>
          </select>
          {(((visualizationType === 'scatter' || visualizationType === 'dual-axis') && selectedCountry !== 'all') ||
            visualizationType === 'correlation') && (
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#94a3b8' }}>
              {visualizationType === 'correlation' ? 'Not applicable' :
               'Select "All Countries" first'}
            </small>
          )}
        </div>
      </div>

      {/* Visualization */}
      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          <div className="visualization-area">
            {visualizationType === 'scatter' && renderScatterPlot()}
            {visualizationType === 'table' && renderCrossTabulation()}
            {visualizationType === 'dual-axis' && renderDualAxisChart()}
            {visualizationType === 'correlation' && renderCorrelationMatrix()}
          </div>

          {/* Dynamic Insights */}
          {insights && (
            <div className="policy-insights-section" style={{ marginTop: '2rem', padding: '2rem', background: '#f8fafc', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>📊 Key Insights</h3>

              {/* Bivariate Analysis Insights (Scatter & Dual-axis) */}
              {insights.type === 'bivariate' && insights.correlation !== undefined && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {/* Correlation Card */}
                    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: `2px solid ${Math.abs(insights.correlation!) >= 0.7 ? '#10b981' : Math.abs(insights.correlation!) >= 0.4 ? '#f59e0b' : '#94a3b8'}` }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>Correlation Strength</h4>
                      <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: insights.correlation! > 0 ? '#10b981' : '#ef4444' }}>
                        {insights.correlation!.toFixed(3)}
                      </p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                        {insights.strength.charAt(0).toUpperCase() + insights.strength.slice(1)} {insights.direction}
                      </p>
                    </div>

                    {/* Observations Card */}
                    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>Data Points</h4>
                      <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                        {insights.observations}
                      </p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                        {insights.country ? `${insights.country} (${insights.yearRange?.min}-${insights.yearRange?.max})` : 'All countries'}
                      </p>
                    </div>

                    {/* Average Values */}
                    {!isNaN(insights.avgX) && (
                      <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>Average {insights.indicator1}</h4>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                          {insights.avgX.toFixed(2)} {insights.unit1}
                        </p>
                      </div>
                    )}

                    {!isNaN(insights.avgY) && (
                      <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>Average {insights.indicator2}</h4>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                          {insights.avgY.toFixed(2)} {insights.unit2}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Interpretation */}
                  <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#475569' }}>💡 Interpretation</h4>
                    <p style={{ margin: 0, lineHeight: '1.6', color: '#1e293b' }}>
                      {Math.abs(insights.correlation!) >= 0.7 && (
                        <>There is a <strong>{insights.strength} {insights.direction}</strong> relationship between {insights.indicator1} and {insights.indicator2}.
                        This suggests that {insights.direction === 'positive' ? 'increases' : 'decreases'} in {insights.indicator1} are consistently associated with {insights.direction === 'positive' ? 'increases' : 'decreases'} in {insights.indicator2}.</>
                      )}
                      {Math.abs(insights.correlation!) >= 0.4 && Math.abs(insights.correlation!) < 0.7 && (
                        <>There is a <strong>{insights.strength} {insights.direction}</strong> relationship between {insights.indicator1} and {insights.indicator2}.
                        While there is a noticeable trend, other factors also play significant roles in determining {insights.indicator2}.</>
                      )}
                      {Math.abs(insights.correlation!) < 0.4 && (
                        <>There is a <strong>{insights.strength}</strong> relationship between {insights.indicator1} and {insights.indicator2}.
                        This suggests that {insights.indicator1} alone is not a strong predictor of {insights.indicator2}, and other factors may be more influential.</>
                      )}
                    </p>
                  </div>

                  {/* Group Analysis */}
                  {insights.groupInsights && insights.groupInsights.length > 0 && (
                    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#475569' }}>📈 Analysis by {groupBy === 'income' ? 'Income Level' : 'Sub-region'}</h4>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {insights.groupInsights.map((group: any) => (
                          <div key={group.name} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px', display: 'grid', gridTemplateColumns: '200px 1fr 1fr 100px', gap: '1rem', alignItems: 'center' }}>
                            <div>
                              <strong style={{ color: '#1e293b' }}>{group.name}</strong>
                              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{group.count} observations</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{insights.indicator1}</div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                {!isNaN(group.avgX) ? `${group.avgX.toFixed(2)} ${insights.unit1}` : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{insights.indicator2}</div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                {!isNaN(group.avgY) ? `${group.avgY.toFixed(2)} ${insights.unit2}` : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Correlation</div>
                              <div style={{ fontWeight: 'bold', color: Math.abs(group.correlation) >= 0.6 ? '#10b981' : '#64748b' }}>
                                {!isNaN(group.correlation) ? group.correlation.toFixed(2) : 'N/A'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Correlation Matrix Insights */}
              {insights.type === 'correlation' && (
                <div>
                  <p style={{ marginTop: '0.5rem', color: '#475569' }}>
                    Analyzing <strong>{insights.totalPairs}</strong> indicator pairs
                    {insights.country && ` for ${insights.country}`}
                  </p>

                  {insights.strongCorrelations && insights.strongCorrelations.length > 0 ? (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ marginBottom: '1rem', color: '#475569' }}>🎯 Strongest Relationships Found</h4>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {insights.strongCorrelations.map((item: any, idx: number) => (
                          <div key={idx} style={{ padding: '1rem', background: 'white', borderRadius: '6px', border: `2px solid ${item.corr > 0 ? '#10b981' : '#ef4444'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <strong style={{ color: '#1e293b' }}>{item.ind1}</strong>
                              <span style={{ margin: '0 0.75rem', color: '#64748b' }}>↔</span>
                              <strong style={{ color: '#1e293b' }}>{item.ind2}</strong>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: item.corr > 0 ? '#10b981' : '#ef4444' }}>
                                {item.corr.toFixed(3)}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {Math.abs(item.corr) >= 0.7 ? 'Strong' : 'Moderate'} {item.corr > 0 ? 'positive' : 'negative'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                      <p style={{ margin: 0, color: '#64748b' }}>
                        No strong correlations (|r| ≥ 0.6) found between the selected indicators. This suggests relatively independent relationships.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cross-tabulation Insights */}
              {insights.type === 'crosstab' && (
                <div>
                  <p style={{ marginTop: '0.5rem', color: '#475569' }}>
                    Analyzing <strong>{insights.observations}</strong> observations across quartile categories for {insights.indicator1} and {insights.indicator2}.
                  </p>
                  <div style={{ padding: '1.5rem', background: 'white', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '1rem' }}>
                    <p style={{ margin: 0, lineHeight: '1.6', color: '#1e293b' }}>
                      <strong>How to read the table:</strong> Each cell shows how many countries fall into that combination of categories.
                      For example, countries in the "High-High" cell have both high {insights.indicator1} <em>and</em> high {insights.indicator2},
                      while "Low-High" countries have low {insights.indicator1} but high {insights.indicator2}.
                    </p>
                    {insights.groupBy !== 'none' && (
                      <p style={{ marginTop: '1rem', marginBottom: 0, color: '#475569' }}>
                        <strong>Note:</strong> Quartile categorizations are calculated separately within each {insights.groupBy === 'income' ? 'income group' : 'sub-region'},
                        allowing for within-group comparisons.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CrossDimensionalExplorer;
