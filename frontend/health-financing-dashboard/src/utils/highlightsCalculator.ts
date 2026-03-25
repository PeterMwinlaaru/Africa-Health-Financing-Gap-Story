/**
 * Utility functions to calculate dynamic highlights from chart data
 */

interface HighlightData {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

interface DataPoint {
  year?: number;
  value?: number;
  name?: string;
  [key: string]: any;
}

// Helper function to format values with appropriate units based on field name
const formatValueWithUnit = (value: number, fieldName: string): string => {
  // Determine unit based on field name
  if (fieldName.includes('per capita') || fieldName.includes('Per Capita') ||
      fieldName.includes('Gap for') || fieldName.includes('Expenditure per capita')) {
    // Monetary values - prefix with $
    return `$${value.toFixed(2)}`;
  } else if (fieldName.includes('GDP') || fieldName.includes('budget') ||
             fieldName.includes('on health exp') || fieldName.includes('Out-of-pocket') ||
             fieldName.includes('Govern on health') || fieldName.includes('External on health') ||
             fieldName.includes('Voluntary') || fieldName.includes('Private on health')) {
    // Percentage values - suffix with %
    return `${value.toFixed(1)}%`;
  } else if (fieldName.includes('mortality')) {
    // Mortality rates - no unit
    return value.toFixed(1);
  } else if (fieldName.includes('coverage')) {
    // Index values - no unit
    return value.toFixed(1);
  } else {
    // Default - 1 decimal, no unit
    return value.toFixed(1);
  }
};

/**
 * Calculate average from data points
 */
export const calculateAverage = (data: any[], field: string): number => {
  const values = data
    .map(d => d[field])
    .filter(v => v !== null && v !== undefined && !isNaN(v));

  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

/**
 * Find minimum value with country name
 */
export const findMin = (data: any[], field: string): { value: number; country: string } | null => {
  const validData = data.filter(d =>
    d[field] !== null && d[field] !== undefined && !isNaN(d[field])
  );

  if (validData.length === 0) return null;

  const minItem = validData.reduce((min, item) =>
    item[field] < min[field] ? item : min
  );

  return {
    value: minItem[field],
    country: minItem.name || minItem.location || 'Unknown'
  };
};

/**
 * Find maximum value with country name
 */
export const findMax = (data: any[], field: string): { value: number; country: string } | null => {
  const validData = data.filter(d =>
    d[field] !== null && d[field] !== undefined && !isNaN(d[field])
  );

  if (validData.length === 0) return null;

  const maxItem = validData.reduce((max, item) =>
    item[field] > max[field] ? item : max
  );

  return {
    value: maxItem[field],
    country: maxItem.name || maxItem.location || 'Unknown'
  };
};

/**
 * Count countries meeting threshold
 */
export const countMeetingThreshold = (
  data: any[],
  field: string,
  threshold: number,
  direction: 'above' | 'below' = 'above'
): { count: number; percentage: number } => {
  const validData = data.filter(d =>
    d[field] !== null && d[field] !== undefined && !isNaN(d[field])
  );

  if (validData.length === 0) return { count: 0, percentage: 0 };

  const meetingCount = validData.filter(d =>
    direction === 'above' ? d[field] >= threshold : d[field] <= threshold
  ).length;

  return {
    count: meetingCount,
    percentage: (meetingCount / validData.length) * 100
  };
};

/**
 * Calculate trend from time series data
 */
export const calculateTrend = (data: any[], xField: string, yField: string): {
  direction: 'up' | 'down' | 'neutral';
  change: number;
  percentChange: number;
} | null => {
  const sortedData = [...data]
    .filter(d => d[yField] !== null && d[yField] !== undefined && !isNaN(d[yField]))
    .sort((a, b) => a[xField] - b[xField]);

  if (sortedData.length < 2) return null;

  const firstValue = sortedData[0][yField];
  const lastValue = sortedData[sortedData.length - 1][yField];
  const change = lastValue - firstValue;
  const percentChange = (change / Math.abs(firstValue)) * 100;

  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  if (Math.abs(percentChange) > 1) {
    direction = change > 0 ? 'up' : 'down';
  }

  return { direction, change, percentChange };
};

/**
 * Calculate gap from threshold
 */
export const calculateGap = (
  data: any[],
  field: string,
  threshold: number,
  direction: 'above' | 'below' = 'above'
): number => {
  const avg = calculateAverage(data, field);
  const gap = direction === 'above' ? threshold - avg : avg - threshold;
  return gap;
};

/**
 * Generate highlights for line chart with time series data
 */
export const generateLineChartHighlights = (
  data: any[],
  field: string,
  threshold?: number,
  unit: string = '' // Deprecated parameter, kept for backwards compatibility
): HighlightData[] => {
  if (!data || data.length === 0) return [];

  const highlights: HighlightData[] = [];

  // Current average (latest year)
  const sortedData = [...data].sort((a, b) => (b.year || 0) - (a.year || 0));
  const latestData = sortedData[0];
  const currentValue = latestData ? (latestData.value ?? latestData[field]) : null;

  if (currentValue !== null && currentValue !== undefined) {
    highlights.push({
      label: 'Current Average',
      value: formatValueWithUnit(currentValue, field),
      subtext: `Year ${latestData.year || 'N/A'}`,
      highlight: true
    });
  }

  // Trend analysis
  const trend = calculateTrend(data, 'year', field === 'value' ? 'value' : field);
  if (trend) {
    const sortedData = [...data].filter(d => d[field === 'value' ? 'value' : field] !== null).sort((a, b) => (a.year || 0) - (b.year || 0));
    const firstYear = sortedData.length > 0 ? sortedData[0].year : '';
    const lastYear = sortedData.length > 0 ? sortedData[sortedData.length - 1].year : '';

    highlights.push({
      label: 'Trend',
      value: `${trend.percentChange > 0 ? '+' : ''}${trend.percentChange.toFixed(1)}%`,
      subtext: `Total change from ${firstYear} to ${lastYear}`,
      trend: trend.direction
    });
  }

  // Threshold comparison (if applicable)
  if (threshold !== undefined && currentValue !== null && currentValue !== undefined) {
    const gap = threshold - currentValue;
    const gapPercent = (gap / threshold) * 100;

    highlights.push({
      label: currentValue >= threshold ? 'Above Threshold' : 'Gap to Threshold',
      value: currentValue >= threshold
        ? `+${formatValueWithUnit(currentValue - threshold, field)}`
        : formatValueWithUnit(Math.abs(gap), field),
      subtext: currentValue >= threshold
        ? `Exceeds by ${Math.abs(gapPercent).toFixed(1)}%`
        : `${Math.abs(gapPercent).toFixed(1)}% below target`
    });
  }

  return highlights;
};

/**
 * Generate highlights for country comparison bar chart
 */
export const generateCountryComparisonHighlights = (
  data: any[],
  field: string,
  threshold?: number,
  unit: string = '', // Deprecated parameter, kept for backwards compatibility
  year?: number
): HighlightData[] => {
  if (!data || data.length === 0) return [];

  const highlights: HighlightData[] = [];

  // Average
  const avg = calculateAverage(data, 'value');
  highlights.push({
    label: 'Average',
    value: formatValueWithUnit(avg, field),
    subtext: `Across ${data.length} countries`,
    highlight: true
  });

  // Top performer
  const max = findMax(data, 'value');
  if (max) {
    highlights.push({
      label: 'Top Performer',
      value: formatValueWithUnit(max.value, field),
      subtext: max.country,
      trend: 'up'
    });
  }

  // Bottom performer
  const min = findMin(data, 'value');
  if (min) {
    highlights.push({
      label: 'Lowest',
      value: formatValueWithUnit(min.value, field),
      subtext: min.country,
      trend: 'down'
    });
  }

  // Threshold compliance (if applicable)
  if (threshold !== undefined) {
    const meeting = countMeetingThreshold(data, 'value', threshold);
    highlights.push({
      label: 'Meeting Threshold',
      value: `${meeting.count} of ${data.length}`,
      subtext: `${meeting.percentage.toFixed(1)}% of countries`
    });
  }

  return highlights;
};

/**
 * Format number with appropriate precision
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(decimals);
};
