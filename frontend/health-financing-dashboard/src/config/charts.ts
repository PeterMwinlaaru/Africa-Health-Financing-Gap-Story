/**
 * Chart Configurations - Complete Set for All 11 Themes
 * ======================================================
 * Field names updated to match actual data from API
 *
 * Thresholds (from Statistical Product for Health Financing Gap.docx):
 * - Gov health expenditure per capita: LICs=$112, LMICs=$146, UMICs=$477
 * - Abuja Declaration: 15% of government budget to health
 * - OOP benchmark: ≤20% of current health expenditure
 * - Government dominant share: >50% of health expenditure
 * - UHC: Uses 50th and 75th percentiles (not fixed threshold)
 * - NMR target: ≤12 per 1,000 live births
 * - MMR target: <70 per 100,000 live births
 */

export interface Source {
  name: string;
  url?: string;
  description: string;
}

// Enhanced analytics for policy-relevant insights
export interface EnhancedAnalytics {
  // Continental Overview
  continentalOverview: {
    current: string;  // e.g., "Africa average: $71 per capita (2023)"
    baseline: string; // e.g., "$24 (2000)"
    trend: string;    // e.g., "+195% growth"
  };

  // Target Achievement
  targetAchievement?: {
    targetDescription: string; // e.g., "Income-specific thresholds (LIC=$112, LMIC=$146, UMIC=$477)"
    countriesMet: number;      // Number meeting target
    countriesMetNames: string[]; // Names of countries meeting target
    countriesNotMet: number;   // Number not meeting target
    averageGap: string;        // e.g., "$65 per capita below threshold"
    gapDistribution?: {        // How many are close vs far
      close: number;    // Within 20% of target
      moderate: number; // 20-50% below target
      far: number;      // >50% below target
    };
  };

  // Progress Analysis
  progressAnalysis: {
    improving: number;         // # countries improving
    stagnating: number;        // # countries stagnating
    worsening: number;         // # countries worsening
    paceAssessment: string;    // Years to target + required vs actual pace
    recentTrend: string;       // Qualitative assessment
  };

  // Equity & Distribution
  equity: {
    giniCoefficient?: string;  // e.g., "0.62 (high inequality)"
    topPerformers: {
      country: string;
      value: string;
      context?: string; // Brief explanation
    }[];
    bottomPerformers: {
      country: string;
      value: string;
      context?: string;
    }[];
    incomeGroupDisparities?: string; // Qualitative description
  };

  // Geographic Patterns
  geographicPatterns: {
    leadingRegion: string;    // e.g., "Southern Africa leads"
    laggingRegion: string;    // e.g., "Central Africa lags"
    clustering: string;       // e.g., "Coastal countries outperform landlocked"
    crossBorderPatterns?: string; // Notable regional patterns
    targetAchievementMap?: {
      [country: string]: {
        status: "met" | "close" | "moderate" | "far";
        percentBelow: number;
      }
    }; // Target achievement status for map visualization
  };

  // Key Policy Insights
  policyInsights: string[];   // 3-5 actionable insights
}

export interface ChartConfig {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  topicId: string;
  indicatorNumber: string;
  narrative: string;
  insights: string[];
  dataEndpoint: string;
  chartType: 'line' | 'bar' | 'map' | 'pie' | 'scatter' | 'grouped-bar' | 'stacked-bar';
  xField: string;
  yField: string | string[];
  groupBy?: string;
  sources: Source[];
  relatedCharts: string[];
  methodology: string;
  featured?: boolean;
  disaggregations: string[];

  // Enhanced analytics for policy insights
  enhancedAnalytics?: EnhancedAnalytics;
}

// ============================================================================
// THEME 3.1: ADEQUACY OF PUBLIC HEALTH FINANCING GAP
// ============================================================================

const publicHealthFinancingCharts: ChartConfig[] = [
  {
    id: 'gov-health-exp-per-capita',
    slug: 'government-health-expenditure-per-capita',
    title: 'Government Health Expenditure Per Capita',
    subtitle: 'Domestic government spending on health per person in constant 2023 US dollars',
    topicId: 'public-health-financing',
    indicatorNumber: '1.1',
    narrative: `This indicator tracks government health spending per person across African countries. The benchmark thresholds are: $112 for Low-Income Countries (LICs), $146 for Lower-Middle-Income Countries (LMICs), and $477 for Upper-Middle-Income Countries (UMICs).

In 2023, the average African country spends $70.96 per capita on health - still far below the minimum thresholds. Low-income countries average only $8.92 per capita, representing a massive 92% shortfall from the $112 target.

These thresholds represent the minimum government health spending needed to provide essential health services including primary care, maternal and child health, infectious disease control, and basic hospital services.`,
    insights: [
      'Only 3 out of 54 countries (5.6%) meet their income-specific thresholds: Seychelles, Tunisia, and Cabo Verde',
      'Low-income countries average just $8.92 per capita - 92% below the $112 threshold',
      '45 countries (83.3% of all countries) are more than 50% below required spending levels',
      'Government health spending has grown 193.7% since 2000, but only 33 countries show consistent recent improvement',
      'Southern Africa leads at $135.89 per capita while Western Africa lags at $25.59'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'Gov exp Health per capita',
    sources: [
      { name: 'WHO Global Health Expenditure Database', url: 'https://apps.who.int/nha/database', description: 'Primary source for government health expenditure data' },
      { name: 'Chatham House/WHO Threshold Estimates', description: 'Evidence-based minimum health spending thresholds' }
    ],
    relatedCharts: ['gov-health-gdp-share'],
    methodology: 'Data from WHO GHED. Per capita values in constant 2023 US dollars to enable comparison over time. Countries classified by World Bank income groups.',
    featured: true,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: $70.96 per capita (2023)",
        baseline: "$24.16 per capita (2000)",
        trend: "+193.7% growth over 23 years"
      },
      targetAchievement: {
        targetDescription: "Income-specific thresholds: Low-income = $112, Lower-middle = $146, Upper-middle = $477 per capita",
        countriesMet: 3,
        countriesMetNames: ["Seychelles ($538.46)", "Tunisia ($171.84)", "Cabo Verde ($169.94)"],
        countriesNotMet: 51,
        averageGap: "77.7% below income-appropriate threshold (median: 87.5%)",
        gapDistribution: {
          close: 2,      // Within 20% of target: Morocco, Eswatini
          moderate: 4,   // 20-50% below target: Libya, Botswana, South Africa, Mauritius
          far: 45        // >50% below target (includes all 22 low-income countries)
        }
      },
      progressAnalysis: {
        improving: 33,
        stagnating: 5,
        worsening: 16,
        paceAssessment: "At current pace (1.8% CAGR), the continental average will reach the $112 LIC threshold in ~26 years (by 2049). Reaching it by 2030 would require a 6.7% CAGR — 3.8x the current rate.",
        recentTrend: "Mixed progress: 33 countries (61.1%) show improvement, while 5 (9.3%) stagnate and 16 (29.6%) worsen. Growth rate insufficient to meet SDG targets."
      },
      equity: {
        topPerformers: [
          { country: "Seychelles", value: "$538.46" },
          { country: "Libya", value: "$377.02" },
          { country: "Botswana", value: "$369.46" },
          { country: "South Africa", value: "$330.61" },
          { country: "Mauritius", value: "$273.16" }
        ],
        bottomPerformers: [
          { country: "South Sudan", value: "$3.14" },
          { country: "Somalia", value: "$3.17" },
          { country: "Burundi", value: "$4.15" },
          { country: "Sudan", value: "$4.37" },
          { country: "DRC", value: "$4.39" }
        ],
        incomeGroupDisparities: "Upper-middle income countries spend 31x more than low-income countries ($276.27 vs $8.92)"
      },
      geographicPatterns: {
        leadingRegion: "Southern and Northern Africa lead with smallest gaps (35.8% and 45.0% average). Tunisia meets targets, Morocco within 10% of threshold. Island nations Seychelles and Cabo Verde also exceed targets",
        laggingRegion: "Western, Central, and Eastern Africa show largest gaps - averaging 81-82% below thresholds, with two-thirds of countries >80% below income-specific targets",
        clustering: "Clear achievement divide: Only 3 countries (Seychelles, Tunisia, Cabo Verde) meet targets; Southern African upper-middle-income countries (Botswana 22.5%, South Africa 30.7%) show moderate gaps, while low-income countries across all regions remain far from targets",
        crossBorderPatterns: "Target achievement follows income patterns more than geography - upper-middle income countries average 35.8% gap (Southern Africa) while low-income regions average 81-82% gaps regardless of location",
        targetAchievementMap: {
          "Algeria": { status: "far", percentBelow: 74.0 },
          "Angola": { status: "far", percentBelow: 76.8 },
          "Benin": { status: "far", percentBelow: 95.3 },
          "Botswana": { status: "moderate", percentBelow: 22.5 },
          "Burkina Faso": { status: "far", percentBelow: 79.9 },
          "Burundi": { status: "far", percentBelow: 96.3 },
          "Cabo Verde": { status: "met", percentBelow: 0 },
          "Cameroon": { status: "far", percentBelow: 92.0 },
          "Central African Republic": { status: "far", percentBelow: 93.1 },
          "Chad": { status: "far", percentBelow: 89.3 },
          "Comoros": { status: "far", percentBelow: 91.0 },
          "Congo": { status: "far", percentBelow: 82.4 },
          "Côte d'Ivoire": { status: "far", percentBelow: 75.5 },
          "Democratic Republic of the Congo": { status: "far", percentBelow: 96.1 },
          "Djibouti": { status: "far", percentBelow: 75.5 },
          "Egypt": { status: "far", percentBelow: 68.8 },
          "Equatorial Guinea": { status: "far", percentBelow: 84.2 },
          "Eritrea": { status: "far", percentBelow: 94.2 },
          "Eswatini": { status: "close", percentBelow: 13.4 },
          "Ethiopia": { status: "far", percentBelow: 93.2 },
          "Gabon": { status: "far", percentBelow: 65.2 },
          "Gambia": { status: "far", percentBelow: 89.7 },
          "Ghana": { status: "far", percentBelow: 69.6 },
          "Guinea": { status: "far", percentBelow: 91.1 },
          "Guinea-Bissau": { status: "far", percentBelow: 92.2 },
          "Kenya": { status: "far", percentBelow: 73.9 },
          "Lesotho": { status: "far", percentBelow: 61.1 },
          "Liberia": { status: "far", percentBelow: 90.7 },
          "Libya": { status: "moderate", percentBelow: 21.0 },
          "Madagascar": { status: "far", percentBelow: 95.5 },
          "Malawi": { status: "far", percentBelow: 95.3 },
          "Mali": { status: "far", percentBelow: 89.3 },
          "Mauritania": { status: "far", percentBelow: 78.4 },
          "Mauritius": { status: "moderate", percentBelow: 42.7 },
          "Morocco": { status: "close", percentBelow: 10.1 },
          "Mozambique": { status: "far", percentBelow: 87.5 },
          "Namibia": { status: "far", percentBelow: 51.3 },
          "Niger": { status: "far", percentBelow: 94.4 },
          "Nigeria": { status: "far", percentBelow: 93.4 },
          "Rwanda": { status: "far", percentBelow: 77.9 },
          "Sao Tome and Principe": { status: "far", percentBelow: 56.7 },
          "Senegal": { status: "far", percentBelow: 86.2 },
          "Seychelles": { status: "met", percentBelow: 0 },
          "Sierra Leone": { status: "far", percentBelow: 94.7 },
          "Somalia": { status: "far", percentBelow: 97.2 },
          "South Africa": { status: "moderate", percentBelow: 30.7 },
          "South Sudan": { status: "far", percentBelow: 97.2 },
          "Sudan": { status: "far", percentBelow: 96.1 },
          "Togo": { status: "far", percentBelow: 94.1 },
          "Tunisia": { status: "met", percentBelow: 0 },
          "Uganda": { status: "far", percentBelow: 91.2 },
          "United Republic of Tanzania": { status: "far", percentBelow: 92.1 },
          "Zambia": { status: "far", percentBelow: 77.8 },
          "Zimbabwe": { status: "far", percentBelow: 86.1 }
        }
      },
      policyInsights: [
        "Crisis-level gaps: 83.3% of countries are more than 50% below required spending levels, indicating systemic underinvestment",
        "All low-income countries critically underfunded: Every single low-income country (22 of 22) is >50% below the $112 threshold, averaging only $8.92 per capita",
        "16 countries (29.6%) show worsening spending trends, while 5 countries stagnate and 33 show improvement",
        "Fastest improvers from lowest base: Somalia (+69.5%/year), Chad (+33.9%/year), CAR (+28.1%/year) show dramatic growth but from extremely low starting points",
        "Morocco and Eswatini closest to breakthrough: Only 2 countries within striking distance (10-13% below threshold) of meeting their targets"
      ]
    }
  }
];

// ============================================================================
// THEME 3.2: COMPLIANCE WITH ABUJA DECLARATION
// ============================================================================

const abujaDeclarationCharts: ChartConfig[] = [
  {
    id: 'gov-health-budget-share',
    slug: 'government-health-budget-share',
    title: 'Government Health Expenditure as Share of Budget',
    subtitle: 'Percentage of government budget allocated to health - Abuja target is 15%',
    topicId: 'budget-priority',
    indicatorNumber: '2.1',
    narrative: `The Abuja Declaration of 2001 committed African governments to allocate at least 15% of their national budgets to health. Over two decades later, only one African country consistently meets this target.

The continental average hovers around 5-7% - less than half the target. This reflects competing budget priorities including education, infrastructure, security, and debt servicing. However, the health sector's consistent underfunding contributes to weak health systems and poor health outcomes.

Meeting the Abuja target would roughly triple health funding in many countries, potentially transforming health service delivery.`,
    insights: [
      'Only 1 African country consistently meets the 15% Abuja target',
      'Continental average is around 5-7% of government budget',
      'Some countries allocate less than 3% to health',
      'Progress toward the Abuja target has been slow since 2001'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'Gov exp Health on budget',
    sources: [
      { name: 'WHO Global Health Expenditure Database', description: 'Government health expenditure and total government expenditure data' },
      { name: 'African Union', description: 'Abuja Declaration 2001 target of 15%' }
    ],
    relatedCharts: [],
    methodology: 'Health budget share = (Government Health Expenditure / Total Government Expenditure) × 100. Target of 15% from the Abuja Declaration 2001.',
    featured: false,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: 7.07% (2023)",
        baseline: "7.09% (2000)",
        trend: "-0.3% change since 2000"
      },
      targetAchievement: {
        targetDescription: "Abuja Declaration target: 15% of government budget to health",
        countriesMet: 1,
        countriesMetNames: ["South Africa (16.89%)"],
        countriesNotMet: 53,
        averageGap: "8.12 percentage points below target",
        gapDistribution: {
          close: 8,
          moderate: 28,
          far: 17
        }
      },
      progressAnalysis: {
        improving: 30,
        stagnating: 12,
        worsening: 12,
        paceAssessment: "At current pace (+0.06 pp/year), the continental average will reach the 15% Abuja target in ~124 years. Reaching it by 2030 would require +1.13 pp/year — 19x the current rate.",
        recentTrend: "Recent trends show 30 countries improving, 12 stagnating, and 12 worsening since 2018"
      },
      equity: {
        giniCoefficient: "0.26 (low inequality)",
        topPerformers: [
          { country: "South Africa", value: "16.89%" },
          { country: "Namibia", value: "14.99%" },
          { country: "Botswana", value: "14.61%" },
          { country: "Cabo Verde", value: "13.79%" },
          { country: "Tunisia", value: "12.10%" }
        ],
        bottomPerformers: [
          { country: "South Sudan", value: "2.14%" },
          { country: "Eritrea", value: "2.37%" },
          { country: "Benin", value: "2.55%" },
          { country: "Togo", value: "2.56%" },
          { country: "Malawi", value: "3.29%" }
        ]
      },
      geographicPatterns: {
        leadingRegion: "Southern Africa leads with 9.71% average",
        laggingRegion: "Eastern Africa lags with 5.65% average",
        clustering: "Significant variation across subregions from 5.65% to 9.71%",
        targetAchievementMap: {
          "Algeria": { status: "far", percentBelow: 58.9 },
          "Angola": { status: "far", percentBelow: 60.7 },
          "Benin": { status: "far", percentBelow: 83.0 },
          "Botswana": { status: "close", percentBelow: 2.6 },
          "Burkina Faso": { status: "moderate", percentBelow: 41.5 },
          "Burundi": { status: "far", percentBelow: 68.5 },
          "Cabo Verde": { status: "close", percentBelow: 8.1 },
          "Cameroon": { status: "far", percentBelow: 73.9 },
          "Central African Republic": { status: "moderate", percentBelow: 43.5 },
          "Chad": { status: "far", percentBelow: 51.6 },
          "Comoros": { status: "far", percentBelow: 68.4 },
          "Congo": { status: "far", percentBelow: 63.9 },
          "Côte d'Ivoire": { status: "far", percentBelow: 56.1 },
          "Democratic Republic of the Congo": { status: "far", percentBelow: 73.3 },
          "Djibouti": { status: "far", percentBelow: 67.4 },
          "Egypt": { status: "far", percentBelow: 53.8 },
          "Equatorial Guinea": { status: "far", percentBelow: 60.9 },
          "Eritrea": { status: "far", percentBelow: 84.2 },
          "Eswatini": { status: "moderate", percentBelow: 29.1 },
          "Ethiopia": { status: "far", percentBelow: 62.2 },
          "Gabon": { status: "moderate", percentBelow: 36.1 },
          "Gambia": { status: "far", percentBelow: 63.6 },
          "Ghana": { status: "moderate", percentBelow: 33.0 },
          "Guinea": { status: "far", percentBelow: 65.9 },
          "Guinea-Bissau": { status: "far", percentBelow: 71.4 },
          "Kenya": { status: "moderate", percentBelow: 42.3 },
          "Lesotho": { status: "moderate", percentBelow: 21.1 },
          "Liberia": { status: "far", percentBelow: 68.1 },
          "Libya": { status: "moderate", percentBelow: 36.2 },
          "Madagascar": { status: "far", percentBelow: 63.2 },
          "Malawi": { status: "far", percentBelow: 78.1 },
          "Mali": { status: "far", percentBelow: 63.8 },
          "Mauritania": { status: "far", percentBelow: 60.4 },
          "Mauritius": { status: "moderate", percentBelow: 45.0 },
          "Morocco": { status: "moderate", percentBelow: 29.3 },
          "Mozambique": { status: "far", percentBelow: 54.9 },
          "Namibia": { status: "close", percentBelow: 0.0 },
          "Niger": { status: "far", percentBelow: 59.0 },
          "Nigeria": { status: "far", percentBelow: 71.3 },
          "Rwanda": { status: "moderate", percentBelow: 40.5 },
          "Sao Tome and Principe": { status: "moderate", percentBelow: 41.5 },
          "Senegal": { status: "far", percentBelow: 76.2 },
          "Seychelles": { status: "moderate", percentBelow: 36.1 },
          "Sierra Leone": { status: "far", percentBelow: 70.2 },
          "Somalia": { status: "moderate", percentBelow: 47.3 },
          "South Africa": { status: "met", percentBelow: 0 },
          "South Sudan": { status: "far", percentBelow: 85.8 },
          "Sudan": { status: "far", percentBelow: 52.4 },
          "Togo": { status: "far", percentBelow: 82.9 },
          "Tunisia": { status: "close", percentBelow: 19.3 },
          "Uganda": { status: "far", percentBelow: 67.6 },
          "United Republic of Tanzania": { status: "far", percentBelow: 65.8 },
          "Zambia": { status: "moderate", percentBelow: 40.7 },
          "Zimbabwe": { status: "far", percentBelow: 68.4 }
        }
      },
      policyInsights: [
        "Only 1 of 54 African countries meets the 15% Abuja target, indicating widespread challenges in prioritizing health within government budgets",
        "Positive momentum: 30 countries showing improvement vs 12 worsening - but progress remains slow after 23 years since the Abuja Declaration",
        "Southern Africa leads the continent with nearly double the budget allocation of Eastern Africa",
        "With continental average at 7.07%, most countries need to more than double their health budget allocation to meet the Abuja target",
        "Low inequality (Gini 0.26) suggests the challenge is universal across income levels, not concentrated in specific countries"
      ]
    }
  }
];

// ============================================================================
// THEME 3.3: SHARE OF GOVERNMENT HEALTH EXPENDITURE IN GDP
// ============================================================================

const gdpShareCharts: ChartConfig[] = [
  {
    id: 'gov-health-gdp-share',
    slug: 'government-health-expenditure-gdp-share',
    title: 'Government Health Expenditure as Share of GDP',
    subtitle: 'Domestic government health spending as percentage of gross domestic product - Target is 5%',
    topicId: 'budget-priority',
    indicatorNumber: '2.2',
    narrative: `Government health expenditure as a share of GDP indicates both the economic capacity for and political commitment to health financing. The WHO recommends a minimum of 5% of GDP be spent on health, with government being the primary funder.

Most African countries fall well below this benchmark, averaging around 1-2% of GDP on government health spending. This is significantly lower than the global average of around 4% and far below wealthy nations that spend 6-8%.

Low GDP shares mean that even as economies grow, health budgets may not keep pace with population needs and expectations.`,
    insights: [
      'Average African government health spending is around 1.5% of GDP',
      'WHO recommends at least 5% of GDP on health spending',
      'Upper-middle-income African countries average around 2.5%',
      'The GDP share has increased modestly since 2000'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'Gov exp Health on GDP',
    sources: [
      { name: 'WHO Global Health Expenditure Database', description: 'Government health expenditure and GDP data' }
    ],
    relatedCharts: ['total-health-gdp-share'],
    methodology: 'Government health expenditure as percentage of GDP. WHO benchmark of 5% used as reference.',
    featured: true,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: 1.87% of GDP (2023)",
        baseline: "1.45% of GDP (2000)",
        trend: "+29.5% change since 2000"
      },
      targetAchievement: {
        targetDescription: "WHO minimum target: 5% of GDP on government health spending",
        countriesMet: 4,
        countriesMetNames: ["Libya (6.26%)", "Lesotho (5.84%)", "Namibia (5.55%)", "South Africa (5.49%)"],
        countriesNotMet: 50,
        averageGap: "3.44 percentage points below target",
        gapDistribution: {
          close: 2,
          moderate: 4,
          far: 44
        }
      },
      progressAnalysis: {
        improving: 11,
        stagnating: 35,
        worsening: 8,
        paceAssessment: "At current pace (+0.03 pp/year), the continental average will reach the 5% WHO target in ~95 years. Reaching it by 2030 would require +0.45 pp/year — 15x the current rate.",
        recentTrend: "Progress is largely stagnant: 35 countries show no meaningful change, while 11 improve and 8 worsen since 2018"
      },
      equity: {
        giniCoefficient: "0.39 (moderate inequality)",
        topPerformers: [
          { country: "Libya", value: "6.26% of GDP" },
          { country: "Lesotho", value: "5.84% of GDP" },
          { country: "Namibia", value: "5.55% of GDP" },
          { country: "South Africa", value: "5.49% of GDP" },
          { country: "Botswana", value: "4.72% of GDP" }
        ],
        bottomPerformers: [
          { country: "Benin", value: "0.49% of GDP" },
          { country: "South Sudan", value: "0.50% of GDP" },
          { country: "Somalia", value: "0.53% of GDP" },
          { country: "Sudan", value: "0.59% of GDP" },
          { country: "Nigeria", value: "0.60% of GDP" }
        ]
      },
      geographicPatterns: {
        leadingRegion: "Southern Africa leads with 3.17% of GDP average",
        laggingRegion: "Eastern Africa lags with 1.20% of GDP average",
        clustering: "Southern Africa spends 2.6× more than Eastern Africa as share of GDP",
        targetAchievementMap: {
          "Algeria": { status: "far", percentBelow: 53.8 },
          "Angola": { status: "far", percentBelow: 77.3 },
          "Benin": { status: "far", percentBelow: 90.2 },
          "Botswana": { status: "close", percentBelow: 5.6 },
          "Burkina Faso": { status: "far", percentBelow: 50.9 },
          "Burundi": { status: "far", percentBelow: 73.2 },
          "Cabo Verde": { status: "moderate", percentBelow: 31.5 },
          "Cameroon": { status: "far", percentBelow: 86.6 },
          "Central African Republic": { status: "far", percentBelow: 69.4 },
          "Chad": { status: "far", percentBelow: 74.8 },
          "Comoros": { status: "far", percentBelow: 83.1 },
          "Congo": { status: "far", percentBelow: 77.6 },
          "Côte d'Ivoire": { status: "far", percentBelow: 72.0 },
          "Democratic Republic of the Congo": { status: "far", percentBelow: 86.2 },
          "Djibouti": { status: "far", percentBelow: 79.0 },
          "Egypt": { status: "far", percentBelow: 68.5 },
          "Equatorial Guinea": { status: "far", percentBelow: 77.4 },
          "Eritrea": { status: "far", percentBelow: 83.0 },
          "Eswatini": { status: "moderate", percentBelow: 35.9 },
          "Ethiopia": { status: "far", percentBelow: 87.7 },
          "Gabon": { status: "far", percentBelow: 58.8 },
          "Gambia": { status: "far", percentBelow: 74.0 },
          "Ghana": { status: "far", percentBelow: 62.7 },
          "Guinea": { status: "far", percentBelow: 83.9 },
          "Guinea-Bissau": { status: "far", percentBelow: 81.2 },
          "Kenya": { status: "far", percentBelow: 60.9 },
          "Lesotho": { status: "met", percentBelow: 0 },
          "Liberia": { status: "far", percentBelow: 74.0 },
          "Libya": { status: "met", percentBelow: 0 },
          "Madagascar": { status: "far", percentBelow: 80.2 },
          "Malawi": { status: "far", percentBelow: 83.2 },
          "Mali": { status: "far", percentBelow: 73.0 },
          "Mauritania": { status: "far", percentBelow: 70.3 },
          "Mauritius": { status: "far", percentBelow: 50.7 },
          "Morocco": { status: "moderate", percentBelow: 31.4 },
          "Mozambique": { status: "far", percentBelow: 55.0 },
          "Namibia": { status: "met", percentBelow: 0 },
          "Niger": { status: "far", percentBelow: 80.6 },
          "Nigeria": { status: "far", percentBelow: 88.0 },
          "Rwanda": { status: "far", percentBelow: 51.8 },
          "Sao Tome and Principe": { status: "far", percentBelow: 57.3 },
          "Senegal": { status: "far", percentBelow: 76.2 },
          "Seychelles": { status: "moderate", percentBelow: 37.0 },
          "Sierra Leone": { status: "far", percentBelow: 84.2 },
          "Somalia": { status: "far", percentBelow: 89.4 },
          "South Africa": { status: "met", percentBelow: 0 },
          "South Sudan": { status: "far", percentBelow: 90.0 },
          "Sudan": { status: "far", percentBelow: 88.2 },
          "Togo": { status: "far", percentBelow: 86.4 },
          "Tunisia": { status: "close", percentBelow: 13.6 },
          "Uganda": { status: "far", percentBelow: 81.5 },
          "United Republic of Tanzania": { status: "far", percentBelow: 80.7 },
          "Zambia": { status: "far", percentBelow: 51.3 },
          "Zimbabwe": { status: "far", percentBelow: 81.1 }
        }
      },
      policyInsights: [
        "Only 4 of 54 African countries meet the 5% WHO target - 93% of countries fall short despite 23 years of advocacy",
        "Moderate inequality (Gini 0.39) with top performers spending 10× more than bottom performers relative to GDP",
        "Southern Africa's leadership demonstrates that higher GDP spending on health is achievable even in Africa",
        "With 35 countries stagnating, most African governments are not meaningfully increasing health spending as a share of GDP",
        "Nigeria and Sudan - two of Africa's largest economies - rank among the bottom 5, suggesting political commitment matters more than economic capacity"
      ]
    }
  },
  {
    id: 'total-health-gdp-share',
    slug: 'total-health-expenditure-gdp-share',
    title: 'Total Health Expenditure as Share of GDP',
    subtitle: 'All health spending (public + private + external) as percentage of GDP',
    topicId: 'budget-priority',
    indicatorNumber: '2.3',
    narrative: `Total health expenditure captures all spending on health - government, private, and external sources. This broader measure shows the full economic commitment to health in each country.

African countries average around 5% of GDP on total health spending - close to the WHO minimum. However, much of this is out-of-pocket spending by households rather than risk-pooled public financing.

The difference between total and government health expenditure reveals how much burden falls on households and donors rather than governments.`,
    insights: [
      'Total health expenditure in Africa averages around 5% of GDP',
      'This is close to WHO minimum but below global average of 10%',
      'Much of total spending is out-of-pocket rather than government',
      'Some countries exceed 8% when including all private and external spending'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'Exp Health on GDP',
    sources: [
      { name: 'WHO Global Health Expenditure Database', description: 'Total health expenditure data' }
    ],
    relatedCharts: ['gov-health-gdp-share'],
    methodology: 'Total health expenditure = Government + Private + External as percentage of GDP.',
    featured: false,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: 5.52% of GDP (2023)",
        baseline: "4.24% of GDP (2000)",
        trend: "+30.2% change since 2000"
      },
      progressAnalysis: {
        improving: 22,
        stagnating: 23,
        worsening: 9,
        paceAssessment: "Total health spending as share of GDP is growing at +0.08 pp/year. While the continental average (5.52%) exceeds 5%, government share remains low — households and donors fill the gap.",
        recentTrend: "Mixed progress: 22 countries improving, 23 stagnating, and 9 worsening since 2018"
      },
      equity: {
        giniCoefficient: "0.25 (low inequality)",
        topPerformers: [
          { country: "Liberia", value: "13.01% of GDP" },
          { country: "Lesotho", value: "12.61% of GDP" },
          { country: "South Sudan", value: "11.61% of GDP" },
          { country: "Central African Republic", value: "10.66% of GDP" },
          { country: "Namibia", value: "9.48% of GDP" }
        ],
        bottomPerformers: [
          { country: "Djibouti", value: "2.28% of GDP" },
          { country: "Angola", value: "2.55% of GDP" },
          { country: "Ethiopia", value: "2.80% of GDP" },
          { country: "Sudan", value: "2.85% of GDP" },
          { country: "Gambia", value: "2.89% of GDP" }
        ]
      },
      geographicPatterns: {
        leadingRegion: "Southern Africa leads with 6.98% of GDP average",
        laggingRegion: "Eastern Africa lags with 4.87% of GDP average",
        clustering: "Relatively consistent across subregions compared to government spending alone"
      },
      policyInsights: [
        "Continental average of 5.52% of GDP meets WHO minimum but remains well below global average of 10%",
        "Low inequality (Gini 0.25) in total health spending masks high inequality in government vs household contributions",
        "Countries with high total spending but low government spending (e.g., Liberia 13%) indicate unsustainable household burden",
        "The gap between total (5.52%) and government (1.87%) spending reveals households and donors finance 66% of Africa's health expenditure",
        "Countries improving total health spending as share of GDP must ensure growth comes from government sources, not increased household burden"
      ]
    }
  }
];

// ============================================================================
// THEME 3.4: OUT-OF-POCKET EXPENDITURE
// ============================================================================

const oopCharts: ChartConfig[] = [
  {
    id: 'oop-share',
    slug: 'out-of-pocket-expenditure-share',
    title: 'Out-of-Pocket Expenditure Share',
    subtitle: 'Household direct payments as percentage of total health expenditure - Target is below 20%',
    topicId: 'financial-protection',
    indicatorNumber: '3.1',
    narrative: `Out-of-pocket (OOP) expenditure is direct payment by households for health services at the point of use. High OOP shares indicate weak financial protection and can lead to catastrophic health spending that pushes families into poverty.

WHO recommends OOP remain below 20% of total health expenditure to provide adequate financial protection. Most African countries exceed this threshold, with some above 50%.

High OOP spending creates barriers to access - people delay or forgo care because they cannot afford it. This leads to worse health outcomes and higher costs when diseases progress.`,
    insights: [
      'Average OOP share in Africa is around 35% - well above the 20% target',
      'Some countries have OOP shares exceeding 50%',
      'High OOP is associated with catastrophic health expenditure',
      'Countries with stronger public financing have lower OOP shares'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'Out-of-pocket on health exp',
    sources: [
      { name: 'WHO Global Health Expenditure Database', description: 'Out-of-pocket health expenditure data' }
    ],
    relatedCharts: [],
    methodology: 'OOP share = (Out-of-pocket expenditure / Total health expenditure) × 100. Target of ≤20% from WHO.',
    featured: false,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: 35.47% of health expenditure (2023)",
        baseline: "47.99% of health expenditure (2000)",
        trend: "-26.1% change since 2000"
      },
      targetAchievement: {
        targetDescription: "WHO financial protection target: ≤20% of health expenditure",
        countriesMet: 13,
        countriesMetNames: ["Rwanda (4.10%)", "Botswana (4.26%)", "South Africa (6.69%)", "Namibia (7.49%)", "Eswatini (11.02%)"],
        countriesNotMet: 41,
        averageGap: "23.23 percentage points above target",
        gapDistribution: {
          close: 0,
          moderate: 10,
          far: 31
        }
      },
      progressAnalysis: {
        improving: 33,
        stagnating: 3,
        worsening: 18,
        paceAssessment: "At current pace (-0.42 pp/year), the continental average will reach the 20% financial protection threshold in ~37 years (by 2060). Reaching it by 2030 would require -2.21 pp/year — 5.3x the current rate.",
        recentTrend: "33 countries improving (reducing OOP) vs 18 worsening since 2018"
      },
      equity: {
        giniCoefficient: "0.30 (low inequality)",
        topPerformers: [
          { country: "Rwanda", value: "4.10%" },
          { country: "Botswana", value: "4.26%" },
          { country: "South Africa", value: "6.69%" },
          { country: "Namibia", value: "7.49%" },
          { country: "Zambia", value: "10.29%" }
        ],
        bottomPerformers: [
          { country: "Liberia", value: "63.24%" },
          { country: "Togo", value: "64.34%" },
          { country: "Equatorial Guinea", value: "65.98%" },
          { country: "Cameroon", value: "67.65%" },
          { country: "Nigeria", value: "71.90%" }
        ]
      },
      geographicPatterns: {
        leadingRegion: "Southern Africa achieves best financial protection with 14.89% average",
        laggingRegion: "Western Africa has weakest protection with 47.83% average - more than 3× worse",
        clustering: "Stark regional divide: Southern countries have strong public health systems while Western countries rely heavily on household payments",
        targetAchievementMap: {
          "Algeria": { status: "far", percentBelow: 125.0 },
          "Angola": { status: "far", percentBelow: 62.7 },
          "Benin": { status: "far", percentBelow: 112.0 },
          "Botswana": { status: "met", percentBelow: 0 },
          "Burkina Faso": { status: "far", percentBelow: 119.1 },
          "Burundi": { status: "moderate", percentBelow: 22.4 },
          "Cabo Verde": { status: "moderate", percentBelow: 28.7 },
          "Cameroon": { status: "far", percentBelow: 238.3 },
          "Central African Republic": { status: "far", percentBelow: 125.1 },
          "Chad": { status: "far", percentBelow: 158.4 },
          "Comoros": { status: "far", percentBelow: 182.8 },
          "Congo": { status: "moderate", percentBelow: 39.9 },
          "Côte d'Ivoire": { status: "far", percentBelow: 60.0 },
          "Democratic Republic of the Congo": { status: "far", percentBelow: 90.0 },
          "Djibouti": { status: "moderate", percentBelow: 44.2 },
          "Egypt": { status: "far", percentBelow: 186.0 },
          "Equatorial Guinea": { status: "far", percentBelow: 229.9 },
          "Eritrea": { status: "far", percentBelow: 142.2 },
          "Eswatini": { status: "met", percentBelow: 0 },
          "Ethiopia": { status: "far", percentBelow: 131.3 },
          "Gabon": { status: "met", percentBelow: 0 },
          "Gambia": { status: "far", percentBelow: 68.9 },
          "Ghana": { status: "moderate", percentBelow: 33.4 },
          "Guinea": { status: "far", percentBelow: 172.1 },
          "Guinea-Bissau": { status: "far", percentBelow: 207.8 },
          "Kenya": { status: "moderate", percentBelow: 21.2 },
          "Lesotho": { status: "met", percentBelow: 0 },
          "Liberia": { status: "far", percentBelow: 216.2 },
          "Libya": { status: "met", percentBelow: 0 },
          "Madagascar": { status: "moderate", percentBelow: 37.1 },
          "Malawi": { status: "met", percentBelow: 0 },
          "Mali": { status: "far", percentBelow: 136.1 },
          "Mauritania": { status: "far", percentBelow: 118.9 },
          "Mauritius": { status: "far", percentBelow: 126.2 },
          "Morocco": { status: "far", percentBelow: 86.3 },
          "Mozambique": { status: "met", percentBelow: 0 },
          "Namibia": { status: "met", percentBelow: 0 },
          "Niger": { status: "far", percentBelow: 157.4 },
          "Nigeria": { status: "far", percentBelow: 259.5 },
          "Rwanda": { status: "met", percentBelow: 0 },
          "Sao Tome and Principe": { status: "met", percentBelow: 0 },
          "Senegal": { status: "far", percentBelow: 121.6 },
          "Seychelles": { status: "moderate", percentBelow: 39.8 },
          "Sierra Leone": { status: "far", percentBelow: 172.3 },
          "Somalia": { status: "far", percentBelow: 53.9 },
          "South Africa": { status: "met", percentBelow: 0 },
          "South Sudan": { status: "moderate", percentBelow: 35.7 },
          "Sudan": { status: "far", percentBelow: 186.8 },
          "Togo": { status: "far", percentBelow: 221.7 },
          "Tunisia": { status: "far", percentBelow: 89.7 },
          "Uganda": { status: "far", percentBelow: 60.9 },
          "United Republic of Tanzania": { status: "moderate", percentBelow: 39.7 },
          "Zambia": { status: "met", percentBelow: 0 },
          "Zimbabwe": { status: "met", percentBelow: 0 }
        }
      },
      policyInsights: [
        "Only 13 of 54 countries meet the 20% target - 76% of African populations lack adequate financial protection from health costs",
        "18 countries show worsening OOP trends, though 33 countries are improving (reducing out-of-pocket spending)",
        "Nigeria's 72% OOP rate means most of Africa's largest population pays directly for health care, risking catastrophic expenditure",
        "Southern Africa's success (15% average) proves strong public financing can provide financial protection even in Africa",
        "High OOP spending creates vicious cycle: people avoid care due to cost, leading to worse health outcomes and higher eventual treatment costs"
      ]
    }
  }
];

// ============================================================================
// THEME 3.4 (Part 1): EXTERNAL HEALTH FINANCING DEPENDENCY
// ============================================================================

const financingStructureCharts: ChartConfig[] = [
  {
    id: 'health-financing-structure',
    slug: 'health-financing-structure',
    title: 'Health Financing Structure',
    subtitle: 'Composition of health financing by source - Government, Out-of-Pocket, External, Voluntary Prepayment, and Other Private',
    topicId: 'financing-structure',
    indicatorNumber: '4.1',
    narrative: `Health financing structure reveals the mix of funding sources supporting health systems. An optimal structure features high government share, low out-of-pocket spending, manageable external dependency, growing prepayment mechanisms, and minimal other private sources.

African health systems show diverse financing patterns. Most have insufficient government funding (below 50%), high out-of-pocket payments (above 20%), significant external dependency (10-25%), minimal voluntary prepayment schemes (under 5%), and small other private contributions (typically <5%).

Sustainable health financing requires: (1) Increasing government share through domestic resource mobilization, (2) Reducing OOP through prepayment and risk-pooling, (3) Managing external dependency while leveraging strategic partnerships, (4) Growing voluntary prepayment schemes where appropriate, and (5) Understanding the role of other private sources including NGO and corporate health spending.`,
    insights: [
      'Government financing averages 35-45% of total health expenditure across Africa',
      'Out-of-pocket payments average 35% - well above the 20% financial protection threshold',
      'External financing contributes 10-15% on average, with wide variation by country',
      'Voluntary prepayment schemes remain underdeveloped (typically <5%)',
      'Other private sources (NGOs, corporations, etc.) contribute approximately 2-4% on average'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: ['Govern on health exp', 'Out-of-pocket on health exp', 'External on health exp', 'Voluntary Prepayments on health exp', 'Other Private on health exp'],
    sources: [
      { name: 'WHO Global Health Expenditure Database', description: 'Comprehensive health financing by source data' }
    ],
    relatedCharts: [],
    methodology: 'Each financing source expressed as percentage of total health expenditure. All sources sum to 100%. Data shows continental averages and can be disaggregated by income level and subregion.',
    featured: true,
    disaggregations: ['income', 'Subregion', 'year']
  },
  {
    id: 'external-health-share',
    slug: 'external-health-financing-share',
    title: 'External Health Financing Share',
    subtitle: 'Donor and external funding as percentage of total health expenditure - Target is ≤22.5%',
    topicId: 'financing-structure',
    indicatorNumber: '4.2',
    narrative: `External health financing includes bilateral and multilateral aid, global health initiatives (GAVI, Global Fund, PEPFAR), and NGO funding. While essential for many countries, high dependency creates sustainability risks. The recommended threshold is to keep external financing below 22.5% of total health expenditure.

African countries vary widely in external dependency - from near zero in middle-income countries to over 50% in some conflict-affected states. The continental average is around 10-15%.

Overdependence on external financing means health systems are vulnerable to donor priorities and funding cycles. Building domestic financing capacity is essential for long-term sustainability.`,
    insights: [
      'External financing averages 10-15% of health spending across Africa',
      'Some countries depend on donors for over half their health funding',
      'Target is to keep external financing below 22.5% for sustainability',
      'Donor transitions have caused funding gaps in several countries'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'External on health exp',
    sources: [
      { name: 'WHO Global Health Expenditure Database', description: 'External health financing data' },
      { name: 'OECD DAC', description: 'Development assistance for health data' }
    ],
    relatedCharts: ['health-financing-structure'],
    methodology: 'External share = (External financing / Total health expenditure) × 100. Includes bilateral, multilateral, and private philanthropy. Target threshold is ≤22.5%.',
    featured: true,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: 23.36% of health expenditure (2023)",
        baseline: "10.67% of health expenditure (2000)",
        trend: "+119.0% change since 2000"
      },
      targetAchievement: {
        targetDescription: "Sustainability target: ≤22.5% of health expenditure from external sources",
        countriesMet: 31,
        countriesMetNames: ["Seychelles (0.00%)", "Algeria (0.04%)", "Morocco (0.62%)", "Libya (0.68%)", "Equatorial Guinea (1.04%)"],
        countriesNotMet: 23,
        averageGap: "18.21 percentage points above target",
        gapDistribution: {
          close: 4,
          moderate: 3,
          far: 16
        }
      },
      progressAnalysis: {
        improving: 12,
        stagnating: 8,
        worsening: 34,
        paceAssessment: "External dependency is increasing at +0.32 pp/year, moving away from the 22.5% sustainability threshold. The continental average (23.36%) already exceeds the target and the gap is widening.",
        recentTrend: "Increasing dependency: 34 countries showing rising external financing, only 12 reducing reliance"
      },
      equity: {
        giniCoefficient: "0.43 (high inequality)",
        topPerformers: [
          { country: "Seychelles", value: "0.00%" },
          { country: "Algeria", value: "0.04%" },
          { country: "Morocco", value: "0.62%" },
          { country: "Libya", value: "0.68%" },
          { country: "Equatorial Guinea", value: "1.04%" }
        ],
        bottomPerformers: [
          { country: "Somalia", value: "54.41%" },
          { country: "Burundi", value: "57.42%" },
          { country: "Mozambique", value: "57.71%" },
          { country: "South Sudan", value: "62.30%" },
          { country: "Malawi", value: "65.50%" }
        ]
      },
      geographicPatterns: {
        leadingRegion: "Northern Africa most sustainable with only 6.25% external dependency",
        laggingRegion: "Eastern Africa most dependent with 35.40% external financing - nearly 6× Northern Africa",
        clustering: "High inequality (Gini 0.43) reveals two-tier system: middle-income countries financing themselves vs low-income countries heavily dependent on aid",
        targetAchievementMap: {
          "Algeria": { status: "met", percentBelow: 0 },
          "Angola": { status: "met", percentBelow: 0 },
          "Benin": { status: "far", percentBelow: 70.8 },
          "Botswana": { status: "met", percentBelow: 0 },
          "Burkina Faso": { status: "met", percentBelow: 0 },
          "Burundi": { status: "far", percentBelow: 155.2 },
          "Cabo Verde": { status: "met", percentBelow: 0 },
          "Cameroon": { status: "met", percentBelow: 0 },
          "Central African Republic": { status: "far", percentBelow: 77.3 },
          "Chad": { status: "met", percentBelow: 0 },
          "Comoros": { status: "close", percentBelow: 19.0 },
          "Congo": { status: "met", percentBelow: 0 },
          "Côte d'Ivoire": { status: "met", percentBelow: 0 },
          "Democratic Republic of the Congo": { status: "far", percentBelow: 64.4 },
          "Djibouti": { status: "close", percentBelow: 4.9 },
          "Egypt": { status: "met", percentBelow: 0 },
          "Equatorial Guinea": { status: "met", percentBelow: 0 },
          "Eritrea": { status: "moderate", percentBelow: 26.6 },
          "Eswatini": { status: "moderate", percentBelow: 26.4 },
          "Ethiopia": { status: "close", percentBelow: 19.4 },
          "Gabon": { status: "met", percentBelow: 0 },
          "Gambia": { status: "met", percentBelow: 0 },
          "Ghana": { status: "met", percentBelow: 0 },
          "Guinea": { status: "met", percentBelow: 0 },
          "Guinea-Bissau": { status: "close", percentBelow: 11.7 },
          "Kenya": { status: "met", percentBelow: 0 },
          "Lesotho": { status: "far", percentBelow: 79.8 },
          "Liberia": { status: "met", percentBelow: 0 },
          "Libya": { status: "met", percentBelow: 0 },
          "Madagascar": { status: "far", percentBelow: 69.6 },
          "Malawi": { status: "far", percentBelow: 191.1 },
          "Mali": { status: "met", percentBelow: 0 },
          "Mauritania": { status: "met", percentBelow: 0 },
          "Mauritius": { status: "met", percentBelow: 0 },
          "Morocco": { status: "met", percentBelow: 0 },
          "Mozambique": { status: "far", percentBelow: 156.5 },
          "Namibia": { status: "met", percentBelow: 0 },
          "Niger": { status: "met", percentBelow: 0 },
          "Nigeria": { status: "met", percentBelow: 0 },
          "Rwanda": { status: "far", percentBelow: 64.4 },
          "Sao Tome and Principe": { status: "far", percentBelow: 95.2 },
          "Senegal": { status: "met", percentBelow: 0 },
          "Seychelles": { status: "met", percentBelow: 0 },
          "Sierra Leone": { status: "moderate", percentBelow: 26.7 },
          "Somalia": { status: "far", percentBelow: 141.8 },
          "South Africa": { status: "met", percentBelow: 0 },
          "South Sudan": { status: "far", percentBelow: 176.9 },
          "Sudan": { status: "met", percentBelow: 0 },
          "Togo": { status: "met", percentBelow: 0 },
          "Tunisia": { status: "met", percentBelow: 0 },
          "Uganda": { status: "far", percentBelow: 95.9 },
          "United Republic of Tanzania": { status: "far", percentBelow: 74.9 },
          "Zambia": { status: "far", percentBelow: 112.9 },
          "Zimbabwe": { status: "far", percentBelow: 99.9 }
        }
      },
      policyInsights: [
        "Continental average of 23.36% just exceeds the 22.5% sustainability threshold - but masks extreme variation from 0% to 65%",
        "Concerning trend: External dependency more than doubled since 2000, indicating Africa's health systems increasingly reliant on donors rather than domestic resources",
        "5 countries critically dependent (>50% external) face severe sustainability risks - vulnerable to donor priorities, funding cycles, and aid withdrawal",
        "Eastern Africa's 35% average shows sub-regional crisis: conflict, poverty, and weak tax systems create structural dependence on external health financing",
        "Northern Africa's near-zero dependency proves African countries can sustainably finance health when governance and domestic resource mobilization are prioritized"
      ]
    }
  }
];

// ============================================================================
// THEME 3.5: UNIVERSAL HEALTH COVERAGE
// ============================================================================

const uhcCharts: ChartConfig[] = [
  {
    id: 'uhc-index',
    slug: 'uhc-service-coverage-index',
    title: 'Universal Health Coverage Index',
    subtitle: 'WHO Service Coverage Index measuring progress toward UHC - Analysis threshold is 75',
    topicId: 'uhc-index',
    indicatorNumber: '5.1',
    narrative: `The UHC Service Coverage Index measures the average coverage of essential health services including reproductive, maternal, newborn and child health, infectious diseases, noncommunicable diseases, and service capacity and access.

The index ranges from 0 to 100, with an analysis threshold of 75 indicating strong UHC achievement. Most African countries score between 30 and 60, indicating substantial gaps in service coverage.

Higher scores indicate that more of the population can access essential health services without financial hardship. Progress requires both expanding service availability and reducing financial barriers.`,
    insights: [
      'African average UHC index is around 46 - below the global average of 68 and the analysis threshold of 75',
      'Only a few African countries exceed 60 on the index',
      'Very few African countries have achieved the threshold of 75',
      'Progress has been steady but slow - about 1-2 points per year'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'Universal health coverage',
    sources: [
      { name: 'WHO/World Bank UHC Monitoring', description: 'UHC Service Coverage Index data' }
    ],
    relatedCharts: [],
    methodology: 'WHO UHC Service Coverage Index based on 14 tracer indicators across four categories.',
    featured: true,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: 51.85 index score (2023)",
        baseline: "32.86 index score (2000)",
        trend: "+57.8% improvement since 2000"
      },
      targetAchievement: {
        targetDescription: "Analysis threshold: Index score of 75 or above for strong UHC achievement",
        countriesMet: 3,
        countriesMetNames: ["Seychelles (80)", "Tunisia (76)", "Mauritius (75)"],
        countriesNotMet: 51,
        averageGap: "24.63 points below threshold",
        gapDistribution: {
          close: 11,
          moderate: 36,
          far: 4
        }
      },
      progressAnalysis: {
        improving: 15,
        stagnating: 39,
        worsening: 0,
        paceAssessment: "At current pace (1.05% CAGR), the continental average will reach the UHC index target of 75 in ~35 years (by 2058). Reaching it by 2030 would require a 5.4% CAGR — 5.1x the current rate.",
        recentTrend: "Slow but steady: 15 countries showing meaningful improvement, 39 stagnating, and none worsening since 2018"
      },
      equity: {
        giniCoefficient: "0.14 (low inequality)",
        topPerformers: [
          { country: "Seychelles", value: "80" },
          { country: "Tunisia", value: "76" },
          { country: "Mauritius", value: "75" },
          { country: "South Africa", value: "74" },
          { country: "Eswatini", value: "72" }
        ],
        bottomPerformers: [
          { country: "Chad", value: "26" },
          { country: "Somalia", value: "30" },
          { country: "Ethiopia", value: "33" },
          { country: "Madagascar", value: "33" },
          { country: "Benin", value: "38" }
        ]
      },
      geographicPatterns: {
        leadingRegion: "Northern Africa leads with 63.00 average index score",
        laggingRegion: "Central Africa lags with 45.00 average - 40% behind Northern Africa",
        clustering: "Low inequality (Gini 0.14) suggests universal challenge across income levels, not concentrated in specific countries",
        targetAchievementMap: {
          "Algeria": { status: "close", percentBelow: 6.7 },
          "Angola": { status: "moderate", percentBelow: 41.3 },
          "Benin": { status: "moderate", percentBelow: 49.3 },
          "Botswana": { status: "close", percentBelow: 20.0 },
          "Burkina Faso": { status: "moderate", percentBelow: 37.3 },
          "Burundi": { status: "moderate", percentBelow: 36.0 },
          "Cabo Verde": { status: "close", percentBelow: 5.3 },
          "Cameroon": { status: "moderate", percentBelow: 36.0 },
          "Central African Republic": { status: "moderate", percentBelow: 48.0 },
          "Chad": { status: "far", percentBelow: 65.3 },
          "Comoros": { status: "moderate", percentBelow: 30.7 },
          "Congo": { status: "moderate", percentBelow: 40.0 },
          "Côte d'Ivoire": { status: "moderate", percentBelow: 38.7 },
          "Democratic Republic of the Congo": { status: "moderate", percentBelow: 45.3 },
          "Djibouti": { status: "moderate", percentBelow: 37.3 },
          "Egypt": { status: "close", percentBelow: 5.3 },
          "Equatorial Guinea": { status: "moderate", percentBelow: 34.7 },
          "Eritrea": { status: "moderate", percentBelow: 46.7 },
          "Eswatini": { status: "close", percentBelow: 4.0 },
          "Ethiopia": { status: "far", percentBelow: 56.0 },
          "Gabon": { status: "moderate", percentBelow: 36.0 },
          "Gambia": { status: "moderate", percentBelow: 29.3 },
          "Ghana": { status: "moderate", percentBelow: 25.3 },
          "Guinea": { status: "moderate", percentBelow: 42.7 },
          "Guinea-Bissau": { status: "moderate", percentBelow: 42.7 },
          "Kenya": { status: "moderate", percentBelow: 24.0 },
          "Lesotho": { status: "moderate", percentBelow: 26.7 },
          "Liberia": { status: "moderate", percentBelow: 34.7 },
          "Libya": { status: "close", percentBelow: 5.3 },
          "Madagascar": { status: "far", percentBelow: 56.0 },
          "Malawi": { status: "moderate", percentBelow: 30.7 },
          "Mali": { status: "moderate", percentBelow: 45.3 },
          "Mauritania": { status: "moderate", percentBelow: 46.7 },
          "Mauritius": { status: "met", percentBelow: 0 },
          "Morocco": { status: "close", percentBelow: 13.3 },
          "Mozambique": { status: "moderate", percentBelow: 33.3 },
          "Namibia": { status: "close", percentBelow: 12.0 },
          "Niger": { status: "moderate", percentBelow: 48.0 },
          "Nigeria": { status: "moderate", percentBelow: 37.3 },
          "Rwanda": { status: "moderate", percentBelow: 21.3 },
          "Sao Tome and Principe": { status: "close", percentBelow: 20.0 },
          "Senegal": { status: "moderate", percentBelow: 36.0 },
          "Seychelles": { status: "met", percentBelow: 0 },
          "Sierra Leone": { status: "moderate", percentBelow: 36.0 },
          "Somalia": { status: "far", percentBelow: 60.0 },
          "South Africa": { status: "close", percentBelow: 1.3 },
          "South Sudan": { status: "moderate", percentBelow: 45.3 },
          "Sudan": { status: "moderate", percentBelow: 36.0 },
          "Togo": { status: "moderate", percentBelow: 44.0 },
          "Tunisia": { status: "met", percentBelow: 0 },
          "Uganda": { status: "moderate", percentBelow: 28.0 },
          "United Republic of Tanzania": { status: "moderate", percentBelow: 34.7 },
          "Zambia": { status: "close", percentBelow: 17.3 },
          "Zimbabwe": { status: "moderate", percentBelow: 21.3 }
        }
      },
      policyInsights: [
        "Only 3 of 54 countries achieve the threshold score of 75 - despite strong progress since 2000, 94% of African countries still have substantial UHC gaps",
        "Impressive 58% improvement since 2000 shows UHC is achievable in Africa, but current pace means most countries won't reach the threshold before 2050",
        "15 countries showing meaningful UHC improvement, with 39 stagnating - driven by investments in maternal/child health, infectious disease programs, and primary care expansion",
        "Low inequality (Gini 0.14) masks reality: gap between best (Seychelles 80) and worst (Chad 26) is 3.1×, representing millions without access to essential services",
        "UHC requires both service availability AND financial protection - countries must simultaneously expand coverage and reduce out-of-pocket spending below 20%"
      ]
    }
  }
];

// ============================================================================
// THEME 3.6 (Part 1): INFANT MORTALITY
// ============================================================================

const infantMortalityCharts: ChartConfig[] = [
  {
    id: 'infant-mortality-rate',
    slug: 'neonatal-mortality-rate-trends',
    title: 'Neonatal Mortality Rate',
    subtitle: 'Deaths per 1,000 live births in first 28 days - SDG target is below 12',
    topicId: 'health-outcomes',
    indicatorNumber: '6.1',
    narrative: `Neonatal mortality rate (NMR) measures deaths in the first 28 days of life per 1,000 live births. It is a key indicator of newborn health and health system effectiveness. The SDG target is to reduce NMR to below 12 per 1,000 by 2030.

Africa has made remarkable progress - NMR has roughly halved since 2000. However, the continent still has the highest regional rate, and most countries remain far from the SDG target.

Reducing neonatal mortality requires strengthening maternal and newborn care, improving nutrition, expanding skilled birth attendance, and addressing leading causes of death including prematurity, birth asphyxia, and infections.`,
    insights: [
      'African neonatal mortality has halved since 2000',
      'Current average is around 27 per 1,000 - still far above the SDG target of 12',
      'Wide variation exists from under 5 in some countries to over 40 in others',
      'Countries with stronger health financing tend to have lower neonatal mortality'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'Neonatal mortality rate',
    sources: [
      { name: 'UN Inter-agency Group for Child Mortality Estimation', description: 'Official NMR estimates' },
      { name: 'WHO Global Health Observatory', description: 'Child health indicators' }
    ],
    relatedCharts: [],
    methodology: 'Probability of dying in the first 28 days of life, expressed per 1,000 live births. Data from vital registration and survey estimates.',
    featured: true,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: 22 per 1,000 live births (2023)",
        baseline: "34 per 1,000 live births (2000)",
        trend: "-34.6% reduction since 2000"
      },
      targetAchievement: {
        targetDescription: "SDG target: Neonatal mortality rate below 12 per 1,000 live births by 2030",
        countriesMet: 9,
        countriesMetNames: ["Libya (5.70)", "Sao Tome and Principe (6.80)", "Cabo Verde (8.30)", "Tunisia (8.40)", "Seychelles (8.50)"],
        countriesNotMet: 45,
        averageGap: "13 deaths per 1,000 above target",
        gapDistribution: {
          close: 0,
          moderate: 5,
          far: 40
        }
      },
      progressAnalysis: {
        improving: 47,
        stagnating: 7,
        worsening: 0,
        paceAssessment: "At current pace (-1.89% CAGR), the continental average will reach the SDG target of 12 per 1,000 in ~33 years (by 2056). Reaching it by 2030 would require -8.5% CAGR — 4.5x the current rate.",
        recentTrend: "Sustained progress: 47 countries reducing neonatal mortality, none worsening since 2018"
      },
      equity: {
        giniCoefficient: "0.20 (low inequality)",
        topPerformers: [
          { country: "Libya", value: "5.70 per 1,000" },
          { country: "Sao Tome and Principe", value: "6.80 per 1,000" },
          { country: "Cabo Verde", value: "8.30 per 1,000" },
          { country: "Tunisia", value: "8.40 per 1,000" },
          { country: "Seychelles", value: "8.50 per 1,000" }
        ],
        bottomPerformers: [
          { country: "Guinea-Bissau", value: "32.70 per 1,000" },
          { country: "Nigeria", value: "33.70 per 1,000" },
          { country: "Niger", value: "33.80 per 1,000" },
          { country: "Somalia", value: "34.90 per 1,000" },
          { country: "South Sudan", value: "40.20 per 1,000" }
        ]
      },
      geographicPatterns: {
        leadingRegion: "Northern Africa achieves best outcomes with 14 per 1,000 average",
        laggingRegion: "Western Africa lags with 27 per 1,000 - nearly double Northern Africa's rate",
        clustering: "Low inequality (Gini 0.20) but 7× gap between best and worst performers indicates concentrated challenges in conflict-affected and low-capacity health systems",
        targetAchievementMap: {
          "Algeria": { status: "moderate", percentBelow: 27.5 },
          "Angola": { status: "far", percentBelow: 113.3 },
          "Benin": { status: "far", percentBelow: 133.3 },
          "Botswana": { status: "far", percentBelow: 74.2 },
          "Burkina Faso": { status: "far", percentBelow: 104.2 },
          "Burundi": { status: "far", percentBelow: 63.3 },
          "Cabo Verde": { status: "met", percentBelow: 0 },
          "Cameroon": { status: "far", percentBelow: 110.0 },
          "Central African Republic": { status: "far", percentBelow: 155.8 },
          "Chad": { status: "far", percentBelow: 161.7 },
          "Comoros": { status: "far", percentBelow: 87.5 },
          "Congo": { status: "moderate", percentBelow: 47.5 },
          "Côte d'Ivoire": { status: "far", percentBelow: 135.0 },
          "Democratic Republic of the Congo": { status: "far", percentBelow: 110.8 },
          "Djibouti": { status: "far", percentBelow: 135.0 },
          "Egypt": { status: "met", percentBelow: 0 },
          "Equatorial Guinea": { status: "far", percentBelow: 126.7 },
          "Eritrea": { status: "moderate", percentBelow: 36.7 },
          "Eswatini": { status: "far", percentBelow: 104.2 },
          "Ethiopia": { status: "far", percentBelow: 128.3 },
          "Gabon": { status: "moderate", percentBelow: 40.0 },
          "Gambia": { status: "far", percentBelow: 97.5 },
          "Ghana": { status: "far", percentBelow: 76.7 },
          "Guinea": { status: "far", percentBelow: 152.5 },
          "Guinea-Bissau": { status: "far", percentBelow: 172.5 },
          "Kenya": { status: "far", percentBelow: 79.2 },
          "Lesotho": { status: "far", percentBelow: 139.2 },
          "Liberia": { status: "far", percentBelow: 146.7 },
          "Libya": { status: "met", percentBelow: 0 },
          "Madagascar": { status: "far", percentBelow: 98.3 },
          "Malawi": { status: "far", percentBelow: 56.7 },
          "Mali": { status: "far", percentBelow: 170.0 },
          "Mauritania": { status: "far", percentBelow: 79.2 },
          "Mauritius": { status: "met", percentBelow: 0 },
          "Morocco": { status: "met", percentBelow: 0 },
          "Mozambique": { status: "far", percentBelow: 111.7 },
          "Namibia": { status: "far", percentBelow: 100.8 },
          "Niger": { status: "far", percentBelow: 181.7 },
          "Nigeria": { status: "far", percentBelow: 180.8 },
          "Rwanda": { status: "far", percentBelow: 50.8 },
          "Sao Tome and Principe": { status: "met", percentBelow: 0 },
          "Senegal": { status: "far", percentBelow: 85.8 },
          "Seychelles": { status: "met", percentBelow: 0 },
          "Sierra Leone": { status: "far", percentBelow: 144.2 },
          "Somalia": { status: "far", percentBelow: 190.8 },
          "South Africa": { status: "met", percentBelow: 0 },
          "South Sudan": { status: "far", percentBelow: 235.0 },
          "Sudan": { status: "far", percentBelow: 106.7 },
          "Togo": { status: "far", percentBelow: 92.5 },
          "Tunisia": { status: "met", percentBelow: 0 },
          "Uganda": { status: "moderate", percentBelow: 49.2 },
          "United Republic of Tanzania": { status: "far", percentBelow: 71.7 },
          "Zambia": { status: "far", percentBelow: 83.3 },
          "Zimbabwe": { status: "far", percentBelow: 86.7 }
        }
      },
      policyInsights: [
        "Remarkable 35% reduction since 2000 shows Africa can achieve dramatic mortality reductions through focused maternal-newborn interventions",
        "Only 9 countries meeting the SDG target with 6 years until 2030 deadline - most countries require accelerated action on skilled birth attendance and emergency newborn care",
        "47 of 54 countries show improving trends - strong continent-wide momentum driven by investments in maternal-child health programs",
        "Western Africa's high rates (27 per 1,000) linked to weak health systems, high home births, and limited access to emergency obstetric care",
        "Leading causes - prematurity, birth asphyxia, infections - are largely preventable with quality antenatal care, skilled delivery, and immediate post-birth interventions"
      ]
    }
  }
];

// ============================================================================
// THEME 3.6 (Part 2): MATERNAL MORTALITY
// ============================================================================

const maternalMortalityCharts: ChartConfig[] = [
  {
    id: 'maternal-mortality-ratio',
    slug: 'maternal-mortality-ratio-trends',
    title: 'Maternal Mortality Ratio',
    subtitle: 'Deaths per 100,000 live births from pregnancy-related causes - SDG target is below 70',
    topicId: 'health-outcomes',
    indicatorNumber: '6.2',
    narrative: `Maternal mortality ratio (MMR) measures deaths from pregnancy-related causes per 100,000 live births. The SDG target is to reduce global MMR to below 70 by 2030, with no country above 140.

Africa has the highest maternal mortality of any region, though substantial progress has been made. The continental average remains around 400-500 per 100,000 - far above the target.

Reducing maternal mortality requires skilled birth attendance, emergency obstetric care, family planning, and addressing the social determinants that lead women to have high-risk pregnancies.`,
    insights: [
      'African MMR averages around 450 per 100,000 - highest in the world',
      'SDG target is below 70, with no country above 140',
      'Progress has been made but remains far from target',
      'Most maternal deaths are preventable with adequate care'
    ],
    dataEndpoint: '/api/data/master',
    chartType: 'line',
    xField: 'year',
    yField: 'Maternal mortality ratio',
    sources: [
      { name: 'WHO/UNICEF/UNFPA/World Bank MMR Estimates', description: 'Official maternal mortality data' }
    ],
    relatedCharts: [],
    methodology: 'Number of maternal deaths per 100,000 live births from any cause related to or aggravated by pregnancy.',
    featured: true,
    disaggregations: ['income', 'Subregion', 'year'],
    enhancedAnalytics: {
      continentalOverview: {
        current: "Africa average: 292 per 100,000 live births (2023)",
        baseline: "557 per 100,000 live births (2000)",
        trend: "-47.5% reduction since 2000"
      },
      targetAchievement: {
        targetDescription: "SDG target: Maternal mortality ratio below 70 per 100,000 live births by 2030",
        countriesMet: 8,
        countriesMetNames: ["Egypt (16.95)", "Tunisia (35.71)", "Cabo Verde (40.04)", "Seychelles (41.89)", "Libya (59.50)"],
        countriesNotMet: 46,
        averageGap: "264 deaths per 100,000 above target",
        gapDistribution: {
          close: 2,
          moderate: 1,
          far: 43
        }
      },
      progressAnalysis: {
        improving: 47,
        stagnating: 5,
        worsening: 2,
        paceAssessment: "At current pace (-3.44% CAGR), the continental average will reach the SDG target of 70 per 100,000 in ~41 years (by 2064). Reaching it by 2030 would require -18.5% CAGR — 5.4x the current rate.",
        recentTrend: "Strong progress: 47 countries reducing maternal mortality vs only 2 worsening since 2018"
      },
      equity: {
        giniCoefficient: "0.38 (moderate inequality)",
        topPerformers: [
          { country: "Egypt", value: "16.95 per 100,000" },
          { country: "Tunisia", value: "35.71 per 100,000" },
          { country: "Cabo Verde", value: "40.04 per 100,000" },
          { country: "Seychelles", value: "41.89 per 100,000" },
          { country: "Libya", value: "59.50 per 100,000" }
        ],
        bottomPerformers: [
          { country: "Liberia", value: "627.72 per 100,000" },
          { country: "Central African Republic", value: "691.74 per 100,000" },
          { country: "South Sudan", value: "691.82 per 100,000" },
          { country: "Chad", value: "747.54 per 100,000" },
          { country: "Nigeria", value: "992.83 per 100,000" }
        ]
      },
      geographicPatterns: {
        leadingRegion: "Northern Africa achieves best outcomes with 126 per 100,000 average",
        laggingRegion: "Western Africa faces crisis with 402 per 100,000 - more than 3x Northern Africa's rate",
        clustering: "Moderate inequality (Gini 0.38) but 59× gap between Egypt (17) and Nigeria (993) reveals extreme disparities in maternal health systems",
        targetAchievementMap: {
          "Algeria": { status: "met", percentBelow: 0 },
          "Angola": { status: "far", percentBelow: 161.7 },
          "Benin": { status: "far", percentBelow: 640.3 },
          "Botswana": { status: "far", percentBelow: 121.6 },
          "Burkina Faso": { status: "far", percentBelow: 245.4 },
          "Burundi": { status: "far", percentBelow: 460.0 },
          "Cabo Verde": { status: "met", percentBelow: 0 },
          "Cameroon": { status: "far", percentBelow: 268.9 },
          "Central African Republic": { status: "far", percentBelow: 888.2 },
          "Chad": { status: "far", percentBelow: 967.9 },
          "Comoros": { status: "far", percentBelow: 155.5 },
          "Congo": { status: "far", percentBelow: 244.4 },
          "Côte d'Ivoire": { status: "far", percentBelow: 412.8 },
          "Democratic Republic of the Congo": { status: "far", percentBelow: 510.1 },
          "Djibouti": { status: "far", percentBelow: 131.3 },
          "Egypt": { status: "met", percentBelow: 0 },
          "Equatorial Guinea": { status: "far", percentBelow: 148.1 },
          "Eritrea": { status: "far", percentBelow: 316.2 },
          "Eswatini": { status: "far", percentBelow: 68.5 },
          "Ethiopia": { status: "far", percentBelow: 178.5 },
          "Gabon": { status: "far", percentBelow: 232.4 },
          "Gambia": { status: "far", percentBelow: 406.2 },
          "Ghana": { status: "far", percentBelow: 234.7 },
          "Guinea": { status: "far", percentBelow: 605.9 },
          "Guinea-Bissau": { status: "far", percentBelow: 622.0 },
          "Kenya": { status: "far", percentBelow: 441.1 },
          "Lesotho": { status: "far", percentBelow: 582.9 },
          "Liberia": { status: "far", percentBelow: 796.7 },
          "Libya": { status: "met", percentBelow: 0 },
          "Madagascar": { status: "far", percentBelow: 536.3 },
          "Malawi": { status: "far", percentBelow: 221.4 },
          "Mali": { status: "far", percentBelow: 424.8 },
          "Mauritania": { status: "far", percentBelow: 444.4 },
          "Mauritius": { status: "met", percentBelow: 0 },
          "Morocco": { status: "met", percentBelow: 0 },
          "Mozambique": { status: "close", percentBelow: 17.5 },
          "Namibia": { status: "far", percentBelow: 98.4 },
          "Niger": { status: "far", percentBelow: 400.4 },
          "Nigeria": { status: "far", percentBelow: 1318.3 },
          "Rwanda": { status: "far", percentBelow: 227.8 },
          "Sao Tome and Principe": { status: "close", percentBelow: 7.7 },
          "Senegal": { status: "far", percentBelow: 239.2 },
          "Seychelles": { status: "met", percentBelow: 0 },
          "Sierra Leone": { status: "far", percentBelow: 405.1 },
          "Somalia": { status: "far", percentBelow: 703.7 },
          "South Africa": { status: "far", percentBelow: 68.0 },
          "South Sudan": { status: "far", percentBelow: 888.3 },
          "Sudan": { status: "far", percentBelow: 265.3 },
          "Togo": { status: "far", percentBelow: 398.4 },
          "Tunisia": { status: "met", percentBelow: 0 },
          "Uganda": { status: "far", percentBelow: 143.3 },
          "United Republic of Tanzania": { status: "far", percentBelow: 294.1 },
          "Zambia": { status: "moderate", percentBelow: 22.1 },
          "Zimbabwe": { status: "far", percentBelow: 410.9 }
        }
      },
      policyInsights: [
        "Historic 48% reduction since 2000 proves maternal deaths are preventable - but progress insufficient to meet 2030 SDG target for 85% of African countries",
        "Only 8 countries meet the target of <70 per 100,000 - Egypt's success (17) demonstrates what's achievable with universal skilled birth attendance and emergency obstetric care",
        "Nigeria accounts for 19% of global maternal deaths despite having only 2.6% of world population - crisis driven by low facility delivery (39%) and inequitable access to care",
        "43 countries remain 'far from target' (>200% gap), requiring transformational investments in skilled health workforce, functional referral systems, and comprehensive sexual/reproductive health services",
        "Most deaths preventable through 'three delays' framework: reducing delays in (1) deciding to seek care, (2) reaching health facility, (3) receiving quality emergency care upon arrival"
      ]
    }
  }
];

// ============================================================================
// EXPORT ALL CHARTS
// ============================================================================

export const CHART_CONFIGS: ChartConfig[] = [
  ...publicHealthFinancingCharts,
  ...abujaDeclarationCharts,
  ...gdpShareCharts,
  ...oopCharts,
  ...financingStructureCharts,
  ...uhcCharts,
  ...infantMortalityCharts,
  ...maternalMortalityCharts
];

// Helper functions
export function getChartBySlug(slug: string): ChartConfig | undefined {
  return CHART_CONFIGS.find(chart => chart.slug === slug);
}

export function getChartsByTopic(topicId: string): ChartConfig[] {
  return CHART_CONFIGS.filter(chart => chart.topicId === topicId);
}

export function getFeaturedCharts(): ChartConfig[] {
  return CHART_CONFIGS.filter(chart => chart.featured);
}
