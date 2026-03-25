# Trend Methodology Update

## Overview
Updated trend reporting methodology to provide more meaningful and appropriate measures of change based on indicator type.

## New Methodology (Implemented 2026-03-25)

### For Percentage Indicators
**Indicators that are already measured as percentages** (e.g., "% of GDP", "% of budget", "% of health expenditure"):
- **Report**: Average year-on-year **percentage POINT** change from 2016 to 2023
- **Formula**: (Value₂₀₂₃ - Value₂₀₁₆) / 7 years
- **Example**: Gov exp Health on GDP
  - 2016: 1.78% of GDP
  - 2023: 1.87% of GDP
  - Change: +0.09 percentage points over 7 years
  - **Result**: +0.01 percentage points per year

**Why percentage points?** For indicators already expressed as percentages, absolute point changes are more meaningful than relative percentages. Going from 5% to 6% is a 1 percentage point increase, not a 20% increase.

### For Non-Percentage Indicators
**Indicators measured in other units** (e.g., dollars, mortality rates, index scores):
- **Report**: Average year-on-year **percentage** change from 2016 to 2023
- **Formula**: Average of [(Value₂₀₁₇ - Value₂₀₁₆) / Value₂₀₁₆ × 100, (Value₂₀₁₈ - Value₂₀₁₇) / Value₂₀₁₇ × 100, ..., (Value₂₀₂₃ - Value₂₀₂₂) / Value₂₀₂₂ × 100]
- **Example**: Gov exp Health per capita
  - Calculate percentage change for each consecutive year pair:
    - 2016→2017: % change
    - 2017→2018: % change
    - ...
    - 2022→2023: % change
  - Average all 7 year-on-year changes
  - **Result**: Average annual percentage change

**Why year-on-year averaging?** For non-percentage indicators, averaging the actual year-on-year percentage changes accounts for compounding and provides a more accurate measure of average annual growth than simply dividing total change by years. This is the proper compound annual growth rate (CAGR) methodology.

## Indicator Classification

### Percentage Indicators (use percentage point changes)
1. Gov exp Health on GDP (% of GDP)
2. Gov exp Health on budget (% of government budget)
3. Out-of-pocket on health exp (% of health expenditure)
4. Govern on health exp (% of health expenditure)
5. External on health exp (% of health expenditure)
6. Voluntary Prepayments on health exp (% of health expenditure)
7. Private on health exp (% of health expenditure)

### Non-Percentage Indicators (use percentage changes)
1. Gov exp Health per capita (USD)
2. Universal health coverage (index 0-100)
3. Neonatal mortality rate (per 1,000 live births)
4. Maternal mortality ratio (per 100,000 live births)
5. Gap indicators (USD or points)

## Implementation Details

### Code Changes
- **File**: `src/utils/analyticsCalculator.ts`
- **Function**: Added `isPercentageIndicator()` helper
- **Updates**:
  - Continental Overview trend calculation
  - Progress Analysis average annual change calculation
- **Period**: Changed from baseline year (2000) to standardized 2016-2023 period

### Display Format
**Percentage Indicators**:
```
+0.01 pp/year (percentage point change, 2016-2023)
```

**Non-Percentage Indicators**:
```
+X.X% per year (percentage change, 2016-2023)
```

### Explicit Methodology Statements
Each trend now includes explanatory text:
- **Percentage indicators**: "Calculated as absolute change in percentage points divided by number of years"
- **Non-percentage indicators**: "Calculated as average of year-on-year percentage changes"

## Examples from Real Data

### Example 1: Gov exp Health on GDP (Percentage Indicator)
```
2016 Average: 1.78% of GDP
2023 Average: 1.87% of GDP
Trend: +0.01 percentage points per year (2016-2023)
Methodology: Calculated as (1.87 - 1.78) / 7 years = +0.01 pp/year
```

### Example 2: Gov exp Health per capita (Non-Percentage Indicator)
```
2016-2023 Year-on-Year Changes:
  2016→2017: +X%
  2017→2018: +Y%
  ...
  2022→2023: +Z%
Trend: Average of all year-on-year changes
Methodology: Average of [(Value₂₀₁₇ - Value₂₀₁₆)/Value₂₀₁₆ × 100, ..., (Value₂₀₂₃ - Value₂₀₂₂)/Value₂₀₂₂ × 100]
```

### Example 3: Universal health coverage (Non-Percentage Indicator)
```
2016-2023 Year-on-Year Changes:
  Calculate % change for each consecutive year
  Average all 7 year-on-year percentage changes
Trend: Average annual percentage change (2016-2023)
Methodology: Average of year-on-year percentage changes (proper CAGR methodology)
```

## Benefits of New Methodology

1. **More Intuitive**: Percentage point changes for percentage indicators avoid confusion
2. **Appropriate Scale**: Each indicator type uses the most meaningful measure of change
3. **Standardized Period**: All trends use 2016-2023 for consistency
4. **Transparent**: Methodology is explicitly stated in the display text
5. **Policy-Relevant**: Matches how policymakers typically discuss these indicators

## Migration Notes

### Static Values in charts.ts
The static trend values in `src/config/charts.ts` need to be updated to reflect this new methodology. These were previously calculated using:
- Old: Percentage change from 2000 to 2023
- New: Appropriate measure from 2016 to 2023

### Dynamic Analytics
The `analyticsCalculator.ts` utility now automatically:
- Detects indicator type
- Applies correct methodology
- Includes explanatory text
- Uses 2016-2023 period

## Testing

All three indicator types tested with corrected methodology:
- ✅ Percentage indicators (Gov exp Health on GDP): Average annual percentage point change
- ✅ Monetary indicators (Gov exp Health per capita): Average of year-on-year percentage changes
- ✅ Index indicators (Universal health coverage): Average of year-on-year percentage changes

**Note**: The specific values will be calculated dynamically from actual year-on-year changes in the data.

## Date of Implementation
March 25, 2026
