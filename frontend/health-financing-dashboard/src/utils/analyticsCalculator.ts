/**
 * Dynamic analytics calculator for Policy-Relevant Insights
 * Calculates all analytics metrics based on real data and selected year
 */

// Helper function to determine if indicator is measured in percentages
const isPercentageIndicator = (fieldName: string): boolean => {
  return fieldName.includes('GDP') ||
         fieldName.includes('budget') ||
         fieldName.includes('on health exp') ||
         fieldName.includes('Out-of-pocket') ||
         fieldName.includes('Govern on health') ||
         fieldName.includes('External on health') ||
         fieldName.includes('Voluntary') ||
         fieldName.includes('Private on health') ||
         fieldName.includes('as % of');
};

// Helper: determine if lower values represent improvement for this indicator
const isLowerBetter = (fieldName: string): boolean => {
  return fieldName.includes('mortality') ||
         fieldName.includes('Out-of-pocket') ||
         fieldName.includes('External on health') ||
         fieldName.includes('financial hardship');
};

// Helper function to format values with appropriate units based on field name
const formatValueWithUnit = (value: number, fieldName: string): string => {
  // Determine unit based on field name
  if (fieldName.includes('per capita') || fieldName.includes('Per Capita') ||
      fieldName.includes('Gap for') || fieldName.includes('Expenditure per capita')) {
    // Monetary values - prefix with $
    return `$${value.toFixed(2)}`;
  } else if (isPercentageIndicator(fieldName)) {
    // Percentage values - suffix with %
    return `${value.toFixed(1)}%`;
  } else if (fieldName.includes('mortality')) {
    // Mortality rates - whole numbers (deaths are counts)
    return Math.round(value).toString();
  } else if (fieldName.includes('coverage')) {
    // Index values - no unit
    return value.toFixed(1);
  } else {
    // Default - 1 decimal, no unit
    return value.toFixed(1);
  }
};

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
    paceAssessment: string;
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
 * Configurable thresholds for progress classification.
 * These can be adjusted by users via the UI.
 */
export interface ClassificationThresholds {
  cagrThreshold: number;       // CAGR % for monetary & mortality (default: 1)
  ppThreshold: number;         // Percentage points for pp indicators (default: 0.5)
  indexPointsPerYear: number;  // Points per year for index scores (default: 1)
}

export const DEFAULT_THRESHOLDS: ClassificationThresholds = {
  cagrThreshold: 1,
  ppThreshold: 0.5,
  indexPointsPerYear: 1,
};

/**
 * Calculate progress trend using CAGR over the lookback window.
 *
 * Classification uses configurable, indicator-specific thresholds.
 * Direction-aware: for indicators where lower is better (mortality, OOP,
 * external financing), a decrease counts as improvement.
 */
const calculateProgressTrend = (
  data: any[],
  field: string,
  currentYear: number,
  lookbackYears: number = 5,
  thresholds: ClassificationThresholds = DEFAULT_THRESHOLDS
): { improving: number; stagnating: number; worsening: number } => {
  const priorYear = currentYear - lookbackYears;
  const lowerBetter = isLowerBetter(field);
  const isPct = isPercentageIndicator(field);
  const isMortality = field.includes('mortality');
  const isIndex = field.includes('coverage');

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

    if (current !== null && current !== undefined && prior !== null && prior !== undefined && prior !== 0) {
      let isStagnating = false;

      if (isPct && !isMortality) {
        const absoluteChange = Math.abs(current - prior);
        isStagnating = absoluteChange < thresholds.ppThreshold;
      } else if (isIndex) {
        const absoluteChange = Math.abs(current - prior);
        isStagnating = absoluteChange < (thresholds.indexPointsPerYear * lookbackYears);
      } else {
        const cagr = (Math.pow(current / prior, 1 / lookbackYears) - 1) * 100;
        isStagnating = Math.abs(cagr) < thresholds.cagrThreshold;
      }

      if (isStagnating) {
        stagnating++;
      } else {
        const change = current - prior;
        const positiveIsGood = lowerBetter ? change < 0 : change > 0;
        if (positiveIsGood) {
          improving++;
        } else {
          worsening++;
        }
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
  worsening: number
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
      `Continental average of ${formatValueWithUnit(currentAvg, field)} is ${formatValueWithUnit(gap, field)} points (${gapPercent.toFixed(1)}%) below threshold - closing this gap requires sustained policy commitment`
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
  unit: string = '',
  classificationThresholds: ClassificationThresholds = DEFAULT_THRESHOLDS
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

  // Calculate overall change since baseline for continental overview
  let trendDescription = 'Insufficient data';
  if (baselineAvg !== null && baselineAvg !== 0) {
    const totalChange = ((currentAvg - baselineAvg) / Math.abs(baselineAvg)) * 100;
    trendDescription = `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}% change since ${baselineYear}`;
  }

  // Get yearly averages for the 5-year lookback window (used by pace assessment)
  const lookbackYears = [currentYear - 5, currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
  const yearlyAverages: { year: number; avg: number }[] = [];
  for (const year of lookbackYears) {
    const yearData = masterData.filter(d =>
      d.year === year &&
      d[field] !== null &&
      d[field] !== undefined &&
      !isNaN(d[field])
    );
    if (yearData.length > 0) {
      const avg = yearData.reduce((sum, d) => sum + d[field], 0) / yearData.length;
      yearlyAverages.push({ year, avg });
    }
  }

  const continentalOverview = {
    current: `Africa average: ${formatValueWithUnit(currentAvg, field)} (${currentYear})`,
    baseline: baselineAvg !== null ? `${formatValueWithUnit(baselineAvg, field)} (${baselineYear})` : 'N/A',
    trend: trendDescription
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
      .map(d => `${d.location} (${formatValueWithUnit(d[field], field)})`);

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
      targetDescription: `Analysis threshold: ${formatValueWithUnit(threshold, field)}`,
      countriesMet,
      countriesMetNames,
      countriesNotMet: notMeeting.length,
      averageGap: `${formatValueWithUnit(avgGap, field)} ${thresholdDirection === 'above' ? 'below' : 'above'} threshold`,
      gapDistribution
    };

    // Calculate map
    targetAchievementMap = calculateTargetAchievementMap(currentYearData, field, threshold, thresholdDirection);
  }

  // 3. Progress Analysis
  const progressTrend = calculateProgressTrend(masterData, field, currentYear, 5, classificationThresholds);

  // Calculate pace assessment: years to target + required vs actual pace
  let paceAssessmentText = 'Insufficient data';
  const lookbackStart = currentYear - 5;
  const avg_start = yearlyAverages.find(y => y.year === lookbackStart)?.avg;
  const avg_end = yearlyAverages.find(y => y.year === currentYear)?.avg;

  if (threshold !== undefined && avg_start !== undefined && avg_end !== undefined && avg_start !== 0) {
    const targetYear = 2030;
    const yearsLeft = targetYear - currentYear;
    const lowerBetter = isLowerBetter(field);
    const needsToIncrease = thresholdDirection === 'above';
    const gap = needsToIncrease ? threshold - avg_end : avg_end - threshold;
    const alreadyMet = needsToIncrease ? avg_end >= threshold : avg_end <= threshold;

    if (alreadyMet) {
      paceAssessmentText = `Continental average (${formatValueWithUnit(avg_end, field)}) already meets the target of ${formatValueWithUnit(threshold, field)}.`;
    } else if (isPercentageIndicator(field)) {
      // pp/year pace
      const pace = (avg_end - avg_start) / 5;
      const movingRight = needsToIncrease ? pace > 0 : pace < 0;

      if (movingRight) {
        const yearsToTarget = Math.round(gap / Math.abs(pace));
        const requiredPace = gap / yearsLeft;
        const multiplier = (requiredPace / Math.abs(pace)).toFixed(1);
        paceAssessmentText = `Between ${lookbackStart} and ${currentYear}, the continental average moved from ${formatValueWithUnit(avg_start, field)} to ${formatValueWithUnit(avg_end, field)} (${pace > 0 ? '+' : ''}${pace.toFixed(2)} pp/year). At this pace, the ${formatValueWithUnit(threshold, field)} target will be reached in ~${yearsToTarget} years (by ${currentYear + yearsToTarget}). Reaching it by ${targetYear} would require ${needsToIncrease ? '+' : '-'}${requiredPace.toFixed(2)} pp/year — ${multiplier}x the current rate.`;
      } else {
        paceAssessmentText = `Between ${lookbackStart} and ${currentYear}, the continental average moved from ${formatValueWithUnit(avg_start, field)} to ${formatValueWithUnit(avg_end, field)} — moving away from the ${formatValueWithUnit(threshold, field)} target at ${pace > 0 ? '+' : ''}${pace.toFixed(2)} pp/year. A reversal is needed.`;
      }
    } else {
      // CAGR-based pace
      const cagr = Math.pow(avg_end / avg_start, 1 / 5) - 1;
      const movingRight = needsToIncrease ? cagr > 0 : cagr < 0;

      if (movingRight) {
        const yearsToTarget = Math.round(Math.log(threshold / avg_end) / Math.log(1 + cagr));
        const requiredCagr = Math.pow(threshold / avg_end, 1 / yearsLeft) - 1;
        const multiplier = (Math.abs(requiredCagr) / Math.abs(cagr)).toFixed(1);
        paceAssessmentText = `Between ${lookbackStart} and ${currentYear}, the continental average moved from ${formatValueWithUnit(avg_start, field)} to ${formatValueWithUnit(avg_end, field)} (equivalent annual rate of ${Math.abs(cagr * 100).toFixed(1)}%). At this pace, the target of ${formatValueWithUnit(threshold, field)} will be reached in ~${Math.abs(yearsToTarget)} years (by ${currentYear + Math.abs(yearsToTarget)}). Reaching it by ${targetYear} would require ${Math.abs(requiredCagr * 100).toFixed(1)}% per year — ${multiplier}x the current rate.`;
      } else {
        paceAssessmentText = `Between ${lookbackStart} and ${currentYear}, the continental average moved from ${formatValueWithUnit(avg_start, field)} to ${formatValueWithUnit(avg_end, field)} — moving away from the target of ${formatValueWithUnit(threshold, field)}. A reversal in trajectory is needed.`;
      }
    }
  } else if (avg_start !== undefined && avg_end !== undefined && avg_start !== 0) {
    // No threshold — provide pace context only
    if (isPercentageIndicator(field)) {
      const pace = (avg_end - avg_start) / 5;
      const direction = pace > 0 ? 'increased' : 'decreased';
      paceAssessmentText = `Between ${lookbackStart} and ${currentYear}, the continental average ${direction} by an equivalent of ${Math.abs(pace).toFixed(2)} percentage points per year (from ${formatValueWithUnit(avg_start, field)} to ${formatValueWithUnit(avg_end, field)}).`;
    } else {
      const cagr = (Math.pow(avg_end / avg_start, 1 / 5) - 1) * 100;
      const direction = cagr > 0 ? 'grew' : 'declined';
      paceAssessmentText = `Between ${lookbackStart} and ${currentYear}, the continental average ${direction} at an equivalent annual rate of ${Math.abs(cagr).toFixed(1)}% (from ${formatValueWithUnit(avg_start, field)} to ${formatValueWithUnit(avg_end, field)}).`;
    }
  }

  const progressAnalysis = {
    improving: progressTrend.improving,
    stagnating: progressTrend.stagnating,
    worsening: progressTrend.worsening,
    paceAssessment: paceAssessmentText,
    recentTrend: `${progressTrend.improving} countries improving, ${progressTrend.stagnating} stagnating, ${progressTrend.worsening} worsening (vs ${currentYear - 5})`
  };

  // 4. Equity Metrics
  const values = currentYearData.map(d => d[field]);
  const gini = calculateGini(values);

  const sortedCurrent = [...currentYearData].sort((a, b) => b[field] - a[field]);
  const topPerformers = sortedCurrent.slice(0, 5).map(d => ({
    country: d.location,
    value: formatValueWithUnit(d[field], field)
  }));
  const bottomPerformers = sortedCurrent.slice(-5).reverse().map(d => ({
    country: d.location,
    value: formatValueWithUnit(d[field], field)
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
      ? `${leadingRegion.region} leads with ${formatValueWithUnit(leadingRegion.average, field)} average`
      : 'Insufficient data',
    laggingRegion: laggingRegion
      ? `${laggingRegion.region} lags with ${formatValueWithUnit(laggingRegion.average, field)} average`
      : 'Insufficient data',
    clustering: subregionAverages.length > 1
      ? `Significant variation across subregions from ${formatValueWithUnit(laggingRegion.average, field)} to ${formatValueWithUnit(leadingRegion.average, field)}`
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
        progressTrend.worsening
      )
    : [
        `Continental average of ${formatValueWithUnit(currentAvg, field)} in ${currentYear} represents the current state`,
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
