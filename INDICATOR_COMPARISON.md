# Indicator Comparison: Statistical Product vs Web Platform
**Date**: March 20, 2026

## All Indicators from generate_report_tables.py

### **3.1 PUBLIC HEALTH FINANCING (Sheet 2)**
- ✅ **3.1.1** Countries below threshold (by income, subregion, year)
- ✅ **3.1.2** Average public health financing gap (by income, subregion, year)
- ✅ **3.1.3** Gini coefficient & range - Gov exp Health per capita (by income, subregion, year)

### **3.2 ABUJA DECLARATION (Sheet 3)**
- ❌ **3.2.1** Countries below Abuja target <15% (by income, subregion, year)
- ❌ **3.2.2** Average budget priority gap (by income, subregion, year)
- ❌ **3.2.3** Gini coefficient - Gov exp Health on budget (by income, subregion, year)

### **3.3 FINANCIAL PROTECTION (Sheet 4)**
- ❌ **3.3.1** Countries with OOP below 20% benchmark (by income, subregion, year)
- ❌ **3.3.2** Average financial protection gap - Excess OOP (by income, subregion, year)
- ❌ **3.3.3** Gini coefficient - OOP expenditure (by income, subregion, year)
- ❌ **3.3.4** Incidence of financial hardship (by income, subregion, year)

### **3.4 FINANCING STRUCTURE (Sheet 5)**
- ❌ **3.4.1** Countries with Government share >50% (by income, subregion, year)
- ✅ **3.4.2** Average Government share (by income, subregion, year)
- ✅ **3.4.3** Average Voluntary prepaid insurance share (by income, subregion, year)
- ✅ **3.4.4** Average OOP share (by income, subregion, year)
- ✅ **3.4.5** Average Other private share (by income, subregion, year)
- ✅ **3.4.6** Average External/donor share (by income, subregion, year)

### **3.4a GOV HEALTH EXP < 5% GDP (Sheet 6)**
- ❌ **3.4a** Countries with Gov health exp < 5% of GDP (by income, subregion, year)

### **3.5 UHC INDEX (Sheet 7)**
- ✅ **3.5.1** Average UHC Index (by income, subregion, year)
- ❌ **3.5.2** Countries with UHC <50% or below regional average (by income, subregion, year)
- ❌ **3.5.3** Gini coefficient - UHC Index (by income, subregion, year)

### **3.6 HEALTH OUTCOMES (Sheet 8)**
- ✅ **3.6.1** Average Neonatal Mortality Rate (by income, subregion, year)
- ✅ **3.6.2** Average Maternal Mortality Ratio (by income, subregion, year)
- ❌ **3.6.3** Countries on course for NMR ≤12 (by income, subregion, year)
- ❌ **3.6.4** Countries on course for MMR <70 (by income, subregion, year)

### **3.7 FINANCING × UHC (Sheet 9)**
- ❌ **3.7.1** Threshold + UHC above 50th/75th percentile cross-tab (by income, subregion, year)
- ❌ **3.7.2** Abuja + UHC above 50th/75th percentile cross-tab (by income, subregion, year)
- ❌ **3.7.3** OOP below 20% + UHC above 50th/75th percentile cross-tab (by income, subregion, year)

### **3.8 FINANCING × OUTCOMES (Sheet 10)**
- ❌ **3.8.1** Threshold + NMR on course cross-tab (by income, subregion, year)
- ❌ **3.8.2** Abuja + MMR on course cross-tab (by income, subregion, year)

### **3.9 STRUCTURE × UHC (Sheet 11)**
- ❌ **3.9.1** Gov dominant (>50%) + UHC 50th/75th percentile cross-tab
- ❌ **3.9.2** Voluntary prepaid highest + UHC cross-tab
- ❌ **3.9.3** OOP highest + UHC cross-tab
- ❌ **3.9.4** Other private highest + UHC cross-tab
- ❌ **3.9.5** External highest + UHC cross-tab

### **3.10 STRUCTURE × OUTCOMES (Sheet 12)**
- ❌ **3.10.1** Gov dominant + NMR on course (by income, subregion, year)
- ❌ **3.10.2** Voluntary prepaid highest + NMR on course
- ❌ **3.10.3** OOP highest + NMR on course
- ❌ **3.10.4** Other private highest + NMR on course
- ❌ **3.10.5** External highest + NMR on course
- ❌ **3.10.6** Gov dominant + MMR on course (by income, subregion, year)
- ❌ **3.10.7** Voluntary prepaid highest + MMR on course
- ❌ **3.10.8** OOP highest + MMR on course
- ❌ **3.10.9** Other private highest + MMR on course
- ❌ **3.10.10** External highest + MMR on course

### **3.11 FISCAL SPACE (Sheet 13)**
- ❌ **3.11.1** Health spending elasticity [NOT IN DATASET]
- ❌ **3.11.2** Tax revenue as % of GDP (by income, subregion, year)
- ❌ **3.11.3** Health expenditure as % of GDP (by income, subregion, year)
- ❌ **3.11.4** Institutional health investment share [NOT IN DATASET]
- ❌ **3.11.5** Gross fixed capital formation (by income, subregion, year)
- ❌ **3.11.6** Foreign direct investment [NOT IN DATASET]
- ❌ **3.11.7** Investment returns [NOT IN DATASET]

### **THRESHOLD × UHC (Sheet 14)**
- ❌ **NEW** 4-tier expenditure categories × UHC >50% (by year, income, subregion)
  - Number of countries
  - Average expenditure

### **THRESHOLD × NMR (Sheet 15)**
- ❌ **NEW** 4-tier expenditure categories × NMR (>12 vs ≤12) (by year, income, subregion)
  - Number of countries
  - Average expenditure

### **THRESHOLD × MMR (Sheet 16)**
- ❌ **NEW** 4-tier expenditure categories × MMR (>70 vs ≤70) (by year, income, subregion)
  - Number of countries
  - Average expenditure

---

## SUMMARY

### **Total Indicators in Statistical Product**: ~60 indicators

### **Indicators on Platform**: ~12 indicators (20%)

**On Platform:**
- 3.1.1, 3.1.2, 3.1.3 (Public health financing)
- 3.4.2-3.4.6 (Financing structure shares)
- 3.5.1 (Average UHC)
- 3.6.1, 3.6.2 (Average NMR, MMR)

**Missing from Platform (~48 indicators, 80%):**

#### **COUNT INDICATORS (Countries meeting thresholds)**
- 3.2.1 - Countries below Abuja
- 3.3.1 - Countries with OOP below 20%
- 3.4.1 - Countries with Gov >50%
- 3.4a - Countries with Gov <5% GDP
- 3.5.2 - Countries with low UHC
- 3.6.3 - Countries on course for NMR
- 3.6.4 - Countries on course for MMR

#### **GINI COEFFICIENTS (Inequality measures)**
- 3.2.3 - Abuja Gini
- 3.3.3 - OOP Gini
- 3.5.3 - UHC Gini

#### **GAP INDICATORS**
- 3.2.2 - Budget priority gap
- 3.3.2 - Financial protection gap

#### **CROSS-TABULATIONS (All missing)**
- All of 3.7 (Financing × UHC) - 3 indicators
- All of 3.8 (Financing × Outcomes) - 2 indicators
- All of 3.9 (Structure × UHC) - 5 indicators
- All of 3.10 (Structure × Outcomes) - 10 indicators

#### **FISCAL SPACE**
- All of 3.11 except elasticity and investment - 3 indicators

#### **NEW CROSS-TABS**
- Threshold categories × UHC
- Threshold categories × NMR
- Threshold categories × MMR

---

## INDICATOR TYPES MISSING

1. **Count/Threshold Compliance**: ~10 indicators
2. **Gini Coefficients**: ~3 indicators
3. **Gap Indicators**: ~2 indicators
4. **Cross-tabulations**: ~20 indicators
5. **Fiscal Space**: ~3 indicators
6. **Financial Hardship**: 1 indicator
7. **4-tier Threshold Analysis**: 3 new cross-tabs

---

## DATA AVAILABILITY

**All indicators CAN be calculated from existing data:**
- Raw data: `Health_Financing Data.xlsx` (51 columns)
- Processed data: `master_dataset.csv`
- The `generate_report_tables.py` script already calculates all these indicators

**What's Needed:**
1. Backend API endpoints to serve these calculated indicators
2. Frontend chart configurations to visualize them
3. Aggregation logic (by income, subregion, year)
