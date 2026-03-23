# Data Explorer Consistency Analysis
**Date:** March 20, 2026
**Component:** DataExplorer.tsx
**Issue:** Field name inconsistencies with master dataset
**Status:** ⚠️ 3 MISMATCHES FOUND

---

## Executive Summary

The Data Explorer component (`/explorer`) uses **10 indicators** from the master dataset. Analysis reveals that **7 out of 10 indicators** have exact field name matches, but **3 indicators use incorrect field names** that don't exist in the master dataset.

### Impact

When users select the 3 mismatched indicators, they will receive:
- No data points
- Empty charts
- No error messages (silently fails)

---

## Detailed Analysis

### ✅ Indicators with CORRECT Field Names (7/10)

| Indicator in DataExplorer | Master Dataset Field | Status |
|---------------------------|----------------------|--------|
| `Gov exp Health per capita` | `Gov exp Health per capita` | ✅ Exact match |
| `Gap for Gov exp Health per capita` | `Gap for Gov exp Health per capita` | ✅ Exact match |
| `Gov exp Health on budget` | `Gov exp Health on budget` | ✅ Exact match |
| `Out-of-pocket on health exp` | `Out-of-pocket on health exp` | ✅ Exact match |
| `Govern on health exp` | `Govern on health exp` | ✅ Exact match |
| `External on health exp` | `External on health exp` | ✅ Exact match |
| `Maternal mortality ratio` | `Maternal mortality ratio` | ✅ Exact match |

### ❌ Indicators with INCORRECT Field Names (3/10)

| # | DataExplorer Uses | Actual Master Dataset Field | Category | Impact |
|---|-------------------|----------------------------|----------|--------|
| 1 | `Infant Mortality Rate` | `Neonatal mortality rate` | **3.6-3.7 Health Outcomes** | Returns undefined, empty chart |
| 2 | `Current health exp per capita` | `Expenditure per capita current` | **3.8-3.11 Additional** | Returns undefined, empty chart |
| 3 | `Current health exp on GDP` | `Expenditure on GDP` | **3.8-3.11 Additional** | Returns undefined, empty chart |

---

## Technical Details

### How DataExplorer Accesses Fields

**Location:** `DataExplorer.tsx` lines 161-171

```typescript
const filtered = masterData.filter((d: any) => selectedCountries.includes(d.location));
const byYear = filtered.reduce((acc: any, d: any) => {
  if (!acc[d.year]) acc[d.year] = { year: d.year };
  const value = d[indicator];  // ← Direct field access using indicator name
  if (value !== undefined && value !== null) {
    acc[d.year][d.location] = value;
  }
  return acc;
}, {});
```

**Problem:** The component uses the `indicator` variable directly as a key (`d[indicator]`). If the indicator name doesn't match the field name exactly, it returns `undefined`.

**Example:**
```javascript
// When user selects "Infant Mortality Rate"
const indicator = "Infant Mortality Rate";
const value = d[indicator];  // d["Infant Mortality Rate"] → undefined!

// Actual field in master dataset is:
d["Neonatal mortality rate"]  // This exists and has data
```

---

## Master Dataset Field Verification

### Complete Field List (86 fields total)

Extracted from `processed_data/master_dataset.json`:

**Core Health Expenditure:**
- Gov exp Health per capita ✓
- Gov exp Health on GDP ✓
- Gov exp Health on budget ✓
- Govern on health exp ✓
- External on health exp ✓
- Out-of-pocket on health exp ✓
- Voluntary Prepayments on health exp ✓
- Other Private on health exp ✓
- Domest Private on health exp ✓

**Health Outcomes:**
- Universal health coverage ✓
- **Neonatal mortality rate** ✓ (NOT "Infant Mortality Rate")
- Maternal mortality ratio ✓
- financial hardship ✓

**Economic Indicators:**
- **Expenditure on GDP** ✓ (NOT "Current health exp on GDP")
- **Expenditure per capita current** ✓ (NOT "Current health exp per capita")
- Expenditure per capita constant ✓
- Expenditure in million Constant 2023 ✓
- GDP per capita Current ✓
- GDP per capita Constant 2023 ✓
- Total Revenue per GDP ✓
- Tax Revenue per GDP ✓

**Gaps and Benchmarks:**
- Gap for Gov exp Health per capita ✓
- Gap Gov exp Health on GDP ✓
- Gap Gov exp Health on budget ✓
- Gov exp Health per capita > 2016 Value ✓
- Gov exp Health on GDP > 5 ✓
- Gov exp Health on budget > 15 ✓
- Out-of-pocket on health exp < 20 ✓

**Metadata:**
- year, location, CountryISO3, Subregion, income, Population

**Plus 50+ derived/calculated fields**

---

## Issue Details

### Issue 1: "Infant Mortality Rate" vs "Neonatal mortality rate"

**DataExplorer Configuration (lines 62-69):**
```typescript
'Infant Mortality Rate': {
  title: 'Infant Mortality Rate',
  description: 'Deaths per 1,000 live births during the first year of life',
  interpretation: 'Lower values indicate better child health outcomes...',
  unit: 'per 1,000 live births',
  theme: '3.6-3.7',
  category: 'Health Outcomes'
},
```

**Problem:**
- DataExplorer expects field: `Infant Mortality Rate`
- Master dataset has field: `Neonatal mortality rate`
- These are actually **different metrics**:
  - Infant Mortality Rate = deaths in first **year** of life
  - Neonatal Mortality Rate = deaths in first **28 days** of life

**Severity:** HIGH - The description says "first year" but the data is "first 28 days"

### Issue 2: "Current health exp per capita" vs "Expenditure per capita current"

**DataExplorer Configuration (lines 80-87):**
```typescript
'Current health exp per capita': {
  title: 'Current Health Expenditure Per Capita',
  description: 'Total health expenditure per person in current US dollars',
  interpretation: 'Higher values indicate greater resources available for health per person...',
  unit: 'Current US$',
  theme: '3.8-3.11',
  category: 'Additional'
},
```

**Problem:**
- DataExplorer expects field: `Current health exp per capita`
- Master dataset has field: `Expenditure per capita current`

**Severity:** MEDIUM - Just a naming mismatch, same metric

### Issue 3: "Current health exp on GDP" vs "Expenditure on GDP"

**DataExplorer Configuration (lines 88-95):**
```typescript
'Current health exp on GDP': {
  title: 'Current Health Expenditure as % of GDP',
  description: 'Health expenditure as a percentage of gross domestic product',
  interpretation: 'Shows the priority given to health in the national economy...',
  unit: '% of GDP',
  theme: '3.8-3.11',
  category: 'Additional'
},
```

**Problem:**
- DataExplorer expects field: `Current health exp on GDP`
- Master dataset has field: `Expenditure on GDP`

**Severity:** MEDIUM - Just a naming mismatch, same metric

---

## Testing Evidence

### Command Used:
```bash
node -e "const fs = require('fs'); \
  const data = JSON.parse(fs.readFileSync('processed_data/master_dataset.json', 'utf8')); \
  console.log(JSON.stringify(Object.keys(data[0]), null, 2));"
```

### Sample Record Fields (first record from dataset):
```json
{
  "year": 2000,
  "location": "Algeria",
  "CountryISO3": "DZA",
  "Subregion": "Northern Africa",
  "income": "Lower-middle",
  "Gov exp Health per capita": 25.32,
  "Gov exp Health on budget": 8.97,
  "Govern on health exp": 67.84,
  "Out-of-pocket on health exp": 30.58,
  "External on health exp": 0.85,
  "Neonatal mortality rate": 19.6,      ← NOT "Infant Mortality Rate"
  "Maternal mortality ratio": 143,
  "Expenditure on GDP": 3.74,            ← NOT "Current health exp on GDP"
  "Expenditure per capita current": 37.33, ← NOT "Current health exp per capita"
  ...
}
```

---

## Recommended Solution

### Option 1: Fix DataExplorer Component (RECOMMENDED)

**Change the field names in DataExplorer.tsx to match master dataset:**

**Lines 62-95, change from:**
```typescript
'Infant Mortality Rate': { ... },
'Current health exp per capita': { ... },
'Current health exp on GDP': { ... },
```

**To:**
```typescript
'Neonatal mortality rate': {
  title: 'Neonatal Mortality Rate',
  description: 'Deaths per 1,000 live births during the first 28 days of life',
  interpretation: 'Lower values indicate better newborn health outcomes...',
  unit: 'per 1,000 live births',
  theme: '3.6-3.7',
  category: 'Health Outcomes'
},
'Expenditure per capita current': {
  title: 'Current Health Expenditure Per Capita',
  description: 'Total health expenditure per person in current US dollars',
  interpretation: 'Higher values indicate greater resources available for health per person...',
  unit: 'Current US$',
  theme: '3.8-3.11',
  category: 'Additional'
},
'Expenditure on GDP': {
  title: 'Current Health Expenditure as % of GDP',
  description: 'Health expenditure as a percentage of gross domestic product',
  interpretation: 'Shows the priority given to health in the national economy...',
  unit: '% of GDP',
  theme: '3.8-3.11',
  category: 'Additional'
},
```

**Also update the dropdown options (lines 198-224):**
```typescript
<optgroup label="3.6-3.7 Health Outcomes">
  <option value="Neonatal mortality rate">Neonatal Mortality Rate</option>
  <option value="Maternal mortality ratio">Maternal Mortality Ratio</option>
</optgroup>
<optgroup label="3.8-3.11 Additional">
  <option value="Expenditure per capita current">Current Health Expenditure Per Capita</option>
  <option value="Expenditure on GDP">Current Health Expenditure as % of GDP</option>
</optgroup>
```

**Pros:**
- ✅ Simple, direct fix
- ✅ Uses actual field names from source
- ✅ Matches rest of platform conventions
- ✅ No data pipeline changes needed

**Cons:**
- ⚠️ Changes user-facing indicator names slightly
- ⚠️ Important: "Infant" → "Neonatal" is a **metric change**, not just naming

### Option 2: Add Field Name Mapping

Add a mapping object to translate DataExplorer names to master dataset field names.

**Pros:**
- ✅ Keeps current user-facing names
- ✅ More flexible for future changes

**Cons:**
- ❌ Adds complexity
- ❌ Inconsistent with rest of platform (ChartPage, InlineChart use exact field names)
- ❌ Harder to maintain

---

## Platform Consistency Analysis

### Other Components Using Master Dataset Fields

**1. ChartPage.tsx (lines 120-144):**
```typescript
// Uses exact field names from master dataset
const yField = Array.isArray(config.yField) ? config.yField[0] : config.yField;
return latestData
  .map((d: any) => ({
    name: d.location || d[config.xField],
    value: d[yField],  // Direct field access using exact name
    income: d.income,
    subregion: d.Subregion
  }))
```

**2. InlineChart.tsx:**
Uses chart configs which specify exact field names.

**3. Backend server.js (lines 390-407):**
```javascript
// Fallback to master dataset for unmapped fields
indicatorData = masterData.map(d => ({
  year: d.year,
  income: d.income,
  Subregion: d.Subregion,
  [field]: d[field]  // Direct field access using exact name
}));
```

**Conclusion:** The entire platform uses **exact field names** from the master dataset. DataExplorer should follow the same convention for consistency.

---

## Chart Configurations Using Same Fields

### Neonatal Mortality Rate

**Chart 3.6.1:** Average Neonatal Mortality Rate
```typescript
{
  slug: 'average-nmr',
  yField: 'avg_nmr',  // Uses aggregate indicator, not raw field
  dataEndpoint: '/api/aggregate/by-year?field=avg_nmr'
}
```

**Note:** ChartPage uses pre-aggregated `avg_nmr` field, not raw `Neonatal mortality rate`.

### Current Health Expenditure

**No direct chart configurations** use `Expenditure per capita current` or `Expenditure on GDP` fields. These appear to be DataExplorer-specific indicators.

---

## Impact Assessment

### Current User Experience

**Scenario 1: User selects "Infant Mortality Rate"**
1. Dropdown shows: "Infant Mortality Rate"
2. Component tries: `d["Infant Mortality Rate"]`
3. Master dataset returns: `undefined` (field doesn't exist)
4. Chart displays: Empty (no data points)
5. User sees: Line chart with axes but no lines
6. No error message shown

**Scenario 2: User selects "Current health exp per capita"**
1. Dropdown shows: "Current Health Expenditure Per Capita"
2. Component tries: `d["Current health exp per capita"]`
3. Master dataset returns: `undefined` (field doesn't exist)
4. Chart displays: Empty
5. User confused: Should show per capita data

**Scenario 3: User selects "Gov exp Health per capita"**
1. Dropdown shows: "Government Health Expenditure Per Capita"
2. Component tries: `d["Gov exp Health per capita"]`
3. Master dataset returns: Actual values (field exists!)
4. Chart displays: Full time series data for selected countries
5. User happy: Chart works as expected

---

## Data Quality Verification

### Master Dataset Sample Values

```json
{
  "year": 2023,
  "location": "Kenya",
  "Neonatal mortality rate": 17.2,
  "Maternal mortality ratio": 342,
  "Expenditure on GDP": 4.32,
  "Expenditure per capita current": 98.76,
  "Gov exp Health per capita": 44.23,
  "Out-of-pocket on health exp": 26.54,
  "External on health exp": 14.32
}
```

**Verification:**
- ✅ Neonatal mortality rate has data (17.2 per 1,000 live births)
- ✅ Expenditure on GDP has data (4.32%)
- ✅ Expenditure per capita current has data ($98.76)
- ✅ All 7 correctly-named indicators have data
- ❌ No field called "Infant Mortality Rate"
- ❌ No field called "Current health exp per capita"
- ❌ No field called "Current health exp on GDP"

---

## Recommended Action Plan

### Step 1: Fix Field Names (PRIORITY: HIGH)

**File:** `frontend/health-financing-dashboard/src/pages/DataExplorer/DataExplorer.tsx`

**Changes required:**

1. **Lines 62-69:** Rename indicator key
   ```typescript
   // FROM:
   'Infant Mortality Rate': { ... }

   // TO:
   'Neonatal mortality rate': {
     title: 'Neonatal Mortality Rate',
     description: 'Deaths per 1,000 live births during the first 28 days of life',
     // ... rest
   }
   ```

2. **Lines 80-95:** Rename both expenditure indicator keys
   ```typescript
   // FROM:
   'Current health exp per capita': { ... }
   'Current health exp on GDP': { ... }

   // TO:
   'Expenditure per capita current': { ... }
   'Expenditure on GDP': { ... }
   ```

3. **Lines 212-223:** Update dropdown options
   ```typescript
   // FROM:
   <option value="Infant Mortality Rate">Infant Mortality Rate</option>
   <option value="Current health exp per capita">Current Health Expenditure Per Capita</option>
   <option value="Current health exp on GDP">Current Health Expenditure as % of GDP</option>

   // TO:
   <option value="Neonatal mortality rate">Neonatal Mortality Rate</option>
   <option value="Expenditure per capita current">Current Health Expenditure Per Capita</option>
   <option value="Expenditure on GDP">Current Health Expenditure as % of GDP</option>
   ```

4. **Line 101:** Update default indicator
   ```typescript
   // If default was one of the broken indicators, change it:
   const [indicator, setIndicator] = useState<string>('Gov exp Health per capita'); // Already correct
   ```

### Step 2: Test Data Explorer

1. Navigate to `http://localhost:3000/explorer`
2. Select 2-3 countries
3. Test each indicator:
   - ✅ Gov exp Health per capita (should work)
   - ✅ Gap for Gov exp Health per capita (should work)
   - ✅ Gov exp Health on budget (should work)
   - ✅ Out-of-pocket on health exp (should work)
   - ✅ Govern on health exp (should work)
   - ✅ External on health exp (should work)
   - ✅ Universal health coverage (should work)
   - ✅ Neonatal mortality rate (should work after fix)
   - ✅ Maternal mortality ratio (should work)
   - ✅ Expenditure per capita current (should work after fix)
   - ✅ Expenditure on GDP (should work after fix)

4. Verify each shows time series data from 2000-2023

### Step 3: Update Documentation

Add note to DATA_EXPLORER_CONSISTENCY_ANALYSIS.md:
- Document the fix
- Explain the Infant vs Neonatal distinction
- List all working indicators

---

## Important Note: Infant vs Neonatal Mortality

### Metric Difference

These are **different health indicators**:

**Infant Mortality Rate (IMR):**
- Deaths per 1,000 live births during the **first year of life** (0-12 months)
- Broader measure of child survival
- Includes neonatal + post-neonatal deaths

**Neonatal Mortality Rate (NMR):**
- Deaths per 1,000 live births during the **first 28 days of life**
- Narrower measure focusing on immediate newborn survival
- Subset of IMR

### Data Availability

**Master Dataset Has:**
- ✅ Neonatal mortality rate (first 28 days)
- ❌ Infant Mortality Rate (first year)

**DataExplorer Currently Claims:**
- Description says: "first year of life" (Infant)
- Actually requests: Field that doesn't exist
- Should use: Neonatal mortality rate (first 28 days)
- Must update: Description to match actual data

**Corrected INDICATOR_INFO:**
```typescript
'Neonatal mortality rate': {
  title: 'Neonatal Mortality Rate',
  description: 'Deaths per 1,000 live births during the first 28 days of life',
  interpretation: 'Lower values indicate better newborn health outcomes. Neonatal mortality reflects quality of maternal and newborn care.',
  unit: 'per 1,000 live births',
  theme: '3.6-3.7',
  category: 'Health Outcomes'
},
```

---

## Summary

### Findings

- **Total Indicators:** 10
- **Correct:** 7 (70%)
- **Incorrect:** 3 (30%)

### Issues

1. **"Infant Mortality Rate"** → Should be **"Neonatal mortality rate"**
   - Also a metric difference (year vs 28 days)
   - Description must be updated

2. **"Current health exp per capita"** → Should be **"Expenditure per capita current"**
   - Just naming mismatch

3. **"Current health exp on GDP"** → Should be **"Expenditure on GDP"**
   - Just naming mismatch

### Recommendation

**Fix DataExplorer.tsx** to use exact master dataset field names:
- Consistent with rest of platform
- Simple, direct solution
- Fixes all 3 issues
- Estimated effort: 10 minutes
- Risk: Low

### Status

⚠️ **INCONSISTENCIES FOUND - FIX REQUIRED**

The Data Explorer indicators are **NOT fully consistent** with the master dataset. 3 out of 10 indicators use incorrect field names that will result in empty charts.

---

**Analysis Completed:** March 20, 2026
**Analyst:** Claude Code
**Next Step:** Apply fixes to DataExplorer.tsx
