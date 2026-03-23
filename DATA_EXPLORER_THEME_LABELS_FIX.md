# Data Explorer Theme Labels Fix
**Date:** March 20, 2026
**Issue:** Incorrect theme grouping labels in Data Explorer
**Status:** ✅ FIXED

---

## Problem Identified

The Data Explorer component had **misleading and incorrect theme labels** that didn't match the actual 11-theme structure of the platform.

### Incorrect Labels (Before)

1. **"3.6-3.7 Health Outcomes"** - WRONG
   - Theme 3.7 is actually "Financing × UHC" (cross-dimensional analysis)
   - Both indicators shown are from Theme 3.6 only

2. **"3.8-3.11 Additional Indicators"** - VAGUE/INCORRECT
   - Themes 3.8, 3.9, 3.10 are specific cross-dimensional analyses
   - The indicators shown are economic/fiscal space indicators
   - Better fit under Theme 3.11

---

## Actual Theme Structure

From `topics.ts` configuration:

| Number | Theme Name | Description |
|--------|------------|-------------|
| 3.1 | Public Health Financing | Gov health expenditure per capita |
| 3.2 | Budget Priority | Abuja Declaration (15% target) |
| 3.3 | Financial Protection | Out-of-pocket expenditure |
| 3.4 | Financing Structure | Sources of health financing |
| 3.5 | UHC Index | Universal health coverage |
| **3.6** | **Health Outcomes** | **NMR and MMR** ← Both mortality indicators |
| **3.7** | **Financing × UHC** | **Cross-dimensional: financing & UHC** |
| 3.8 | Financing × Outcomes | Cross-dimensional: financing & mortality |
| 3.9 | Structure × UHC | Cross-dimensional: financing sources & UHC |
| 3.10 | Structure × Outcomes | Cross-dimensional: financing sources & mortality |
| **3.11** | **Fiscal Space** | **Economic constraints & capacity** ← Expenditure indicators |

---

## Changes Applied

### File: `frontend/health-financing-dashboard/src/pages/DataExplorer/DataExplorer.tsx`

### Change 1: Maternal Mortality Comment (Line 75)

**Before:**
```typescript
  // 3.7 Health Outcomes - Maternal Mortality
  'Maternal mortality ratio': {
```

**After:**
```typescript
  // 3.6 Health Outcomes - Maternal Mortality
  'Maternal mortality ratio': {
```

**Reason:** Maternal mortality is part of Theme 3.6, not 3.7

### Change 2: Economic Indicators Comment (Line 83)

**Before:**
```typescript
  // 3.8-3.11 Additional indicators
  'Expenditure per capita current': {
```

**After:**
```typescript
  // 3.11 Fiscal Space / Economic Indicators
  'Expenditure per capita current': {
```

**Reason:** These are fiscal space/economic indicators from Theme 3.11

### Change 3: Dropdown Labels (Lines 216-223)

**Before:**
```typescript
<optgroup label="3.6-3.7 Health Outcomes">
  <option value="Neonatal mortality rate">Neonatal Mortality Rate</option>
  <option value="Maternal mortality ratio">Maternal Mortality Ratio</option>
</optgroup>
<optgroup label="3.8-3.11 Additional Indicators">
  <option value="Expenditure per capita current">Total Health Expenditure Per Capita</option>
  <option value="Expenditure on GDP">Health Expenditure as % of GDP</option>
</optgroup>
```

**After:**
```typescript
<optgroup label="3.6 Health Outcomes">
  <option value="Neonatal mortality rate">Neonatal Mortality Rate</option>
  <option value="Maternal mortality ratio">Maternal Mortality Ratio</option>
</optgroup>
<optgroup label="3.11 Fiscal Space / Economic Indicators">
  <option value="Expenditure per capita current">Total Health Expenditure Per Capita</option>
  <option value="Expenditure on GDP">Health Expenditure as % of GDP</option>
</optgroup>
```

**Reason:** Accurate labeling matching actual theme structure

---

## Why This Matters

### User Understanding

**Before:** Users might think:
- "Theme 3.7 is about health outcomes" ❌
- "Themes 3.8-3.11 are miscellaneous extras" ❌

**After:** Users correctly understand:
- "Theme 3.6 covers health outcomes (NMR & MMR)" ✅
- "Theme 3.11 covers fiscal space and economic capacity" ✅

### Platform Consistency

The Data Explorer now aligns with:
- **topics.ts** - Theme definitions
- **charts.ts** - Chart configurations
- **Navigation** - Topic pages
- **Documentation** - Statistical product structure

All components now use the same 11-theme framework consistently.

---

## Theme Details

### Theme 3.6: Health Outcomes
**Short Title:** Health Outcomes
**Full Title:** Health Outcomes - NMR and MMR
**Description:** Neonatal Mortality Rate (target: <12 per 1,000 live births) and Maternal Mortality Ratio (target: <70 per 100,000 live births) progress tracking.
**Icon:** 👶
**Color:** #db2777

**Indicators in Data Explorer:**
- Neonatal mortality rate
- Maternal mortality ratio

### Theme 3.7: Financing × UHC (NOT in Data Explorer)
**Short Title:** Financing × UHC
**Full Title:** Health Financing Dimensions and UHC Index
**Description:** Cross-dimensional analysis linking health financing indicators (per capita spending, Abuja target, OOP benchmark) with UHC service coverage outcomes.
**Icon:** 🔗
**Color:** #ea580c

**Note:** This theme has NO indicators in the Data Explorer. It's about relationships between financing and UHC.

### Theme 3.11: Fiscal Space
**Short Title:** Fiscal Space
**Full Title:** Fiscal Space and Macroeconomic Constraints
**Description:** Analysis of health spending elasticity, tax revenue potential, GDP share of health expenditure, and investment indicators including GFCF and FDI.
**Icon:** 📉
**Color:** #475569

**Indicators in Data Explorer:**
- Expenditure per capita current (total health spending per person)
- Expenditure on GDP (health expenditure as % of GDP)

---

## Complete Data Explorer Indicator Map

| Indicator | Theme | Source Field |
|-----------|-------|--------------|
| Government Health Expenditure Per Capita | 3.1 | `Gov exp Health per capita` |
| Health Financing Gap | 3.1 | `Gap for Gov exp Health per capita` |
| Government Health Budget Share | 3.2 | `Gov exp Health on budget` |
| Out-of-Pocket Expenditure Share | 3.3 | `Out-of-pocket on health exp` |
| Government Share of Health Exp | 3.4 | `Govern on health exp` |
| External/Donor Share of Health Exp | 3.4 | `External on health exp` |
| UHC Service Coverage Index | 3.5 | `Universal health coverage` |
| **Neonatal Mortality Rate** | **3.6** | `Neonatal mortality rate` |
| **Maternal Mortality Ratio** | **3.6** | `Maternal mortality ratio` |
| **Total Health Expenditure Per Capita** | **3.11** | `Expenditure per capita current` |
| **Health Expenditure as % of GDP** | **3.11** | `Expenditure on GDP` |

**Total:** 10 indicators covering 7 themes (3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.11)

**Not covered:** Themes 3.7-3.10 (cross-dimensional analyses)

---

## Verification

### Compilation Status

✅ **Frontend compiled successfully:**
```
Compiling...
Compiled successfully!
webpack compiled successfully
Files successfully emitted, waiting for typecheck results...
Issues checking in progress...
No issues found.
```

### Visual Verification

Users visiting http://localhost:3000/explorer will now see:

**Indicator Dropdown:**
```
3.1 Public Health Financing
  - Government Health Expenditure Per Capita
  - Health Financing Gap
3.2 Budget Priority
  - Government Health Budget Share
3.3 Financial Protection
  - Out-of-Pocket Expenditure Share
3.4 Financing Structure
  - Government Share of Health Exp
  - External/Donor Share of Health Exp
3.5 Universal Health Coverage
  - UHC Service Coverage Index
3.6 Health Outcomes                        ← CORRECTED (was "3.6-3.7")
  - Neonatal Mortality Rate
  - Maternal Mortality Ratio
3.11 Fiscal Space / Economic Indicators    ← CORRECTED (was "3.8-3.11 Additional")
  - Total Health Expenditure Per Capita
  - Health Expenditure as % of GDP
```

---

## Impact Summary

### Before Fix
- ❌ Theme labels didn't match actual structure
- ❌ Theme 3.7 incorrectly associated with health outcomes
- ❌ Themes 3.8-3.11 vaguely grouped as "additional"
- ❌ Users might misunderstand platform organization
- ❌ Inconsistent with rest of platform

### After Fix
- ✅ Theme labels accurately reflect structure
- ✅ Theme 3.6 correctly identified for mortality indicators
- ✅ Theme 3.11 properly identified for fiscal/economic indicators
- ✅ Users understand correct theme organization
- ✅ Consistent with entire platform

---

## Related Documentation

This fix is part of the Data Explorer consistency series:

1. **DATA_EXPLORER_CONSISTENCY_ANALYSIS.md** - Field name analysis
2. **DATA_EXPLORER_FIX.md** - Field name corrections
3. **DATA_EXPLORER_THEME_LABELS_FIX.md** (This document) - Theme label corrections

---

## Summary

### Problem
Data Explorer grouped indicators under incorrect theme labels ("3.6-3.7" and "3.8-3.11") that didn't match the actual 11-theme structure.

### Solution
Updated grouping labels to accurately reflect the theme structure:
- Changed "3.6-3.7 Health Outcomes" → "3.6 Health Outcomes"
- Changed "3.8-3.11 Additional Indicators" → "3.11 Fiscal Space / Economic Indicators"

### Result
- ✅ Accurate theme labeling
- ✅ Consistent with platform theme structure
- ✅ Better user understanding
- ✅ Frontend compiles successfully
- ✅ No breaking changes

**Status:** ✅ **DATA EXPLORER THEME LABELS CORRECTED**

---

**Fix Applied:** March 20, 2026
**Server:** Frontend task bb3ad52 (recompiled successfully)
**Files Modified:** 1 file (DataExplorer.tsx)
**Lines Changed:** 3 edits (comments + dropdown labels)
**Testing:** Compilation verified, ready for user testing
