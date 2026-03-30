import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import html2canvas from 'html2canvas';
import { getChartBySlug, ChartConfig } from '../../config/charts';
import { getTopicById } from '../../config/topics';
import api, { HealthData } from '../../services/api';
import EnhancedAnalytics from '../../components/EnhancedAnalytics/EnhancedAnalytics';
import DynamicHighlights from '../../components/DynamicHighlights/DynamicHighlights';
import {
  generateLineChartHighlights,
  generateCountryComparisonHighlights
} from '../../utils/highlightsCalculator';
import './ChartPage.css';

// Disaggregation options
type DisaggregationType = 'overall' | 'income' | 'subregion';

// Colors for income groups
const INCOME_COLORS: Record<string, string> = {
  'Low': '#ef4444',           // red
  'Lower-middle': '#f59e0b',  // amber
  'Upper-middle': '#10b981',  // green
};

// Colors for subregions
const SUBREGION_COLORS: Record<string, string> = {
  'Northern Africa': '#3b82f6',   // blue
  'Western Africa': '#f59e0b',    // amber
  'Eastern Africa': '#10b981',    // green
  'Central Africa': '#8b5cf6',     // purple
  'Southern Africa': '#ef4444',   // red
};

// Colors for financing source fields
const FIELD_COLORS: Record<string, string> = {
  'Govern on health exp': '#3b82f6',              // blue - Government
  'Out-of-pocket on health exp': '#ef4444',      // red - OOP
  'External on health exp': '#f59e0b',            // amber - External
  'Voluntary Prepayments on health exp': '#10b981', // green - Voluntary
  'Other Private on health exp': '#8b5cf6'        // purple - Other Private
};

// Thresholds for reference lines
const THRESHOLDS: Record<string, { value: number; label: string } | { [key: string]: { value: number; label: string } }> = {
  'Gov exp Health per capita': {
    'Low': { value: 112, label: 'Low Income Target ($112)' },
    'Lower-middle': { value: 146, label: 'Lower-Middle Target ($146)' },
    'Upper-middle': { value: 477, label: 'Upper-Middle Target ($477)' }
  },
  'Gov exp Health on budget': { value: 15, label: 'Abuja Target (15%)' },
  'Gov exp Health on GDP': { value: 5, label: 'WHO Target (5%)' },
  'Exp Health on GDP': { value: 5, label: 'WHO Minimum (5%)' },
  'Out-of-pocket on health exp': { value: 20, label: 'Benchmark (20%)' },
  'External on health exp': { value: 22.5, label: 'Target (≤22.5%)' },
  'Universal health coverage': { value: 75, label: 'Threshold (75)' },
  'Govern on health exp': { value: 50, label: 'Dominant Share (50%)' },
  'Neonatal mortality rate': { value: 12, label: 'Target (<12 per 1,000)' },
  'Maternal mortality ratio': { value: 70, label: 'Target (<70 per 100,000)' }
};

// Friendly labels for groups
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

// Friendly labels for financing source fields
const FIELD_LABELS: Record<string, string> = {
  'Govern on health exp': 'Government',
  'Out-of-pocket on health exp': 'Out-of-Pocket',
  'External on health exp': 'External',
  'Voluntary Prepayments on health exp': 'Voluntary Prepayment',
  'Other Private on health exp': 'Other Private'
};

// Unit mapping for indicators - determines what unit symbol to display
const INDICATOR_UNITS: Record<string, { symbol: string; position: 'prefix' | 'suffix' }> = {
  // Monetary indicators (per capita values)
  'Gov exp Health per capita': { symbol: '$', position: 'prefix' },
  'Gap for Gov exp Health per capita': { symbol: '$', position: 'prefix' },
  'Expenditure per capita current': { symbol: '$', position: 'prefix' },

  // Percentage indicators
  'Gov exp Health on budget': { symbol: '%', position: 'suffix' },
  'Gov exp Health on GDP': { symbol: '%', position: 'suffix' },
  'Exp Health on GDP': { symbol: '%', position: 'suffix' },
  'Gap Gov exp Health on GDP': { symbol: '%', position: 'suffix' },
  'Out-of-pocket on health exp': { symbol: '%', position: 'suffix' },
  'Govern on health exp': { symbol: '%', position: 'suffix' },
  'External on health exp': { symbol: '%', position: 'suffix' },
  'Voluntary Prepayments on health exp': { symbol: '%', position: 'suffix' },
  'Other Private on health exp': { symbol: '%', position: 'suffix' },

  // Index/Score indicators (no unit, just number)
  'Universal health coverage': { symbol: '', position: 'suffix' },

  // Rate indicators (per 1,000 or per 100,000 - shown as raw numbers, explained in labels)
  'Neonatal mortality rate': { symbol: '', position: 'suffix' },
  'Maternal mortality ratio': { symbol: '', position: 'suffix' }
};

// Helper function to format values with appropriate units
// Format for chart display — keeps decimal precision
const formatValueWithUnit = (value: number, fieldName: string, decimals: number = 1): string => {
  const unitInfo = INDICATOR_UNITS[fieldName];
  if (!unitInfo) {
    return value.toFixed(decimals);
  }

  const formattedValue = value.toFixed(decimals);
  if (unitInfo.position === 'prefix') {
    return `${unitInfo.symbol}${formattedValue}`;
  } else if (unitInfo.symbol) {
    return `${formattedValue}${unitInfo.symbol}`;
  }
  return formattedValue;
};

const ChartPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<[number, number]>([2000, 2023]);
  const [disaggregation, setDisaggregation] = useState<DisaggregationType>('overall');
  const [countryData, setCountryData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedFinancingSource, setSelectedFinancingSource] = useState<string>('Govern on health exp');
  const [fieldMaximums, setFieldMaximums] = useState<Record<string, number>>({});
  const [selectedIncomeGroup, setSelectedIncomeGroup] = useState<string>('all');
  const [selectedSubregion, setSelectedSubregion] = useState<string>('all');
  const [masterData, setMasterData] = useState<any[]>([]); // Store raw data for dynamic highlights

  // Force scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug]);

  useEffect(() => {
    loadChartData();
  }, [slug, disaggregation, selectedIncomeGroup, selectedSubregion]);

  useEffect(() => {
    // Load country comparison data for line charts
    if (chartConfig && chartConfig.chartType === 'line') {
      loadCountryData();
    }
  }, [chartConfig, selectedYear, selectedFinancingSource]);

  const loadCountryData = async () => {
    if (!chartConfig) return;

    try {
      // For multi-line charts, use the selected financing source; otherwise use first yField
      const isMultiLine = Array.isArray(chartConfig.yField) && chartConfig.yField.length > 1;
      const yField = isMultiLine ? selectedFinancingSource : (Array.isArray(chartConfig.yField) ? chartConfig.yField[0] : chartConfig.yField);

      // Fetch master data
      const masterData = await api.getMasterData();

      // Calculate maximums for all relevant fields across ALL years (only once)
      if (Object.keys(fieldMaximums).length === 0) {
        const fieldsToCheck = isMultiLine
          ? (chartConfig.yField as string[])
          : [yField];

        const maximums: Record<string, number> = {};

        fieldsToCheck.forEach(field => {
          const values = masterData
            .map((d: any) => d[field])
            .filter((v: any) => v !== null && v !== undefined && !isNaN(v));

          if (values.length > 0) {
            maximums[field] = Math.max(...values);
          }
        });

        console.log('Calculated field maximums:', maximums);
        setFieldMaximums(maximums);
      }

      // Filter by selected year
      const yearData = masterData.filter((d: any) => d.year === selectedYear);

      // Extract unique years for the year selector
      const yearSet = new Set(masterData.map((d: any) => d.year));
      const years = Array.from(yearSet).sort((a, b) => b - a);
      setAvailableYears(years);

      // Format for bar chart
      const formatted = yearData
        .map((d: any) => ({
          name: d.location,
          value: d[yField],
          income: d.income,
          subregion: d.Subregion
        }))
        .filter((d: any) => d.value !== null && d.value !== undefined)
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

      console.log(`Country comparison data for ${selectedYear}:`, {
        field: yField,
        totalCountries: formatted.length,
        topCountry: formatted[0],
        bottomCountry: formatted[formatted.length - 1],
        maxValue: fieldMaximums[yField]
      });

      setCountryData(formatted);
    } catch (error) {
      console.error('Error loading country data:', error);
    }
  };

  const loadChartData = async () => {
    if (!slug) return;

    setLoading(true);
    const config = getChartBySlug(slug);

    if (!config) {
      setLoading(false);
      return;
    }

    setChartConfig(config);

    try {
      // Fetch data from the endpoint specified in chart config
      let rawData: any;
      const yFields = Array.isArray(config.yField) ? config.yField : [config.yField];
      const isMultiLine = yFields.length > 1;

      // For line charts, always fetch master data for dynamic highlights
      if (config.chartType === 'line') {
        const masterRawData = await api.getMasterData();
        setMasterData(masterRawData); // Store for dynamic highlights
      }

      // For line charts with multiple yFields, fetch master data and aggregate manually
      if (config.chartType === 'line' && isMultiLine) {
        console.log('Multi-line chart detected, fetching master data for fields:', yFields, 'disaggregation:', disaggregation);
        rawData = await api.getMasterData();

        // Apply income group filter if selected
        if (disaggregation === 'income' && selectedIncomeGroup !== 'all') {
          rawData = rawData.filter((row: any) => row.income === selectedIncomeGroup);
          console.log(`Filtered to ${selectedIncomeGroup} income countries:`, rawData.length, 'rows');
        }

        // Apply subregion filter if selected
        if (disaggregation === 'subregion' && selectedSubregion !== 'all') {
          rawData = rawData.filter((row: any) => row.Subregion === selectedSubregion);
          console.log(`Filtered to ${selectedSubregion}:`, rawData.length, 'rows');
        }

        if (disaggregation === 'overall' || disaggregation === 'income' || disaggregation === 'subregion') {
          // Aggregate by year - only include countries that have ALL fields to ensure sum = 100%
          const yearMap = new Map<number, { rows: any[]; sums: { [key: string]: number }; count: number }>();

          rawData.forEach((row: any) => {
            const year = row.year;
            if (!year) return;

            // Check if this row has ALL the financing fields we need
            const hasAllFields = yFields.every(field => {
              const value = row[field];
              return value !== null && value !== undefined && !isNaN(value);
            });

            if (hasAllFields) {
              if (!yearMap.has(year)) {
                yearMap.set(year, { rows: [], sums: {}, count: 0 });
              }

              const yearData = yearMap.get(year)!;
              yearData.rows.push(row);
              yearData.count += 1;

              yFields.forEach(field => {
                if (!yearData.sums[field]) {
                  yearData.sums[field] = 0;
                }
                yearData.sums[field] += row[field];
              });
            }
          });

          // Convert to array format with simple averages
          const processedData = Array.from(yearMap.entries())
            .map(([year, yearData]) => {
              const dataPoint: any = { year };

              if (yearData.count > 0) {
                yFields.forEach(field => {
                  dataPoint[field] = yearData.sums[field] / yearData.count;
                });

                // Calculate sum for verification
                const sum = yFields.reduce((acc, field) => acc + (dataPoint[field] || 0), 0);
                console.log(`Year ${year}: Sum = ${sum.toFixed(1)}% (${yearData.count} countries)`);
              }

              return dataPoint;
            })
            .sort((a, b) => a.year - b.year);

          console.log('Processed multi-line data (first 3 years):', processedData.slice(0, 3));
          setData(processedData);
        }
      } else if (config.chartType === 'line') {
        // Single yField line chart
        const yField = yFields[0];

        // If filters are active, use master data and apply filters
        if ((disaggregation === 'income' && selectedIncomeGroup !== 'all') ||
            (disaggregation === 'subregion' && selectedSubregion !== 'all')) {
          console.log('Fetching master data for filtered single-line chart');
          rawData = await api.getMasterData();

          // Apply income group filter if selected
          if (disaggregation === 'income' && selectedIncomeGroup !== 'all') {
            rawData = rawData.filter((row: any) => row.income === selectedIncomeGroup);
            console.log(`Filtered to ${selectedIncomeGroup} income countries:`, rawData.length, 'rows');
          }

          // Apply subregion filter if selected
          if (disaggregation === 'subregion' && selectedSubregion !== 'all') {
            rawData = rawData.filter((row: any) => row.Subregion === selectedSubregion);
            console.log(`Filtered to ${selectedSubregion}:`, rawData.length, 'rows');
          }

          // Aggregate by year
          const yearMap = new Map<number, { sum: number; count: number }>();
          rawData.forEach((row: any) => {
            const year = row.year;
            const value = row[yField];
            if (year && value !== null && value !== undefined && !isNaN(value)) {
              if (!yearMap.has(year)) {
                yearMap.set(year, { sum: 0, count: 0 });
              }
              const yearData = yearMap.get(year)!;
              yearData.sum += value;
              yearData.count += 1;
            }
          });

          const processedData = Array.from(yearMap.entries())
            .map(([year, data]) => ({
              year,
              value: data.count > 0 ? data.sum / data.count : null
            }))
            .sort((a, b) => a.year - b.year);

          console.log('Processed filtered single-line data:', processedData.slice(0, 3));
          setData(processedData);
        } else {
          // Use aggregate endpoint for non-filtered data
          let endpoint: string;

          if (disaggregation === 'overall') {
            endpoint = `/api/aggregate/by-year?field=${encodeURIComponent(yField)}`;
          } else {
            endpoint = `/api/aggregate/by-year?field=${encodeURIComponent(yField)}&groupBy=${disaggregation}`;
          }

          console.log('Fetching from endpoint:', endpoint, 'with disaggregation:', disaggregation);
          rawData = await api.fetchFromEndpoint(endpoint);

          // Data is already in correct format from /api/aggregate/by-year
          console.log('Line chart data received:', rawData.slice(0, 3));
          if (rawData[0]) {
            console.log('First data point keys:', Object.keys(rawData[0]));
          }
          setData(rawData);
        }
      } else if (config.dataEndpoint) {
        // For non-line charts, use configured endpoint
        console.log('Fetching from endpoint:', config.dataEndpoint);
        rawData = await api.fetchFromEndpoint(config.dataEndpoint);
        const processedData = processChartData(rawData, config);
        setData(processedData);
      } else {
        // Fallback to master data if no specific endpoint
        rawData = await api.getMasterData();
        const processedData = processChartData(rawData, config);
        setData(processedData);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (rawData: any, config: ChartConfig) => {
    // Check if data is already aggregated (from /api/aggregate/by-year)
    if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].year !== undefined) {
      // Data is already aggregated, just filter by time range
      let filtered = rawData.filter((d: any) =>
        d.year >= timeRange[0] && d.year <= timeRange[1]
      );

      // For aggregate endpoint data that's already in the right format
      if (config.dataEndpoint?.includes('/api/aggregate/by-year')) {
        // Data is in format: [{year: 2000, value: 51}, ...]
        // or grouped format: [{year: 2000, Low: 8, "Lower-middle": 7}, ...]
        return filtered;
      }

      // For indicator endpoint data (e.g., from /api/indicators/...)
      // Data may be in format: [{year: 2000, income: "Low", countries_below_threshold: 5}, ...]
      if (config.chartType === 'line') {
        // Handle multiple yFields (for charts with multiple lines)
        const yFields = Array.isArray(config.yField) ? config.yField : [config.yField];

        // Group by year and aggregate
        const byYear = filtered.reduce((acc: any, d: any) => {
          if (!acc[d.year]) {
            acc[d.year] = { year: d.year };
            yFields.forEach(field => {
              acc[d.year][field] = 0;
              acc[d.year][`${field}_count`] = 0;
            });
          }

          yFields.forEach(field => {
            if (d[field] !== null && d[field] !== undefined) {
              acc[d.year][field] += d[field];
              acc[d.year][`${field}_count`] += 1;
            }
          });

          return acc;
        }, {});

        // Calculate averages and format
        // Use 1 decimal for percentages and indices, 2 for currency
        const decimals = config.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
        return Object.values(byYear).map((item: any) => {
          const result: any = { year: item.year };
          yFields.forEach(field => {
            const count = item[`${field}_count`];
            result[field] = count > 0 ? Number((item[field] / count).toFixed(decimals)) : null;
          });
          return result;
        }).sort((a: any, b: any) => a.year - b.year);
      }
    }

    // Handle master dataset for bar charts (country comparison)
    if (Array.isArray(rawData) && rawData.length > 0 &&
        rawData[0].location !== undefined && rawData[0].year !== undefined &&
        config.chartType === 'bar') {

      // Get latest year
      const latestYear = Math.max(...rawData.map((d: any) => d.year));

      // Filter to latest year
      const latestData = rawData.filter((d: any) => d.year === latestYear);

      // Extract and format for bar chart
      const yField = Array.isArray(config.yField) ? config.yField[0] : config.yField;

      return latestData
        .map((d: any) => ({
          name: d.location || d[config.xField],
          value: d[yField],
          income: d.income,
          subregion: d.Subregion
        }))
        .filter((d: any) => d.value !== null && d.value !== undefined)
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
        .slice(0, 54); // All countries
    }

    // Fallback: if data format is unexpected, return as-is
    console.warn('Unexpected data format for chart:', config.slug);
    return Array.isArray(rawData) ? rawData : [];
  };

  const getGroupColor = (key: string) => {
    // Check if it's a composite key (e.g., "Low_Govern on health exp")
    if (key.includes('_')) {
      const parts = key.split('_');
      const groupPart = parts[0];
      // For composite keys from disaggregated multi-line charts, use group color
      if (INCOME_COLORS[groupPart]) {
        return INCOME_COLORS[groupPart];
      }
      if (SUBREGION_COLORS[groupPart]) {
        return SUBREGION_COLORS[groupPart];
      }
    }

    // Check if it's a field name (for multi-line charts with multiple yFields)
    if (FIELD_COLORS[key]) {
      return FIELD_COLORS[key];
    }
    // Check for disaggregation groups
    if (disaggregation === 'income') {
      return INCOME_COLORS[key] || '#94a3b8';
    } else if (disaggregation === 'subregion') {
      return SUBREGION_COLORS[key] || '#94a3b8';
    }
    return '#3b82f6';
  };

  const getGroupLabel = (key: string) => {
    // Check if it's a composite key (e.g., "Low_Govern on health exp")
    if (key.includes('_')) {
      const parts = key.split('_');
      const groupPart = parts[0];
      const fieldPart = parts.slice(1).join('_');

      const groupLabel = GROUP_LABELS[groupPart] || groupPart;
      const fieldLabel = FIELD_LABELS[fieldPart] || fieldPart;

      return `${groupLabel} - ${fieldLabel}`;
    }

    return FIELD_LABELS[key] || GROUP_LABELS[key] || key.replace(/_/g, ' ');
  };

  const getThresholds = (yField: string, disaggregation: DisaggregationType, isBarChart: boolean = false): Array<{
    value: number;
    label: string;
    color: string;
    strokeDasharray?: string;
  }> => {
    const threshold = THRESHOLDS[yField];
    if (!threshold) return [];

    // Check if it's income-specific thresholds (has nested structure)
    if (typeof threshold === 'object' && 'Low' in threshold) {
      // For bar chart (country comparison), ALWAYS show all three thresholds regardless of filter
      if (isBarChart) {
        return [
          {
            value: threshold['Low'].value,
            label: threshold['Low'].label,
            color: INCOME_COLORS['Low'],
            strokeDasharray: '5 5'
          },
          {
            value: threshold['Lower-middle'].value,
            label: threshold['Lower-middle'].label,
            color: INCOME_COLORS['Lower-middle'],
            strokeDasharray: '5 5'
          },
          {
            value: threshold['Upper-middle'].value,
            label: threshold['Upper-middle'].label,
            color: INCOME_COLORS['Upper-middle'],
            strokeDasharray: '5 5'
          }
        ];
      }
      // For line charts, only show threshold lines when a specific income group is selected (not "All")
      if (selectedIncomeGroup !== 'all') {
        const incomeKey = selectedIncomeGroup as 'Low' | 'Lower-middle' | 'Upper-middle';
        if (threshold[incomeKey]) {
          return [{
            value: threshold[incomeKey].value,
            label: threshold[incomeKey].label,
            color: INCOME_COLORS[incomeKey] || '#ef4444',
            strokeDasharray: '5 5'
          }];
        }
      }
      // When "All" is selected on line chart, don't show any threshold lines
      return [];
    } else {
      // Single threshold for all (non-income-specific indicators)
      const singleThreshold = threshold as { value: number; label: string };
      return [{ value: singleThreshold.value, label: singleThreshold.label, color: '#ef4444', strokeDasharray: '5 5' }];
    }
  };

  // Calculate dynamic highlights for the main chart
  const mainChartHighlights = useMemo(() => {
    if (!chartConfig || !masterData || masterData.length === 0) return [];

    const yField = Array.isArray(chartConfig.yField) ? chartConfig.yField[0] : chartConfig.yField;

    // Filter master data based on current disaggregation selections
    let filteredData = [...masterData];

    // Apply income group filter if selected
    if (disaggregation === 'income' && selectedIncomeGroup !== 'all') {
      filteredData = filteredData.filter((row: any) => row.income === selectedIncomeGroup);
    }

    // Apply subregion filter if selected
    if (disaggregation === 'subregion' && selectedSubregion !== 'all') {
      filteredData = filteredData.filter((row: any) => row.Subregion === selectedSubregion);
    }

    if (filteredData.length === 0) return [];

    // Aggregate filtered data by year for line chart highlights
    const yearMap = new Map<number, { sum: number; count: number }>();
    filteredData.forEach((row: any) => {
      const year = row.year;
      const value = row[yField];
      if (year && value !== null && value !== undefined && !isNaN(value)) {
        if (!yearMap.has(year)) {
          yearMap.set(year, { sum: 0, count: 0 });
        }
        const yearData = yearMap.get(year)!;
        yearData.sum += value;
        yearData.count += 1;
      }
    });

    const aggregatedData = Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        value: data.count > 0 ? data.sum / data.count : null,
        [yField]: data.count > 0 ? data.sum / data.count : null
      }))
      .filter(d => d.value !== null)
      .sort((a, b) => a.year - b.year);

    if (aggregatedData.length === 0) return [];

    // Get threshold if applicable
    const thresholdConfig = THRESHOLDS[yField];
    let threshold: number | undefined;

    if (thresholdConfig && typeof thresholdConfig === 'object' && 'value' in thresholdConfig) {
      threshold = (thresholdConfig as { value: number; label: string }).value;
    }

    // Determine unit based on field
    let unit = '';
    if (yField.includes('GDP') || yField.includes('budget') || yField.includes('exp') || yField.includes('health exp')) {
      unit = '%';
    } else if (yField.includes('per capita') || yField.includes('Per Capita')) {
      unit = ' USD';
    }

    // Determine threshold direction
    const thresholdDir: 'above' | 'below' =
      yField.includes('Out-of-pocket') || yField.includes('External on health') || yField.includes('mortality')
        ? 'below'
        : 'above';

    // Generate highlights based on chart type
    if (chartConfig.chartType === 'line') {
      return generateLineChartHighlights(aggregatedData, yField, threshold, unit, filteredData, thresholdDir);
    }

    return [];
  }, [chartConfig, masterData, disaggregation, selectedIncomeGroup, selectedSubregion]);

  // Calculate dynamic highlights for country comparison
  const countryComparisonHighlights = useMemo(() => {
    if (!chartConfig || !countryData || countryData.length === 0) return [];

    const isMultiLine = Array.isArray(chartConfig.yField) && chartConfig.yField.length > 1;
    const yField = isMultiLine ? selectedFinancingSource : (Array.isArray(chartConfig.yField) ? chartConfig.yField[0] : chartConfig.yField);

    // Get threshold if applicable
    const thresholdConfig = THRESHOLDS[yField];
    let threshold: number | undefined;

    if (thresholdConfig && typeof thresholdConfig === 'object' && 'value' in thresholdConfig) {
      threshold = (thresholdConfig as { value: number; label: string }).value;
    }

    // Determine unit based on field
    let unit = '';
    if (yField.includes('GDP') || yField.includes('budget') || yField.includes('exp') || yField.includes('health exp')) {
      unit = '%';
    } else if (yField.includes('per capita') || yField.includes('Per Capita')) {
      unit = ' USD';
    }

    return generateCountryComparisonHighlights(countryData, yField, threshold, unit, selectedYear);
  }, [chartConfig, countryData, selectedYear, selectedFinancingSource]);

  const renderDisaggregationSelector = () => {
    // Only show for line charts
    if (!chartConfig || chartConfig.chartType !== 'line') return null;

    const isMultiLine = Array.isArray(chartConfig.yField) && chartConfig.yField.length > 1;

    // For multi-line charts (Health Financing Structure), show filter dropdowns
    if (isMultiLine) {
      return (
        <div className="disaggregation-selector">
          <button
            className={`disagg-btn ${disaggregation === 'overall' ? 'active' : ''}`}
            onClick={() => {
              setDisaggregation('overall');
              setSelectedIncomeGroup('all');
              setSelectedSubregion('all');
            }}
          >
            All Countries
          </button>
          <button
            className={`disagg-btn ${disaggregation === 'income' ? 'active' : ''}`}
            onClick={() => {
              setDisaggregation('income');
              setSelectedSubregion('all');
            }}
          >
            By Income Group
          </button>
          <button
            className={`disagg-btn ${disaggregation === 'subregion' ? 'active' : ''}`}
            onClick={() => {
              setDisaggregation('subregion');
              setSelectedIncomeGroup('all');
            }}
          >
            By Sub-region
          </button>

          {/* Income Group Dropdown */}
          {disaggregation === 'income' && (
            <div className="filter-dropdown" style={{ marginLeft: '1rem' }}>
              <label htmlFor="income-filter" style={{ marginRight: '0.5rem', fontSize: '14px' }}>Income Group: </label>
              <select
                id="income-filter"
                value={selectedIncomeGroup}
                onChange={(e) => setSelectedIncomeGroup(e.target.value)}
                className="year-select-dropdown"
              >
                <option value="all">All Income Groups</option>
                <option value="Low">Low Income</option>
                <option value="Lower-middle">Lower-Middle Income</option>
                <option value="Upper-middle">Upper-Middle Income</option>
              </select>
            </div>
          )}

          {/* Subregion Dropdown */}
          {disaggregation === 'subregion' && (
            <div className="filter-dropdown" style={{ marginLeft: '1rem' }}>
              <label htmlFor="subregion-filter" style={{ marginRight: '0.5rem', fontSize: '14px' }}>Sub-region: </label>
              <select
                id="subregion-filter"
                value={selectedSubregion}
                onChange={(e) => setSelectedSubregion(e.target.value)}
                className="year-select-dropdown"
              >
                <option value="all">All Sub-regions</option>
                <option value="Northern Africa">Northern Africa</option>
                <option value="Western Africa">Western Africa</option>
                <option value="Eastern Africa">Eastern Africa</option>
                <option value="Central Africa">Central Africa</option>
                <option value="Southern Africa">Southern Africa</option>
              </select>
            </div>
          )}
        </div>
      );
    }

    // For single-line charts, show disaggregation buttons with optional filters
    return (
      <div className="disaggregation-selector">
        <button
          className={`disagg-btn ${disaggregation === 'overall' ? 'active' : ''}`}
          onClick={() => {
            setDisaggregation('overall');
            setSelectedIncomeGroup('all');
            setSelectedSubregion('all');
          }}
        >
          Regional Average
        </button>
        <button
          className={`disagg-btn ${disaggregation === 'income' ? 'active' : ''}`}
          onClick={() => {
            setDisaggregation('income');
            setSelectedSubregion('all');
            if (selectedIncomeGroup === 'all') {
              // Keep showing all income groups as separate lines
            }
          }}
        >
          By Income Group
        </button>
        <button
          className={`disagg-btn ${disaggregation === 'subregion' ? 'active' : ''}`}
          onClick={() => {
            setDisaggregation('subregion');
            setSelectedIncomeGroup('all');
            if (selectedSubregion === 'all') {
              // Keep showing all subregions as separate lines
            }
          }}
        >
          By Sub-region
        </button>

        {/* Income Group Dropdown - optional filter to show only one income group */}
        {disaggregation === 'income' && (
          <div className="filter-dropdown" style={{ marginLeft: '1rem' }}>
            <label htmlFor="income-filter-single" style={{ marginRight: '0.5rem', fontSize: '14px' }}>Filter: </label>
            <select
              id="income-filter-single"
              value={selectedIncomeGroup}
              onChange={(e) => setSelectedIncomeGroup(e.target.value)}
              className="year-select-dropdown"
            >
              <option value="all">All Income Groups</option>
              <option value="Low">Low Income</option>
              <option value="Lower-middle">Lower-Middle Income</option>
              <option value="Upper-middle">Upper-Middle Income</option>
            </select>
          </div>
        )}

        {/* Subregion Dropdown - optional filter to show only one subregion */}
        {disaggregation === 'subregion' && (
          <div className="filter-dropdown" style={{ marginLeft: '1rem' }}>
            <label htmlFor="subregion-filter-single" style={{ marginRight: '0.5rem', fontSize: '14px' }}>Filter: </label>
            <select
              id="subregion-filter-single"
              value={selectedSubregion}
              onChange={(e) => setSelectedSubregion(e.target.value)}
              className="year-select-dropdown"
            >
              <option value="all">All Sub-regions</option>
              <option value="Northern Africa">Northern Africa</option>
              <option value="Western Africa">Western Africa</option>
              <option value="Eastern Africa">Eastern Africa</option>
              <option value="Central Africa">Central Africa</option>
              <option value="Southern Africa">Southern Africa</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  const renderChart = () => {
    if (!chartConfig || data.length === 0) return null;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

    switch (chartConfig.chartType) {
      case 'line':
        // Handle multiple y-fields (for multi-line charts)
        const yFields = Array.isArray(chartConfig.yField) ? chartConfig.yField : [chartConfig.yField];

        // Check if data has income/subregion grouping (multiple series per year)
        const firstDataPoint = data[0];
        const hasGrouping = firstDataPoint && Object.keys(firstDataPoint).some(
          key => !['year', 'value', 'count', ...yFields].includes(key) && typeof firstDataPoint[key] === 'number'
        );

        console.log('Rendering line chart:', {
          disaggregation,
          hasGrouping,
          firstDataPoint,
          yFields,
          allKeys: firstDataPoint ? Object.keys(firstDataPoint) : []
        });

        if (hasGrouping) {
          // Data is grouped (e.g., by income: {year: 2000, Low: 8, "Lower-middle": 7, "Upper-middle": 3})
          const groupKeys = Object.keys(firstDataPoint).filter(
            key => !['year', 'count'].includes(key) && typeof firstDataPoint[key] === 'number'
          );
          console.log('Group keys detected:', groupKeys);

          // Get thresholds for reference lines
          const thresholds = getThresholds(yFields[0], disaggregation);

          // Calculate Y-axis domain to include thresholds
          const calculateDomain = () => {
            if (thresholds.length === 0) return ['auto', 'auto'];

            // Get all data values
            const allValues: number[] = [];
            data.forEach((point: any) => {
              groupKeys.forEach(key => {
                if (typeof point[key] === 'number') {
                  allValues.push(point[key]);
                }
              });
            });

            const maxThreshold = Math.max(...thresholds.map(t => t.value));
            const minThreshold = Math.min(...thresholds.map(t => t.value));
            const maxData = allValues.length > 0 ? Math.max(...allValues) : 0;
            const minData = allValues.length > 0 ? Math.min(...allValues) : 0;

            const yMax = Math.max(maxData, maxThreshold) * 1.1; // 10% padding
            const yMin = Math.min(minData, minThreshold) * 0.9; // 10% padding (or reduce if negative)

            return [Math.max(0, yMin), yMax];
          };

          return (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#94a3b8' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#94a3b8' }}
                  domain={calculateDomain()}
                  tickFormatter={(value) => {
                    const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                    return typeof value === 'number' ? formatValueWithUnit(value, yFields[0], decimals) : value;
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
                    const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                    const formattedValue = typeof value === 'number' ? formatValueWithUnit(value, yFields[0], decimals) : value;
                    return [formattedValue, getGroupLabel(name)];
                  }}
                />
                <Legend formatter={(value: string) => getGroupLabel(value)} />
                {/* Reference lines for thresholds */}
                {thresholds.map((threshold, index) => (
                  <ReferenceLine
                    key={`threshold-${index}`}
                    y={threshold.value}
                    stroke={threshold.color}
                    strokeDasharray={threshold.strokeDasharray || '5 5'}
                    strokeWidth={2}
                    label={{
                      value: threshold.label,
                      position: 'insideTopRight',
                      fill: threshold.color,
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
                ))}
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
        } else if (yFields.length > 1) {
          // Multiple y-fields (multi-line chart)
          // Get thresholds for reference lines
          const thresholds = getThresholds(yFields[0], disaggregation);

          // Calculate Y-axis domain to include thresholds
          const calculateDomain = () => {
            if (thresholds.length === 0) return ['auto', 'auto'];

            // Get all data values from all y-fields
            const allValues: number[] = [];
            data.forEach((point: any) => {
              yFields.forEach(field => {
                if (typeof point[field] === 'number') {
                  allValues.push(point[field]);
                }
              });
            });

            const maxThreshold = Math.max(...thresholds.map(t => t.value));
            const minThreshold = Math.min(...thresholds.map(t => t.value));
            const maxData = allValues.length > 0 ? Math.max(...allValues) : 0;
            const minData = allValues.length > 0 ? Math.min(...allValues) : 0;

            const yMax = Math.max(maxData, maxThreshold) * 1.1; // 10% padding
            const yMin = Math.min(minData, minThreshold) * 0.9; // 10% padding

            return [Math.max(0, yMin), yMax];
          };

          return (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey={chartConfig.xField}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#94a3b8' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#94a3b8' }}
                  domain={calculateDomain()}
                  tickFormatter={(value) => {
                    const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                    return typeof value === 'number' ? formatValueWithUnit(value, yFields[0], decimals) : value;
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
                    const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                    const formattedValue = typeof value === 'number' ? formatValueWithUnit(value, yFields[0], decimals) : value;
                    return [formattedValue, getGroupLabel(name)];
                  }}
                />
                <Legend formatter={(value: string) => getGroupLabel(value)} />
                {/* Reference lines for thresholds */}
                {thresholds.map((threshold, index) => (
                  <ReferenceLine
                    key={`threshold-${index}`}
                    y={threshold.value}
                    stroke={threshold.color}
                    strokeDasharray={threshold.strokeDasharray || '5 5'}
                    strokeWidth={2}
                    label={{
                      value: threshold.label,
                      position: 'insideTopRight',
                      fill: threshold.color,
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
                ))}
                {yFields.map((field, index) => (
                  <Line
                    key={field}
                    type="monotone"
                    dataKey={field}
                    stroke={getGroupColor(field)}
                    strokeWidth={2}
                    dot={{ fill: getGroupColor(field), strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5 }}
                    name={field}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          );
        } else {
          // Single y-field - check if data uses "value" or the field name
          const dataKey = firstDataPoint.value !== undefined ? 'value' : yFields[0];

          // Get thresholds for reference lines
          const thresholds = getThresholds(yFields[0], disaggregation);

          // Calculate Y-axis domain to include thresholds
          const calculateDomain = () => {
            if (thresholds.length === 0) return ['auto', 'auto'];

            // Get all data values
            const allValues: number[] = data
              .map((point: any) => point[dataKey])
              .filter((val: any) => typeof val === 'number');

            const maxThreshold = Math.max(...thresholds.map(t => t.value));
            const minThreshold = Math.min(...thresholds.map(t => t.value));
            const maxData = allValues.length > 0 ? Math.max(...allValues) : 0;
            const minData = allValues.length > 0 ? Math.min(...allValues) : 0;

            const yMax = Math.max(maxData, maxThreshold) * 1.1; // 10% padding
            const yMin = Math.min(minData, minThreshold) * 0.9; // 10% padding

            return [Math.max(0, yMin), yMax];
          };

          return (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfig.xField} />
                <YAxis
                  domain={calculateDomain()}
                  tickFormatter={(value) => {
                    const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                    return typeof value === 'number' ? formatValueWithUnit(value, yFields[0], decimals) : value;
                  }}
                />
                <Tooltip
                  formatter={(value: any) => {
                    const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                    return typeof value === 'number' ? formatValueWithUnit(value, yFields[0], decimals) : value;
                  }}
                />
                <Legend />
                {/* Reference lines for thresholds */}
                {thresholds.map((threshold, index) => (
                  <ReferenceLine
                    key={`threshold-${index}`}
                    y={threshold.value}
                    stroke={threshold.color}
                    strokeDasharray={threshold.strokeDasharray || '5 5'}
                    strokeWidth={2}
                    label={{
                      value: threshold.label,
                      position: 'insideTopRight',
                      fill: threshold.color,
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
                ))}
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name={yFields[0]}
                />
              </LineChart>
            </ResponsiveContainer>
          );
        }

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={150} />
              <YAxis
                tickFormatter={(value) => {
                  const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                  const yField = chartConfig.yField as string;
                  return typeof value === 'number' ? formatValueWithUnit(value, yField, decimals) : value;
                }}
              />
              <Tooltip
                formatter={(value: any) => {
                  const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                  const yField = chartConfig.yField as string;
                  return typeof value === 'number' ? formatValueWithUnit(value, yField, decimals) : value;
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name={chartConfig.yField as string} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => {
                  const value = typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value;
                  return `${entry.name}: ${value}%`;
                }}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => {
                  return typeof value === 'number' ? `${value.toFixed(1)}%` : value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <p>Chart type not yet implemented</p>;
    }
  };

  const renderCountryComparison = () => {
    if (!chartConfig || chartConfig.chartType !== 'line' || countryData.length === 0) {
      return null;
    }

    const isMultiLine = Array.isArray(chartConfig.yField) && chartConfig.yField.length > 1;
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

    return (
      <div className="country-comparison-section">
        <div className="country-comparison-header">
          <h3>Country Comparison</h3>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {/* Year Selector */}
            <div className="year-selector">
              <label htmlFor="year-select">Year: </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="year-select-dropdown"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Financing Source Selector - only for multi-line charts */}
            {isMultiLine && (
              <div className="year-selector">
                <label htmlFor="source-select">Financing Source: </label>
                <select
                  id="source-select"
                  value={selectedFinancingSource}
                  onChange={(e) => setSelectedFinancingSource(e.target.value)}
                  className="year-select-dropdown"
                >
                  {(chartConfig.yField as string[]).map(field => (
                    <option key={field} value={field}>
                      {FIELD_LABELS[field] || field}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Income Group Legend */}
        <div className="income-legend">
          <span className="legend-label">Income Groups:</span>
          {Object.entries(INCOME_COLORS).map(([group, color]) => (
            <div key={group} className="legend-item-inline">
              <span className="legend-box" style={{ backgroundColor: color }}></span>
              <span className="legend-text">{GROUP_LABELS[group]}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={Math.max(400, countryData.length * 18)}>
          <BarChart
            data={countryData}
            layout="vertical"
            margin={{ top: 30, right: 10, left: 0, bottom: 10 }}
            barSize={12}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              domain={[0, (() => {
                const yField = isMultiLine ? selectedFinancingSource : (Array.isArray(chartConfig.yField) ? chartConfig.yField[0] : chartConfig.yField);
                return fieldMaximums[yField] ? Math.ceil(fieldMaximums[yField] * 1.05) : 'auto';
              })()]}
              tickFormatter={(value) => {
                const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                const yField = isMultiLine ? selectedFinancingSource : (Array.isArray(chartConfig.yField) ? chartConfig.yField[0] : chartConfig.yField);
                return typeof value === 'number' ? formatValueWithUnit(value, yField, decimals) : value;
              }}
              label={isMultiLine ? { value: '% of health expenditure', position: 'insideBottom', offset: -5, fontSize: 12 } : undefined}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={(props: any) => {
                const { x, y, payload } = props;
                const SHORT_NAMES: Record<string, string> = {
                  'Democratic Republic of the Congo': 'DR Congo',
                  'United Republic of Tanzania': 'Tanzania',
                  'Central African Republic': 'Central African Rep.',
                  'Sao Tome and Principe': 'Sao Tome & Principe',
                  'C\u00f4te d\u2019Ivoire': "Cote d'Ivoire",
                  'C\u00f4te d\'Ivoire': "Cote d'Ivoire",
                };
                const label = SHORT_NAMES[payload.value] || payload.value;
                return (
                  <text x={x} y={y} dy={3} textAnchor="end" fontSize={9} fill="#374151">
                    {label}
                  </text>
                );
              }}
              width={160}
              interval={0}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value: any, name: any, props: any) => {
                const income = props.payload?.income;
                const subregion = props.payload?.subregion;
                const labelText = isMultiLine ? `${FIELD_LABELS[selectedFinancingSource] || selectedFinancingSource}` : 'Value';
                const decimals = chartConfig?.slug === 'government-health-expenditure-per-capita' ? 2 : 1;
                const yField = isMultiLine ? selectedFinancingSource : (Array.isArray(chartConfig.yField) ? chartConfig.yField[0] : chartConfig.yField);
                const formattedValue = typeof value === 'number' ? formatValueWithUnit(value, yField, decimals) : value;
                return [
                  `${formattedValue}${income ? ` (${income}, ${subregion})` : ''}`,
                  labelText
                ];
              }}
            />
            {/* Reference lines for thresholds (income-specific or universal) */}
            {chartConfig && (() => {
              // For multi-line charts, use selectedFinancingSource; otherwise use first yField
              const fieldForThreshold = isMultiLine ? selectedFinancingSource : (Array.isArray(chartConfig.yField) ? chartConfig.yField[0] : chartConfig.yField);
              const thresholds = getThresholds(fieldForThreshold, 'income', true);
              // Adjust positioning based on number of thresholds
              const xOffsets = thresholds.length === 3
                ? [-50, 35, 0]  // Income-specific: Low far left, Lower-Middle to right, Upper-Middle centered
                : [0];           // Single threshold: centered

              return thresholds.map((thresh, idx) => (
                <ReferenceLine
                  key={`bar-threshold-${idx}`}
                  x={thresh.value}
                  stroke={thresh.color}
                  strokeDasharray={thresh.strokeDasharray}
                  strokeWidth={3}
                  label={{
                    value: thresh.label,
                    position: 'top' as any,
                    fontSize: 9,
                    fill: thresh.color,
                    fontWeight: 600,
                    dx: xOffsets[idx] || 0
                  }}
                />
              ));
            })()}
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              name={isMultiLine ? (FIELD_LABELS[selectedFinancingSource] || selectedFinancingSource) : 'Value'}
            >
              {countryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={INCOME_COLORS[entry.income] || '#3b82f6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Chart Controls for Country Comparison */}
        <div className="chart-controls" style={{ marginTop: '1rem' }}>
          <button onClick={() => {
            const chartElement = document.querySelector('.country-comparison-section .recharts-wrapper');
            if (!chartElement) {
              alert('Chart not found!');
              return;
            }

            html2canvas(chartElement as HTMLElement, {
              backgroundColor: '#ffffff',
              scale: 2,
              logging: false
            }).then(canvas => {
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${slug}-country-comparison-${selectedYear}.png`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }
              }, 'image/png');
            }).catch(err => {
              console.error('Error downloading chart:', err);
              alert('Failed to download chart. Please try again.');
            });
          }} className="btn-download-chart">
            📊 Download Chart (PNG)
          </button>
          <button onClick={() => {
            if (countryData.length === 0) return;

            const csv = [
              Object.keys(countryData[0]).join(','),
              ...countryData.map(row => Object.values(row).join(','))
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${slug}-country-comparison-${selectedYear}.csv`;
            a.click();
          }} className="btn-download">
            📥 Download Data (CSV)
          </button>
          <button onClick={handleShare} className="btn-share">🔗 Share</button>
          <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
        </div>
      </div>
    );
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
    a.download = `${slug}-data.csv`;
    a.click();
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
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
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = embedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Embed code copied to clipboard!');
    }
  };

  const handleDownloadChart = async () => {
    const chartElement = document.querySelector('.chart-visualization');
    if (!chartElement) {
      alert('Chart not found!');
      return;
    }

    try {
      const canvas = await html2canvas(chartElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${slug}-chart.png`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error downloading chart:', err);
      alert('Failed to download chart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="chart-page loading">
        <div className="loading-spinner">Loading chart...</div>
      </div>
    );
  }

  if (!chartConfig) {
    return (
      <div className="chart-page not-found">
        <h1>Chart not found</h1>
        <p>The chart you're looking for doesn't exist.</p>
        <Link to="/charts">Browse all charts</Link>
      </div>
    );
  }

  return (
    <div className="chart-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/charts">Charts</Link> / {chartConfig.title}
      </div>

      {/* Chart Header */}
      <div className="chart-header">
        <div className="chart-tags">
          <span className="category-tag">{getTopicById(chartConfig.topicId)?.shortTitle || chartConfig.topicId}</span>
          <span className="indicator-tag">{chartConfig.indicatorNumber}</span>
        </div>
        <h1>{chartConfig.title}</h1>
        <p className="subtitle">{chartConfig.subtitle}</p>
      </div>

      {/* About This Indicator */}
      <div className="narrative-section">
        <h2>About This Indicator</h2>
        <div className="narrative-content">
          {chartConfig.narrative.split('\n\n').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
        <h3 className="insights-heading">Key Points</h3>
        <ul className="insights-list">
          {chartConfig.insights.map((insight, idx) => (
            <li key={idx}>{insight}</li>
          ))}
        </ul>
      </div>

      {/* Data Visualization Section */}
      <div className="data-section-header">
        <h2>Data & Trends</h2>
        <p className="section-subtitle">Explore the data across different dimensions and timeframes</p>
      </div>

      {/* Chart Container */}
      <div className="chart-container-main">
        {/* Disaggregation Selector */}
        {renderDisaggregationSelector()}

        {/* Dynamic Highlights for Main Chart */}
        {mainChartHighlights.length > 0 && (
          <DynamicHighlights
            highlights={mainChartHighlights}
            title="Key Statistics"
          />
        )}

        <div className="chart-visualization">
          {renderChart()}
        </div>

        {/* Chart Controls */}
        <div className="chart-controls">
          <button onClick={handleDownloadChart} className="btn-download-chart">
            📊 Download Chart (PNG)
          </button>
          <button onClick={handleDownloadCSV} className="btn-download">
            📥 Download Data (CSV)
          </button>
          <button onClick={handleShare} className="btn-share">🔗 Share</button>
          <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
        </div>

        {/* Dynamic Highlights for Country Comparison */}
        {countryComparisonHighlights.length > 0 && countryData.length > 0 && (
          <DynamicHighlights
            highlights={countryComparisonHighlights}
            title={`Country Comparison - ${selectedYear}`}
          />
        )}

        {/* Country Comparison Bar Chart (for line charts only) */}
        {renderCountryComparison()}
      </div>

      {/* Enhanced Analytics Section */}
      {chartConfig.enhancedAnalytics && masterData.length > 0 && (() => {
        // Determine field, threshold, direction, and unit for analytics
        const yField = Array.isArray(chartConfig.yField) ? chartConfig.yField[0] : chartConfig.yField;
        const thresholdConfig = THRESHOLDS[yField];
        let threshold: number | undefined;

        if (thresholdConfig && typeof thresholdConfig === 'object' && 'value' in thresholdConfig) {
          threshold = (thresholdConfig as { value: number; label: string }).value;
        } else if (typeof thresholdConfig === 'number') {
          threshold = thresholdConfig;
        }

        // Determine threshold direction based on indicator type
        // OOP, mortality rates want lower values (below threshold is good)
        // Health spending, UHC, budget share want higher values (above threshold is good)
        const thresholdDirection: 'above' | 'below' =
          yField.includes('Out-of-pocket') || yField.includes('External on health') || yField.includes('mortality')
            ? 'below'
            : 'above';

        // Determine unit
        let unit = '';
        if (yField.includes('GDP') || yField.includes('budget') || yField.includes('exp') || yField.includes('health exp') || yField.includes('Out-of-pocket')) {
          unit = '%';
        } else if (yField.includes('per capita') || yField.includes('Per Capita')) {
          unit = ' USD';
        } else if (yField.includes('UHC')) {
          unit = ''; // UHC is a score 0-100, no unit
        }

        return (
          <EnhancedAnalytics
            masterData={masterData}
            field={yField}
            threshold={threshold}
            thresholdDirection={thresholdDirection}
            unit={unit}
            baselineYear={2000}
          />
        );
      })()}

      {/* Data Sources */}
      <div className="sources-section">
        <h2>Data Sources</h2>
        <div className="sources-list">
          {chartConfig.sources.map((source, idx) => (
            <div key={idx} className="source-item">
              <h4>{source.name}</h4>
              <p>{source.description}</p>
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  Visit source →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="methodology-section">
        <h2>Methodology</h2>
        <div className="methodology-content">
          {chartConfig.methodology.split('\n\n').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      {/* Related Charts */}
      <div className="related-charts-section">
        <h2>Related Charts</h2>
        <div className="related-charts-grid">
          {chartConfig.relatedCharts.map((relatedSlug, idx) => {
            const relatedChart = getChartBySlug(relatedSlug);
            if (!relatedChart) return null;

            return (
              <Link to={`/chart/${relatedSlug}`} key={idx} className="related-chart-card">
                <span className="related-category">{getTopicById(relatedChart.topicId)?.shortTitle || relatedChart.topicId}</span>
                <h3>{relatedChart.title}</h3>
                <p>{relatedChart.subtitle}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
