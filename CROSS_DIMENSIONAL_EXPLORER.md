# Cross-Dimensional Analysis Explorer

## Overview

The Cross-Dimensional Analysis Explorer is a powerful new feature that allows users to explore relationships between different dimensions of health financing data. Instead of viewing pre-calculated cross-dimensional percentages, users can now interactively analyze how financing, structure, coverage, and outcomes relate to each other.

## Access

The explorer is available at:
- **URL**: http://localhost:3000/cross-dimensional
- **Navigation**: Click "Cross-Dimensional" in the main header navigation

## Features

### 1. Four Analysis Themes

Users can select from 4 cross-dimensional analysis themes:

#### 3.7 Financing × UHC
Explore how different financing indicators relate to Universal Health Coverage (UHC) levels.

**Financing Indicators Available**:
- Out-of-Pocket Spending (% of THE)
- Government Spending (% of THE)
- External Spending (% of THE)
- Voluntary Prepayments (% of THE)
- Total Health Expenditure (% of GDP)
- Government Health Expenditure (% of GDP)
- Government Health Expenditure Per Capita
- Total Health Expenditure Per Capita
- Catastrophic Health Spending

**UHC Indicators**:
- UHC Service Coverage Index

#### 3.8 Financing × Outcomes
Explore how financing indicators relate to health outcomes.

**Financing Indicators**: Same as 3.7

**Outcome Indicators**:
- Neonatal Mortality Rate
- Maternal Mortality Ratio

#### 3.9 Structure × UHC
Explore how financing structure relates to UHC coverage.

**Structure Indicators**:
- Out-of-Pocket (% of THE)
- Government (% of THE)
- External (% of THE)
- Voluntary Prepayments (% of THE)
- Domestic Private (% of THE)
- Excluding OOP Private (% of THE)
- Other Private (% of THE)

**UHC Indicators**:
- UHC Service Coverage Index

#### 3.10 Structure × Outcomes
Explore how financing structure relates to health outcomes.

**Structure Indicators**: Same as 3.9

**Outcome Indicators**:
- Neonatal Mortality Rate
- Maternal Mortality Ratio

### 2. Four Visualization Types

Each theme offers 4 different ways to visualize the relationships:

#### Scatter Plot (Recommended)
- **Purpose**: Shows the direct relationship between two indicators
- **Features**:
  - Each point represents a country
  - Color-coded by income group (Low, Lower-middle, Upper-middle, High)
  - Interactive tooltips showing country details
  - Correlation coefficient displayed
  - Total observations count
- **Use Case**: Identify patterns, outliers, and strength of relationships

#### Cross-tabulation Table
- **Purpose**: Shows country distribution across quartile categories
- **Features**:
  - Divides both indicators into Low/Medium/High categories (based on quartiles)
  - Shows count and percentage in each cell
  - Row and column totals
  - Easy to identify concentration patterns
- **Use Case**: Understand distribution and identify dominant patterns

#### Dual-axis Chart
- **Purpose**: Shows trends over time for both indicators
- **Features**:
  - Two Y-axes (left and right) for different scales
  - Line charts showing average values by year
  - Easy comparison of temporal trends
  - Both indicators visible simultaneously
- **Use Case**: Identify how relationships change over time

#### Correlation Matrix/Heatmap
- **Purpose**: Shows correlations between ALL indicators in both dimensions
- **Features**:
  - Color-coded correlation coefficients
  - Green: Positive correlation (darker = stronger)
  - Red: Negative correlation (darker = stronger)
  - Gray: Weak correlation
  - Legend with interpretation guide
- **Use Case**: Identify which pairs of indicators have the strongest relationships

### 3. Interactive Filters

All visualizations can be filtered by:

- **Year**: Select a specific year or view all years combined
- **Income Group**: Filter by Low, Lower-middle, Upper-middle, or High income
- **Region**: Filter by African subregion

Filters update all visualizations in real-time.

### 4. Dynamic Indicator Selection

For Scatter Plot, Cross-tabulation, and Dual-axis views:
- Users can select any indicator from Dimension 1 (left dropdown)
- Users can select any indicator from Dimension 2 (right dropdown)
- The visualization updates instantly when selections change

For Correlation Matrix:
- All indicators from both dimensions are shown automatically
- No individual indicator selection needed

## How It Differs from Excel Groupings

In the Excel analysis, cross-dimensional indicators were pre-calculated as percentages:
- Example: "% of countries meeting OOP benchmark AND having UHC >50th percentile"

**In the platform**:
- Users select the RAW indicators they want to explore (e.g., "Out-of-Pocket %" and "UHC Index")
- The platform calculates relationships dynamically
- Users can explore ANY combination of indicators
- Multiple visualization types show different aspects of the relationship
- Interactive filters enable deeper analysis

## Example Use Cases

### Use Case 1: "Do countries with higher government spending have better UHC coverage?"

1. Select Theme: **3.7 Financing × UHC**
2. Select Visualization: **Scatter Plot**
3. Dimension 1: **Government Health Expenditure Per Capita**
4. Dimension 2: **UHC Service Coverage Index**
5. Result: See correlation, identify outliers, and compare by income group

### Use Case 2: "How has the relationship between OOP spending and maternal mortality changed over time?"

1. Select Theme: **3.8 Financing × Outcomes**
2. Select Visualization: **Dual-axis Chart**
3. Dimension 1: **Out-of-Pocket Spending (% of THE)**
4. Dimension 2: **Maternal Mortality Ratio**
5. Result: See temporal trends and identify if relationship strengthens or weakens

### Use Case 3: "Which financing structure indicators have the strongest relationship with UHC?"

1. Select Theme: **3.9 Structure × UHC**
2. Select Visualization: **Correlation Matrix**
3. Result: See all structure indicators ranked by correlation strength with UHC

### Use Case 4: "What's the distribution pattern of countries across OOP spending and neonatal mortality?"

1. Select Theme: **3.8 Financing × Outcomes**
2. Select Visualization: **Cross-tabulation**
3. Dimension 1: **Out-of-Pocket Spending (% of THE)**
4. Dimension 2: **Neonatal Mortality Rate**
5. Result: See how many countries fall into each category combination

## Technical Implementation

### Components Created
- `/frontend/health-financing-dashboard/src/pages/CrossDimensional/CrossDimensionalExplorer.tsx` - Main component
- `/frontend/health-financing-dashboard/src/pages/CrossDimensional/CrossDimensionalExplorer.css` - Styling

### Data Source
- Fetches from: `http://localhost:5000/api/master-dataset`
- Uses the complete master dataset (91 fields)
- Filters out null/invalid values for selected indicators
- Applies user-selected filters (year, income, region)

### Visualizations
- Built with Recharts library
- Responsive design (adapts to screen size)
- Interactive tooltips and legends
- Color-coded for clarity

### Navigation
- Added to main header: "Cross-Dimensional" link
- Route: `/cross-dimensional`
- Integrated with existing React Router setup

## Benefits Over Pre-calculated Indicators

1. **Flexibility**: Explore any combination of indicators, not just pre-defined ones
2. **Multiple Perspectives**: View the same relationship in 4 different ways
3. **Deeper Insights**: Correlation coefficients, temporal trends, distribution patterns
4. **Interactive Filtering**: Focus on specific years, income groups, or regions
5. **Better Understanding**: See actual data points, not just summary percentages
6. **Discovery**: Find unexpected relationships and patterns

## Future Enhancements (Potential)

- Export visualizations as images
- Download filtered data as CSV
- Add regression lines to scatter plots
- Include confidence intervals
- Add more outcome indicators (life expectancy, etc.)
- Enable comparison of multiple time periods
- Add statistical significance testing

## Summary

The Cross-Dimensional Analysis Explorer transforms the static Excel cross-dimensional tables into an interactive, multi-faceted analysis tool. Users can now explore relationships between financing, structure, coverage, and outcomes in ways that provide deeper insights and enable data-driven decision making.
