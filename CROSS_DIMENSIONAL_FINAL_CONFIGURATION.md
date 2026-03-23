# Cross-Dimensional Explorer - Final Configuration

**Update Date**: 2026-03-22
**Status**: ✅ **COMPLETED - Focused Input/Outcome Analysis**

---

## Final Configuration

### First Dropdown (Input Indicators) - LIMITED TO 6 INDICATORS

The X-axis / Input Indicator dropdown now shows **only 6 specific indicators**:

1. **Government Health Expenditure Per Capita** (US$)
   - Category: Public Health Financing
   - Field: `Gov exp Health per capita`

2. **Total Health Expenditure Per Capita** (US$)
   - Category: Public Health Financing
   - Field: `Expenditure per capita current`

3. **Government Health Budget Share** (% of Budget)
   - Category: Budget Priority
   - Field: `Gov exp Health on budget`

4. **Government Health Expenditure** (% of GDP)
   - Category: Budget Priority
   - Field: `Gov exp Health on GDP`

5. **Out-of-Pocket Spending** (% of THE)
   - Category: Financial Protection / Financing Structure
   - Field: `Out-of-pocket on health exp`

6. **External on Health Expenditure** (% of THE)
   - Category: Financing Structure
   - Field: `External on health exp`

### Second Dropdown (Outcome Indicators) - LIMITED TO 3 INDICATORS

The Y-axis / Outcome Indicator dropdown shows **only 3 indicators**:

1. **UHC Service Coverage Index** (Index 0-100)
   - Category: UHC Coverage
   - Field: `Universal health coverage`

2. **Neonatal Mortality Rate** (per 1,000 live births)
   - Category: Health Outcomes
   - Field: `Neonatal mortality rate`

3. **Maternal Mortality Ratio** (per 100,000 live births)
   - Category: Health Outcomes
   - Field: `Maternal mortality ratio`

---

## Analysis Combinations

### Total Possible Analyses
- **6 input indicators** × **3 outcome indicators** = **18 possible combinations**

### With 4 Visualization Types
- 18 combinations × 4 visualizations = **72 possible views**

### Key Questions Answerable

#### Government Spending → Outcomes
1. Does government health expenditure per capita improve UHC coverage?
2. Does government health expenditure per capita reduce neonatal mortality?
3. Does government health expenditure per capita reduce maternal mortality?

#### Budget Priority → Outcomes
4. Does higher budget allocation (% of budget) improve UHC coverage?
5. Does higher budget allocation reduce neonatal mortality?
6. Does higher budget allocation reduce maternal mortality?
7. Does government health spending as % of GDP improve UHC coverage?
8. Does government health spending as % of GDP reduce neonatal mortality?
9. Does government health spending as % of GDP reduce maternal mortality?

#### Total Spending → Outcomes
10. Does total health expenditure per capita improve UHC coverage?
11. Does total health expenditure per capita reduce neonatal mortality?
12. Does total health expenditure per capita reduce maternal mortality?

#### Financial Protection → Outcomes
13. Does high out-of-pocket spending reduce UHC coverage?
14. Does high out-of-pocket spending increase neonatal mortality?
15. Does high out-of-pocket spending increase maternal mortality?

#### External Funding → Outcomes
16. Does external health funding improve UHC coverage?
17. Does external health funding reduce neonatal mortality?
18. Does external health funding reduce maternal mortality?

---

## Visualization Types Available

### 1. Scatter Plot
- **Purpose**: See direct relationship with correlation coefficient
- **Example**: Government spending per capita vs UHC coverage
- **Features**:
  - Color-coded by income group
  - Interactive tooltips
  - Correlation coefficient displayed
  - Identify outliers

### 2. Cross-tabulation Table
- **Purpose**: See distribution patterns (Low/Medium/High categories)
- **Example**: Budget allocation vs Neonatal mortality
- **Features**:
  - Quartile-based categorization
  - Cell counts and percentages
  - Row and column totals

### 3. Dual-axis Chart
- **Purpose**: Compare trends over time (2000-2023)
- **Example**: Out-of-pocket spending vs Maternal mortality over time
- **Features**:
  - Two Y-axes with different scales
  - Average values by year
  - Temporal trend analysis

### 4. Correlation Matrix
- **Purpose**: See all relationships at once
- **Example**: All 6 inputs vs all 3 outcomes = 6×3 matrix
- **Features**:
  - Color-coded correlation coefficients
  - Green (positive), Red (negative), Gray (weak)
  - Multi-select to choose specific indicators

---

## Filters Available

All visualizations can be filtered by:

1. **Year**: 2000-2023 (24 years) or All Years
2. **Income Group**: Low, Lower-middle, Upper-middle, High, or All
3. **Region**: African subregions or All Regions

---

## Code Changes Made

### 1. Added Allowed Input Indicators Constant
```typescript
const ALLOWED_INPUT_INDICATORS = [
  'Gov exp Health per capita',
  'Expenditure per capita current',
  'Gov exp Health on budget',
  'Gov exp Health on GDP',
  'Out-of-pocket on health exp',
  'External on health exp',
];
```

### 2. Filtered First Dropdown
Updated the first dropdown to only show indicators in `ALLOWED_INPUT_INDICATORS`:
```typescript
const filteredIndicators = indicators.filter(ind =>
  ALLOWED_INPUT_INDICATORS.includes(ind.value)
);
```

### 3. Updated Correlation Matrix Set 1
Limited Set 1 (Input Indicators) to the 6 allowed input indicators:
```typescript
const filteredIndicators = indicators.filter(ind =>
  ALLOWED_INPUT_INDICATORS.includes(ind.value)
);
```

### 4. Updated Correlation Matrix Set 2
Limited Set 2 (Outcome Indicators) to UHC Coverage and Health Outcomes only:
```typescript
.filter(([category]) =>
  category === 'UHC Coverage' || category === 'Health Outcomes'
)
```

### 5. Updated Default Selections for Correlation Matrix
- Set 1: Defaults to all 6 allowed input indicators
- Set 2: Defaults to all 3 outcome indicators

### 6. Updated Labels
- First dropdown: "Select Input Indicator (X-axis / Rows)"
- Second dropdown: "Select Outcome Indicator (Y-axis / Columns)"
- Correlation Set 1: "Select Input Indicators (Set 1)"
- Correlation Set 2: "Select Outcome Indicators (Set 2)"

---

## Compilation Status

✅ **TypeScript**: No errors
✅ **Webpack**: Compiled successfully
✅ **No issues found**

---

## Testing Checklist

### Test 1: Verify Input Indicators (First Dropdown)
- [ ] Go to http://localhost:3000/cross-dimensional
- [ ] Click first dropdown
- [ ] Verify **ONLY 6 indicators** are shown:
  - Government Health Expenditure Per Capita
  - Total Health Expenditure Per Capita
  - Government Health Budget Share (% of budget)
  - Government Health Expenditure (% of GDP)
  - Out-of-Pocket Spending (% of THE)
  - External (% of THE)
- [ ] Verify NO other indicators appear

### Test 2: Verify Outcome Indicators (Second Dropdown)
- [ ] Click second dropdown
- [ ] Verify **ONLY 3 indicators** are shown:
  - UHC Service Coverage Index
  - Neonatal Mortality Rate
  - Maternal Mortality Ratio
- [ ] Verify NO other indicators appear

### Test 3: Test Scatter Plot
- [ ] Select "Government Health Expenditure Per Capita"
- [ ] Select "UHC Service Coverage Index"
- [ ] Verify scatter plot displays
- [ ] Check correlation coefficient is shown
- [ ] Hover over points to see tooltips

### Test 4: Test Cross-tabulation
- [ ] Click "Cross-tabulation" tab
- [ ] Select "Out-of-Pocket Spending (% of THE)"
- [ ] Select "Neonatal Mortality Rate"
- [ ] Verify 3×3 table appears
- [ ] Check percentages add up to 100%

### Test 5: Test Dual-axis Chart
- [ ] Click "Dual-axis Chart" tab
- [ ] Select "Government Health Expenditure (% of GDP)"
- [ ] Select "Maternal Mortality Ratio"
- [ ] Verify two lines appear (different Y-axes)
- [ ] Check data spans 2000-2023

### Test 6: Test Correlation Matrix
- [ ] Click "Correlation Matrix" tab
- [ ] Verify Set 1 shows **6 input indicators** (all pre-selected)
- [ ] Verify Set 2 shows **3 outcome indicators** (all pre-selected)
- [ ] Check matrix is 6×3 (6 rows × 3 columns)
- [ ] Verify color coding for correlation strength

### Test 7: Test Filters
- [ ] Return to Scatter Plot
- [ ] Select Year: 2020
- [ ] Select Income Group: Low
- [ ] Select a specific Region
- [ ] Verify data updates for each filter
- [ ] Reset all filters to "All"

### Test 8: Try All Combinations
- [ ] Test each of the 6 input indicators
- [ ] Against each of the 3 outcome indicators
- [ ] Verify all 18 combinations work without errors

---

## Rationale for This Configuration

### Why These 6 Input Indicators?

1. **Government Health Expenditure Per Capita**: Direct measure of government investment
2. **Total Health Expenditure Per Capita**: Overall health spending capacity
3. **Government Health Budget Share**: Priority given to health (Abuja Declaration)
4. **Government Health Expenditure (% of GDP)**: Macro-level commitment (WHO benchmark)
5. **Out-of-Pocket Spending**: Financial protection / barrier to access
6. **External Funding**: Dependency on external resources

These 6 indicators capture the **most policy-relevant dimensions** of health financing:
- **Level** (per capita spending)
- **Priority** (budget share, % of GDP)
- **Structure** (OOP, External)
- **Protection** (OOP as barrier)

### Why These 3 Outcome Indicators?

1. **UHC Service Coverage Index**: Comprehensive measure of health system coverage
2. **Neonatal Mortality Rate**: Key indicator of healthcare quality and access
3. **Maternal Mortality Ratio**: Critical measure of health system performance

These 3 represent the **core outcomes** health financing aims to improve:
- **Coverage**: How many people can access services
- **Outcomes**: Whether those services save lives (mothers and newborns)

### What This Configuration Enables

This focused configuration allows policymakers and researchers to answer the fundamental question:

**"Which financing strategies (spending levels, budget priorities, and financing structures) are most effective at improving health coverage and saving lives?"**

---

## Example Policy Questions

1. **Abuja Declaration Impact**: Do countries meeting the 15% budget target have better UHC coverage?
2. **WHO Benchmark Impact**: Do countries spending >5% of GDP on health have lower mortality?
3. **OOP Barrier**: Does high out-of-pocket spending prevent UHC achievement?
4. **External Dependency**: Is reliance on external funding associated with poor outcomes?
5. **Spending Efficiency**: Which spending level (per capita) yields best outcomes?
6. **Fiscal Commitment**: Does % of GDP spending matter more than absolute spending?

---

## Summary

✅ **First dropdown limited to 6 input indicators**
✅ **Second dropdown limited to 3 outcome indicators**
✅ **Total of 18 input-outcome combinations**
✅ **4 visualization types for each combination = 72 views**
✅ **Correlation matrix: 6×3 = all relationships at once**
✅ **Filters: Year, Income, Region**
✅ **Compilation successful with no errors**
✅ **Ready for use at http://localhost:3000/cross-dimensional**

The Cross-Dimensional Explorer is now a **focused, policy-relevant tool** for analyzing how key health financing inputs relate to critical coverage and outcome measures.

---

**Files Modified**:
- `frontend/health-financing-dashboard/src/pages/CrossDimensional/CrossDimensionalExplorer.tsx`
  - Added `ALLOWED_INPUT_INDICATORS` constant
  - Filtered first dropdown to 6 indicators
  - Filtered correlation Set 1 to 6 indicators
  - Updated default correlation selections
  - Updated labels for clarity
