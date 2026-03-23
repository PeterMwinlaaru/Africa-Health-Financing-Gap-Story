/**
 * Dynamic analytics calculator for Policy-Relevant Insights
 * Calculates all analytics metrics based on real data and selected year
 */

interface TargetAchievementData {
  status: "met" | "close" | "moderate" | "far";
  percentBelow: number;
}

interface EnhancedAnalytics {
  continentalOverview: {
    current: string;
    baseline: string;
    trend: string;
  };
  targetAchievement?: {
    targetDescription: string;
    countriesMet: number;
    countriesMetNames: string[];
    countriesNotMet: number;
    averageGap: string;
    gapDistribution: {
      close: number;
      moderate: number;
      far: number;
    };
  };
  progressAnalysis: {
    improving: number;
    stagnating: number;
    worsening: number;
    averageAnnualChange: string;
    recentTrend: string;
  };
  equity: {
    giniCoefficient: string;
    topPerformers: { country: string; value: string }[];
    bottomPerformers: { country: string; value: string }[];
  };
  geographicPatterns: {
    leadingRegion: string;
    laggingRegion: string;
    clustering: string;
    targetAchievementMap?: { [country: string]: TargetAchievementData };
  };
  policyInsights: string[];
}

/**
 * Calculate Gini coefficient for inequality measurement
 */
const calculateGini = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const n = sortedValues.length;
  let sumOfDifferences = 0;

  for (let i = 0; i < n; i++) {
    sumOfDifferences += (2 * (i + 1) - n - 1) * sortedValues[i];
  }

  const mean = sortedValues.reduce((sum, val) => sum + val, 0) / n;
  const gini = sumOfDifferences / (n * n * mean);

  return Math.abs(gini);
};

/**
 * Calculate progress trend (comparing year to 5 years prior)
 */
const calculateProgressTrend = (
  data: any[],
  field: string,
  currentYear: number,
  lookbackYears: number = 5
): { improving: number; stagnating: number; worsening: number } => {
  const priorYear = currentYear - lookbackYears;

  const currentYearData = data.filter(d => d.year === currentYear);
  const priorYearData = data.filter(d => d.year === priorYear);

  const countries = new Set([
    ...currentYearData.map(d => d.location),
    ...priorYearData.map(d => d.location)
  ]);

  let improving = 0;
  let stagnating = 0;
  let worsening = 0;

  countries.forEach(country => {
    const current = currentYearData.find(d => d.location === country)?.[field];
    const prior = priorYearData.find(d => d.location === country)?.[field];

    if (current !== null && current !== undefined && prior !== null && prior !== undefined) {
      const change = current - prior;
      const percentChange = Math.abs(change / prior) * 100;

      if (percentChange <= 2) {
        stagnating++;
      } else if (change > 0) {
        improving++;
      } else {
        worsening++;
      }
    }
  });

  return { improving, stagnating, worsening };
};

/**
 * Calculate target achievement map for countries
 */
const calculateTargetAchievementMap = (
  data: any[],
  field: string,
  threshold: number,
  direction: 'above' | 'below' = 'above'
): { [country: string]: TargetAchievementData } => {
  const map: { [country: string]: TargetAchievementData } = {};

  data.forEach(row => {
    const country = row.location;
    const value = row[field];

    if (country && value !== null && value !== undefined && !isNaN(value)) {
      let percentBelow: number;
      let status: "met" | "close" | "moderate" | "far";

      if (direction === 'above') {
        if (value >= threshold) {
          percentBelow = 0;
          status = "met";
        } else {
          percentBelow = ((threshold - value) / threshold) * 100;
          if (percentBelow <= 20) status = "close";
          else if (percentBelow <= 50) status = "moderate";
          else status = "far";
        }
      } else {
        if (value <= threshold) {
          percentBelow = 0;
          status = "met";
        } else {
          percentBelow = ((value - threshold) / threshold) * 100;
          if (percentBelow <= 20) status = "close";
          else if (percentBelow <= 50) status = "moderate";
          else status = "far";
        }
      }

      map[country] = { status, percentBelow: Math.round(percentBelow * 10) / 10 };
    }
  });

  return map;
};

/**
 * Generate dynamic policy insights based on data
 */
const generatePolicyInsights = (
  field: string,
  currentYear: number,
  currentAvg: number,
  threshold: number | undefined,
  countriesMet: number,
  totalCountries: number,
  improving: number,
  worsening: number,
  unit: string,
  decimals: number
): string[] => {
  const insights: string[] = [];

  if (threshold !== undefined) {
    const percentMet = (countriesMet / totalCountries) * 100;
    insights.push(
      `Only ${countriesMet} of ${totalCountries} African countries meet the threshold in ${currentYear} (${percentMet.toFixed(1)}% compliance rate)`
    );
  }

  if (improving > 0 && worsening > 0) {
    insights.push(
      `${improving} countries are improving while ${worsening} are worsening - indicating divergent trajectories across the continent`
    );
  }

  if (threshold !== undefined && currentAvg < threshold) {
    const gap = threshold - currentAvg;
    const gapPercent = (gap / threshold) * 100;
    insights.push(
      `Continental average of ${currentAvg.toFixed(decimals)} is ${gap.toFixed(decimals)} points (${gapPercent.toFixed(1)}%) below threshold - closing this gap requires sustained policy commitment`
    );
  }

  return insights;
};

/**
 * Main function to calculate all enhanced analytics dynamically
 */
export const calculateDynamicAnalytics = (
  masterData: any[],
  field: string,
  currentYear: number,
  baselineYear: number = 2000,
  threshold?: number,
  thresholdDirection: 'above' | 'below' = 'above',
  unit: string = ''
): EnhancedAnalytics | null => {
  if (!masterData || masterData.length === 0) return null;

  // Filter data for current year and baseline year
  const currentYearData = masterData.filter(d =>
    d.year === currentYear &&
    d[field] !== null &&
    d[field] !== undefined &&
    !isNaN(d[field])
  );

  const baselineYearData = masterData.filter(d =>
    d.year === baselineYear &&
    d[field] !== null &&
    d[field] !== undefined &&
    !isNaN(d[field])
  );

  if (currentYearData.length === 0) return null;

  // 1. Continental Overview
  const currentAvg = currentYearData.reduce((sum, d) => sum + d[field], 0) / currentYearData.length;
  const baselineAvg = baselineYearData.length > 0
    ? baselineYearData.reduce((sum, d) => sum + d[field], 0) / baselineYearData.length
    : null;

  const change = baselineAvg !== null ? currentAvg - baselineAvg : null;
  const percentChange = change !== null && baselineAvg !== null && baselineAvg !== 0
    ? (change / baselineAvg) * 100
    : null;

  // Use 1 decimal for percentages/indices, 2 for currency
  const decimals = unit === ' USD' ? 2 : 1;

  const continentalOverview = {
    current: `Africa average: ${currentAvg.toFixed(decimals)}${unit} (${currentYear})`,
    baseline: baselineAvg !== null ? `${baselineAvg.toFixed(decimals)}${unit} (${baselineYear})` : 'N/A',
    trend: percentChange !== null
      ? `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% change since ${baselineYear}`
      : 'Insufficient data'
  };

  // 2. Target Achievement (if threshold provided)
  let targetAchievement;
  let targetAchievementMap;

  if (threshold !== undefined) {
    const meetingThreshold = currentYearData.filter(d =>
      thresholdDirection === 'above' ? d[field] >= threshold : d[field] <= threshold
    );
    const notMeeting = currentYearData.filter(d =>
      thresholdDirection === 'above' ? d[field] < threshold : d[field] > threshold
    );

    const countriesMet = meetingThreshold.length;
    const countriesMetNames = meetingThreshold
      .sort((a, b) => b[field] - a[field])
      .slice(0, 5)
      .map(d => `${d.location} (${d[field].toFixed(decimals)}${unit})`);

    // Calculate gap distribution
    const gapDistribution = { close: 0, moderate: 0, far: 0 };
    notMeeting.forEach(d => {
      const gap = thresholdDirection === 'above'
        ? ((threshold - d[field]) / threshold) * 100
        : ((d[field] - threshold) / threshold) * 100;

      if (gap <= 20) gapDistribution.close++;
      else if (gap <= 50) gapDistribution.moderate++;
      else gapDistribution.far++;
    });

    const avgGap = notMeeting.length > 0
      ? notMeeting.reduce((sum, d) => {
          const gap = thresholdDirection === 'above' ? threshold - d[field] : d[field] - threshold;
          return sum + gap;
        }, 0) / notMeeting.length
      : 0;

    targetAchievement = {
      targetDescription: `Analysis threshold: ${threshold}${unit}`,
      countriesMet,
      countriesMetNames,
      countriesNotMet: notMeeting.length,
      averageGap: `${avgGap.toFixed(decimals)}${unit} ${thresholdDirection === 'above' ? 'below' : 'above'} threshold`,
      gapDistribution
    };

    // Calculate map
    targetAchievementMap = calculateTargetAchievementMap(currentYearData, field, threshold, thresholdDirection);
  }

  // 3. Progress Analysis
  const progressTrend = calculateProgressTrend(masterData, field, currentYear, 5);
  const annualChange = percentChange !== null ? percentChange / (currentYear - baselineYear) : 0;

  const progressAnalysis = {
    improving: progressTrend.improving,
    stagnating: progressTrend.stagnating,
    worsening: progressTrend.worsening,
    averageAnnualChange: `${annualChange > 0 ? '+' : ''}${annualChange.toFixed(2)}% average annually`,
    recentTrend: `${progressTrend.improving} countries improving, ${progressTrend.stagnating} stagnating, ${progressTrend.worsening} worsening (vs ${currentYear - 5})`
  };

  // 4. Equity Metrics
  const values = currentYearData.map(d => d[field]);
  const gini = calculateGini(values);

  const sortedCurrent = [...currentYearData].sort((a, b) => b[field] - a[field]);
  const topPerformers = sortedCurrent.slice(0, 5).map(d => ({
    country: d.location,
    value: `${d[field].toFixed(decimals)}${unit}`
  }));
  const bottomPerformers = sortedCurrent.slice(-5).reverse().map(d => ({
    country: d.location,
    value: `${d[field].toFixed(decimals)}${unit}`
  }));

  const equity = {
    giniCoefficient: `${gini.toFixed(2)} ${gini < 0.3 ? '(low inequality)' : gini < 0.5 ? '(moderate inequality)' : '(high inequality)'}`,
    topPerformers,
    bottomPerformers
  };

  // 5. Geographic Patterns
  const subregionData = new Map<string, number[]>();
  currentYearData.forEach(d => {
    const subregion = d.Subregion;
    if (subregion) {
      if (!subregionData.has(subregion)) {
        subregionData.set(subregion, []);
      }
      subregionData.get(subregion)!.push(d[field]);
    }
  });

  const subregionAverages = Array.from(subregionData.entries()).map(([region, values]) => ({
    region,
    average: values.reduce((sum, v) => sum + v, 0) / values.length
  }));

  subregionAverages.sort((a, b) => b.average - a.average);

  const leadingRegion = subregionAverages[0];
  const laggingRegion = subregionAverages[subregionAverages.length - 1];

  const geographicPatterns = {
    leadingRegion: leadingRegion
      ? `${leadingRegion.region} leads with ${leadingRegion.average.toFixed(decimals)}${unit} average`
      : 'Insufficient data',
    laggingRegion: laggingRegion
      ? `${laggingRegion.region} lags with ${laggingRegion.average.toFixed(decimals)}${unit} average`
      : 'Insufficient data',
    clustering: subregionAverages.length > 1
      ? `Significant variation across subregions from ${laggingRegion.average.toFixed(decimals)}${unit} to ${leadingRegion.average.toFixed(decimals)}${unit}`
      : 'Insufficient data',
    targetAchievementMap
  };

  // 6. Policy Insights
  const policyInsights = threshold !== undefined
    ? generatePolicyInsights(
        field,
        currentYear,
        currentAvg,
        threshold,
        targetAchievement?.countriesMet || 0,
        currentYearData.length,
        progressTrend.improving,
        progressTrend.worsening,
        unit,
        decimals
      )
    : [
        `Continental average of ${currentAvg.toFixed(decimals)}${unit} in ${currentYear} represents the current state`,
        `${progressTrend.improving} countries showing improvement over the past 5 years`,
        `Equity analysis shows ${gini < 0.3 ? 'relatively low' : 'significant'} inequality across countries`
      ];

  return {
    continentalOverview,
    targetAchievement,
    progressAnalysis,
    equity,
    geographicPatterns,
    policyInsights
  };
};
