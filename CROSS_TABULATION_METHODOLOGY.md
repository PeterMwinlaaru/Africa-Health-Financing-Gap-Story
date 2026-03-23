# Cross-Tabulation Methodology

**Platform**: Africa Health Financing Gap Analysis Platform
**Feature**: Cross-Dimensional Analysis - Cross-tabulation View
**Date**: 2026-03-22

---

## Overview

The Cross-tabulation visualization categorizes countries into **Low**, **Medium**, and **High** groups based on their indicator values, allowing users to explore the relationship between two indicators through a contingency table.

---

## Categorization Method: Quartile-Based Classification

### How It Works

For each indicator selected (Input Indicator and Outcome Indicator), countries are classified using **quartile-based thresholds**:

1. **Data Sorting**: All country-year observations for an indicator are sorted from lowest to highest value

2. **Quartile Calculation**:
   - **Q1 (25th percentile)**: The value below which 25% of observations fall
   - **Q3 (75th percentile)**: The value below which 75% of observations fall

3. **Category Assignment**:
   - **Low**: Values ≤ Q1 (bottom 25% of observations)
   - **Medium**: Values > Q1 and ≤ Q3 (middle 50% of observations)
   - **High**: Values > Q3 (top 25% of observations)

### Why Quartiles?

- **Data-driven**: Thresholds are determined by the actual distribution of data, not arbitrary cutoffs
- **Balanced**: Ensures meaningful representation in Low and High categories (25% each)
- **Robust**: Less sensitive to extreme outliers compared to other methods
- **Comparable**: Standardized approach works across different indicators with different units and scales

---

## Grouping Behavior

### No Grouping (Default)

When **Group By: No Grouping** is selected:
- Quartiles are calculated using **all countries** in the dataset
- A single cross-tabulation table is displayed
- Countries are categorized relative to the overall African distribution

**Example**:
- If Government Health Expenditure per capita Q1 = $20 and Q3 = $80
- All countries with ≤$20 are classified as "Low"
- All countries with >$80 are classified as "High"

### Group By Income Level

When **Group By: Income Level** is selected:
- Quartiles are calculated **within each income group** (Low, Lower-middle, Upper-middle, High)
- Separate cross-tabulation tables are displayed for each income group
- Countries are categorized **relative to their income peers**

**Example**:
- Low-income countries are compared only to other low-income countries
- A low-income country in the top quartile among its peers is classified as "High" (even if its absolute value would be "Low" globally)
- This reveals **within-group patterns** and relative performance

### Group By Sub-region

When **Group By: Sub-region** is selected:
- Quartiles are calculated **within each sub-region** (Eastern, Western, Southern, Northern, Central Africa)
- Separate cross-tabulation tables are displayed for each sub-region
- Countries are categorized **relative to their regional peers**

**Example**:
- Eastern African countries are compared only to other Eastern African countries
- Reveals **regional patterns** and relative performance within geographic contexts

---

## Interpretation Guide

### Reading the Cross-tabulation Table

Each cell in the table shows:
- **Count**: Number of countries in that category combination
- **Percentage**: Percentage of total observations in that category combination

**Example Table**:
```
                        UHC Coverage Index
Gov Health Exp    |   Low   |  Medium  |  High  | Total
------------------+---------+----------+--------+-------
Low               |   45    |    12    |   3    |  60
                  | (30.0%) |  (8.0%)  | (2.0%) | (40%)
------------------+---------+----------+--------+-------
Medium            |   18    |    30    |  12    |  60
                  | (12.0%) | (20.0%)  | (8.0%) | (40%)
------------------+---------+----------+--------+-------
High              |    6    |    12    |  12    |  30
                  |  (4.0%) |  (8.0%)  | (8.0%) | (20%)
```

**Insights from this example**:
- Strong diagonal pattern suggests positive relationship
- 45 observations (30%) have both Low government health expenditure AND Low UHC coverage
- Only 12 observations (8%) have High government health expenditure AND High UHC coverage
- Off-diagonal cells show exceptions (e.g., countries with Low spending but High coverage)

### Key Patterns to Look For

1. **Diagonal Dominance**: High counts along the diagonal (Low-Low, Medium-Medium, High-High) suggest strong positive correlation

2. **Off-Diagonal Clustering**: High counts in opposite corners (Low-High, High-Low) suggest negative correlation or inverse relationship

3. **Uneven Distribution**: Clustering in specific cells reveals common patterns or outliers

4. **Group Differences**: When using grouping, comparing tables across income levels or sub-regions reveals how relationships vary by context

---

## Technical Notes

### Quartile Calculation Formula

```
Q1_position = floor(n * 0.25)
Q3_position = floor(n * 0.75)

Where n = number of observations
```

### Handling Missing Data

- Only observations with **valid data for both indicators** are included
- Missing values (null, undefined, non-numeric) are excluded from quartile calculations
- This ensures accurate categorization based on available data

### Year Filter Interaction

- When a specific year is selected, quartiles are calculated using only that year's data
- When "All Years" is selected, quartiles use the entire time series (2000-2023)
- This allows comparing recent patterns to historical distributions

---

## Use Cases

### Policy Analysis

**Scenario**: Analyzing the relationship between government health expenditure (% of budget) and maternal mortality

- **No Grouping**: Shows overall continental patterns
- **Group by Income**: Reveals whether the relationship differs between low-income and middle-income countries
- **Group by Sub-region**: Identifies whether regional factors (e.g., disease burden, health system maturity) modify the relationship

### Gap Identification

Cross-tabulation helps identify:
- **High performers**: Countries in "Low input, High outcome" cells (efficient)
- **Underperformers**: Countries in "High input, Low outcome" cells (inefficient)
- **Typical performers**: Countries on the diagonal (expected relationship)

### Benchmarking

Within grouped tables, countries can benchmark against:
- Income group peers
- Regional neighbors
- Continental averages

---

## Limitations

1. **Sample Size**: Small groups (e.g., High-income African countries) may have unstable quartiles
2. **Temporal Variation**: Quartiles calculated across all years may not reflect current distributions
3. **Non-linear Relationships**: Quartile categorization may oversimplify complex relationships
4. **Causation**: Cross-tabulation shows association, not causation

---

## Complementary Analyses

For deeper insights, combine Cross-tabulation with:

- **Scatter Plot**: See continuous relationship and outliers
- **Dual-axis Chart**: Observe trends over time
- **Correlation Matrix**: Quantify strength of linear relationships

---

## Data Source

All data sourced from **WHO Global Health Expenditure Database (GHED)**
- **Coverage**: 54 African countries, 2000-2023
- **Update Frequency**: Annually (WHO releases updates Q2-Q3)

---

**Document Version**: 1.0
**Last Updated**: 2026-03-22
**Platform Version**: 1.0
