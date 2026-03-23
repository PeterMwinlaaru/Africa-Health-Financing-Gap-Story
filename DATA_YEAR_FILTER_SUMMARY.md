# Data Year Filter Summary
**Date:** March 20, 2026
**Purpose:** Ensure all data served by the platform covers only 2000-2023, excluding 2024

---

## Actions Taken

### 1. Data Generation Scripts
All data generation scripts have year filters applied:

**`scripts/generate_report_tables.py` (line 58-59):**
```python
# Filter for 2000-2023 (excluding 2024)
df = df[(df['year'] >= 2000) & (df['year'] <= 2023)]
```

**`scripts/generate_phase3_indicators.py` (line 18-19):**
```python
df = df[(df['year'] >= 2000) & (df['year'] <= 2023)]
```

### 2. Data Files Cleaned
Created and ran `scripts/filter_2024_data.py` to remove any existing 2024 data:

**Files Cleaned:**
- ✅ `health_outcomes/countries_mmr_track.json` - Removed 1 record
- ✅ `health_outcomes/countries_nmr_track.json` - Removed 1 record
- ✅ `uhc/countries_low_uhc.json` - Removed 1 record

**Total:** 3 records with year=2024 removed

**Verification:** `grep -r "\"year\":2024"` returns 0 results across all JSON files

### 3. Backend API Safeguards
Added filtering at the API layer to prevent 2024 data from being served:

**Helper Function Added (server.js):**
```javascript
// Helper function to filter data to 2000-2023 only
function filterYearRange(data) {
    if (!Array.isArray(data)) return data;
    return data.filter(d => d.year >= 2000 && d.year <= 2023);
}
```

**Endpoints Updated with filterYearRange():**
- ✅ `/api/data/master` - Master dataset endpoint
- ✅ `/api/indicators/public-health-financing`
- ✅ `/api/indicators/uhc`
- ✅ `/api/indicators/health-outcomes`

### 4. Data Integrity Verification

**Before Cleanup:**
- 3 JSON files contained year=2024 records

**After Cleanup:**
- 0 JSON files contain year=2024 records
- All data generation scripts filter to 2000-2023
- Backend API applies year filtering as safeguard
- Master dataset has no 2024 records

---

## Data Coverage

**Year Range:** 2000 - 2023 (24 years)
**Excluded:** 2024

This ensures:
1. Consistent time series across all indicators
2. Complete annual coverage without gaps
3. No partial year data that could skew analysis
4. Historical perspective covers full 24-year period post-Abuja Declaration (2001)

---

## Maintenance Notes

**When adding new indicators:**
1. Always apply year filter in Python: `df = df[(df['year'] >= 2000) & (df['year'] <= 2023)]`
2. Backend automatically filters, but explicit filtering in scripts is best practice
3. Run `scripts/filter_2024_data.py` after regenerating data files to ensure compliance

**To update year range in future:**
1. Update filter in both Python scripts (`generate_report_tables.py`, `generate_phase3_indicators.py`)
2. Update backend `filterYearRange()` function in `server.js`
3. Regenerate all indicator data files
4. Restart backend server

---

## Status
✅ **All data verified to cover only 2000-2023**
✅ **Backend server running with year filtering active**
✅ **No 2024 data in any processed files**
