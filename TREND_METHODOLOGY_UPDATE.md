# Progress Classification & Pace Assessment Methodology

## Overview
Updated methodology for classifying country progress and assessing pace toward targets. Replaces the previous "Average Annual Change" metric with more actionable analytics.

## Changes Made (2026-03-29)

### 1. Progress Classification — Indicator-Specific Stagnation Thresholds
Countries are classified as improving, stagnating, or worsening based on 5-year trends (2018-2023). The previous universal 2% threshold has been replaced with indicator-specific thresholds:

| Indicator Type | Examples | Stagnation Threshold | Method |
|---|---|---|---|
| Monetary | Gov exp Health per capita | CAGR < 1% | Compound Annual Growth Rate |
| Mortality rates | NMR, MMR | CAGR < 1% reduction | Compound Annual Growth Rate |
| Percentage-point | % of GDP, % of budget, OOP, External | < 0.5 pp absolute change over 5 years | Absolute change |
| Index scores | UHC index | < 1 point/year (< 5 points over 5 years) | Absolute change |

CAGR formula: (V_end / V_begin)^(1/n) - 1, where n = number of years.

### 2. Direction Awareness
For indicators where lower values represent improvement (mortality rates, out-of-pocket spending, external dependency), a decrease is classified as improving. Previously, the code treated all increases as improvement regardless of indicator type.

### 3. Configurable Thresholds
Users can adjust the stagnation thresholds via interactive sliders on the Progress Analysis tab. Only the relevant slider for the current indicator type is shown. A "Reset to Default" button restores the default values.

### 4. Pace Assessment (Replaces Average Annual Change)
The uninformative "Average Annual Change" metric has been replaced with "Pace Assessment" which provides:
- The period and start/end values (e.g., "Between 2018 and 2023, the continental average moved from $65.01 to $70.96")
- Years to reach the target at current pace
- The pace required to reach the target by 2030
- A multiplier showing how much faster progress needs to be (e.g., "3.8x the current rate")

For indicators without a target, it provides context on the direction and rate of change.

### 5. Gap Calculations
Gap-to-threshold statistics now exclude countries that have already met the threshold, computing the average gap only from countries still below (or above) the target.

### 6. Mortality Display
Mortality values (NMR, MMR) are displayed as whole numbers in summary statistics (averages, gaps, changes) since they represent death counts. Charts and tooltips retain decimal precision from the source data.

### 7. Period Standardization
All calculations now use a consistent 2018-2023 window, matching the 5-year progress classification lookback period. The previous 2016-2023 period has been removed.

## Implementation Files
- `src/utils/analyticsCalculator.ts` — Core calculation logic, exports ClassificationThresholds interface and DEFAULT_THRESHOLDS
- `src/components/EnhancedAnalytics/EnhancedAnalytics.tsx` — UI for threshold sliders and methodology notes
- `src/config/charts.ts` — Hardcoded fallback values (paceAssessment field)
- `src/utils/highlightsCalculator.ts` — Gap calculations excluding met countries

## Date of Implementation
March 29, 2026
