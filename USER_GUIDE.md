# User Guide
## Africa Health Financing Gap Analysis Platform

**Version**: 1.0
**Last Updated**: 2026-03-22
**For**: Platform Users and Data Analysts

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Platform Navigation](#platform-navigation)
4. [Using the Data Explorer](#using-the-data-explorer)
5. [Viewing Charts and Indicators](#viewing-charts-and-indicators)
6. [Cross-Dimensional Analysis](#cross-dimensional-analysis)
7. [Understanding the Data](#understanding-the-data)
8. [Downloading Data](#downloading-data)
9. [Tips and Best Practices](#tips-and-best-practices)
10. [Frequently Asked Questions](#frequently-asked-questions)

---

## Introduction

### What is This Platform?

The **Africa Health Financing Gap Analysis Platform** is a comprehensive data visualization and analysis tool that provides insights into health financing across 54 African countries from 2000 to 2023.

### Who Is This For?

- **Policy Makers**: Evidence-based decision making on health financing policies
- **Researchers**: Analyzing trends and patterns in African health financing
- **Development Partners**: Monitoring progress toward health financing targets
- **Students & Academics**: Learning about health economics in Africa
- **Public Health Professionals**: Understanding the landscape of health financing

### Key Features

✅ **Comprehensive Coverage**: 54 African countries, 24 years (2000-2023)
✅ **Multiple Indicators**: 10 major indicator categories with sub-indicators
✅ **Interactive Visualizations**: Dynamic charts, maps, and trend analyses
✅ **Cross-Dimensional Analysis**: Explore relationships between financing and health outcomes
✅ **Regional Comparisons**: View data by income level and sub-region
✅ **Download Capabilities**: Export data and visualizations for your own analysis

### Data Source

All data on this platform comes from the **WHO Global Health Expenditure Database (GHED)**, the most authoritative source for internationally comparable health financing data.

---

## Getting Started

### Accessing the Platform

1. **Open your web browser** (Chrome, Firefox, Safari, or Edge recommended)
2. **Navigate to the platform URL** (provided by your administrator)
3. **No login required** - The platform is publicly accessible

### Browser Requirements

- **Recommended**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: Must be enabled
- **Screen Resolution**: Works on desktop (1920x1080+), tablet (768x1024+), and mobile devices
- **Internet**: Stable connection recommended for loading visualizations

### First Visit

When you first visit the platform, you'll land on the **Home Page**, which provides:
- Overview of the platform's purpose
- Quick access to major indicator categories
- Summary statistics
- Data source information

---

## Platform Navigation

### Main Navigation Menu

Located at the top of every page:

```
[UN-ECA Logo] | Home | About | Charts | Data Explorer | Cross-Dimensional | Sources
```

#### Navigation Options

| Page | Purpose |
|------|---------|
| **Home** | Platform overview and quick stats |
| **About** | Project information, methodology, contacts |
| **Charts** | Browse all indicator visualizations |
| **Data Explorer** | Interactive data exploration tool |
| **Cross-Dimensional** | Analyze relationships between indicators |
| **Sources** | Data source details and download links |

### Footer Links

At the bottom of every page:

**About**:
- About this project
- Data sources

**Explore**:
- All charts
- Data Explorer
- Cross-Dimensional analysis

**Related Platforms**:
- Health Financing Dashboard (complementary platform)

**UN-ECA**:
- Information about the United Nations Economic Commission for Africa

---

## Using the Data Explorer

### What Is the Data Explorer?

The Data Explorer is an interactive tool that lets you:
- Filter data by country, year, income level, or region
- View specific health financing indicators
- Compare multiple countries side-by-side
- Download filtered data

### Step-by-Step Guide

#### Step 1: Access the Data Explorer
Click **"Data Explorer"** in the main navigation menu.

#### Step 2: Select Filters

**Filter Panel** (left side):

```
┌─────────────────────────┐
│ 📊 Filters              │
├─────────────────────────┤
│ Countries:              │
│ [ ] Algeria             │
│ [ ] Angola              │
│ [ ] Benin               │
│ ...                     │
├─────────────────────────┤
│ Year Range:             │
│ [2000] ═══════ [2023]  │
├─────────────────────────┤
│ Income Levels:          │
│ [ ] Low income          │
│ [ ] Lower-middle        │
│ [ ] Upper-middle        │
├─────────────────────────┤
│ Regions:                │
│ [ ] Eastern Africa      │
│ [ ] Western Africa      │
│ [ ] Southern Africa     │
│ [ ] Northern Africa     │
│ [ ] Central Africa      │
└─────────────────────────┘
```

**How to Use Filters**:

1. **Countries**:
   - Click checkboxes to select/deselect countries
   - Use "Select All" or "Clear All" buttons
   - Search for countries using the search box

2. **Year Range**:
   - Drag the slider to select year range
   - Or type specific years in the input boxes
   - Shows data only for selected years

3. **Income Levels**:
   - Low income: Countries with GNI per capita ≤ $1,085
   - Lower-middle: $1,086 - $4,255
   - Upper-middle: $4,256 - $13,205

4. **Regions**:
   - Eastern Africa: Kenya, Tanzania, Uganda, etc.
   - Western Africa: Nigeria, Ghana, Senegal, etc.
   - Southern Africa: South Africa, Botswana, Zimbabwe, etc.
   - Northern Africa: Egypt, Morocco, Tunisia, etc.
   - Central Africa: Cameroon, DRC, Chad, etc.

#### Step 3: Select Indicators

**Indicator Panel** (right side):

Choose from 10 major categories:
1. Public Health Financing
2. Budget Priority (Abuja Declaration)
3. Financial Protection
4. Financing Structure
5. Universal Health Coverage
6. Health Outcomes
7. Cross-Dimensional: Financing × UHC
8. Cross-Dimensional: Financing × Outcomes
9. Cross-Dimensional: Structure × Outcomes
10. Fiscal Space

**Example**: To view government health expenditure per capita:
1. Select "Public Health Financing" category
2. Choose "Gov Health Exp per Capita (USD)" indicator

#### Step 4: View Results

**Data Table** displays:
- Selected countries in rows
- Years in columns
- Indicator values in cells
- Color coding:
  - 🟢 Green: Meeting benchmark
  - 🟡 Yellow: Approaching benchmark
  - 🔴 Red: Below benchmark

**Chart Visualization** displays:
- Line chart: Trends over time
- Bar chart: Country comparisons
- Map: Geographic distribution

#### Step 5: Download Data

Click **"Download CSV"** button to export:
- Filtered data in spreadsheet format
- Compatible with Excel, Google Sheets, R, Python
- Includes all selected countries, years, and indicators

---

## Viewing Charts and Indicators

### All Charts Page

Access via **"Charts"** in main navigation.

### Chart Categories

#### 1. Public Health Financing

**Indicators**:
- Government health expenditure per capita
- Countries below $50 per capita threshold
- Average financing gap
- Gini coefficient (inequality)
- Range (min-max values)

**What It Shows**:
- Adequacy of public health funding
- Inequality in health financing across countries
- Progress toward international benchmarks

**Key Benchmark**: WHO recommends at least $86 per capita for basic health services.

---

#### 2. Budget Priority (Abuja Declaration)

**Indicators**:
- Health spending as % of government budget
- Countries meeting Abuja target (15%)
- Average gap to target
- Gini coefficient for budget share

**What It Shows**:
- Political commitment to health
- Progress toward Abuja Declaration target

**Key Benchmark**: Abuja Declaration (2001) - African governments should allocate at least 15% of their budget to health.

**Chart Example**:
```
Countries Meeting Abuja Declaration (15% of Budget to Health)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Year    Meeting Target    Not Meeting
2000    ████ 8           ████████████████████████ 46
2010    ██████ 12        ██████████████████ 42
2023    ████████ 15      ███████████████ 39
```

---

#### 3. Financial Protection

**Indicators**:
- Out-of-pocket (OOP) expenditure as % of total health spending
- Countries above OOP benchmark (>20%)
- Financial hardship indicators
- Gini coefficient for OOP share

**What It Shows**:
- Extent of household financial burden
- Risk of catastrophic health expenditures
- Protection from poverty due to health costs

**Key Benchmark**: OOP should be <20% of total health expenditure (SDG 3.8 target).

**Chart Example**:
```
Out-of-Pocket Spending Trends (Africa Average)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
50% ┤
    │         ●━━●━━●
40% ┤       ●           ●━━●━━●
    │     ●                     ●━━●
30% ┤   ●                           ●
    │ ●                               ●
20% ┤━━━━━━━━━━━━━━ WHO Benchmark ━━━━━
    └────────────────────────────────────
    2000  2005  2010  2015  2020  2023
```

---

#### 4. Financing Structure

**Indicators**:
- Government health spending (% of total)
- Voluntary insurance (% of total)
- Out-of-pocket payments (% of total)
- External aid (% of total)
- Other private spending (% of total)

**What It Shows**:
- How health systems are financed
- Reliance on different financing sources
- Sustainability of financing mix

**Chart Example**:
```
Health Financing Sources (Africa Average, 2023)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Government          ████████████████ 40%
Out-of-Pocket       ████████████ 30%
External Aid        ██████ 15%
Voluntary Insurance ████ 10%
Other Private       ██ 5%
```

---

#### 5. Universal Health Coverage (UHC)

**Indicators**:
- UHC service coverage index (0-100 scale)
- Countries with low UHC (<50)
- Average UHC by income level and region
- Gini coefficient for UHC

**What It Shows**:
- Population coverage by essential health services
- Progress toward SDG 3.8 (Universal Health Coverage)
- Equity in service coverage

**Key Benchmark**: UHC index of 80 or above indicates strong coverage.

---

#### 6. Health Outcomes

**Indicators**:
- Neonatal mortality rate (deaths per 1,000 live births)
- Maternal mortality ratio (deaths per 100,000 live births)
- Countries on/off track for SDG targets

**What It Shows**:
- Impact of health financing on health outcomes
- Progress toward SDG 3.1 (maternal mortality) and 3.2 (neonatal mortality)

**Key Benchmarks**:
- Neonatal mortality: <12 per 1,000 live births (SDG target)
- Maternal mortality: <70 per 100,000 live births (SDG target)

---

#### 7-9. Cross-Dimensional Analysis

**What It Shows**:
- Relationships between health financing and outcomes
- How financing structure affects UHC and mortality
- Countries with high financing but low outcomes (inefficiency)
- Countries with low financing but good outcomes (efficiency)

**Example Insights**:
- "Countries with OOP >30% have 40% lower UHC coverage"
- "Government-dominated financing is associated with lower maternal mortality"
- "External aid dependence correlates with lower sustainability"

---

#### 10. Fiscal Space

**Indicators**:
- Government health expenditure as % of GDP
- Countries meeting 5% of GDP threshold
- Fiscal capacity indicators
- Investment potential

**What It Shows**:
- Macroeconomic constraints on health financing
- Potential for increased domestic health spending
- Fiscal sustainability

**Key Benchmark**: Government health spending should be at least 5% of GDP.

---

## Cross-Dimensional Analysis

### What Is Cross-Dimensional Analysis?

Cross-dimensional analysis explores **relationships** between different health financing indicators and health outcomes. This helps answer questions like:

- "Does higher government spending lead to better UHC?"
- "How does financing structure impact maternal mortality?"
- "Are countries with high OOP spending more unequal?"

### How to Use

#### Access the Tool
Click **"Cross-Dimensional"** in the main navigation.

#### Three Analysis Modes

```
┌─────────────────────────────────────────────────┐
│ Financing × UHC  │  Financing × Outcomes  │  Structure × Outcomes │
└─────────────────────────────────────────────────┘
```

---

### Mode 1: Financing × UHC

**Scatter Plot**:
- X-axis: Government health expenditure per capita
- Y-axis: UHC service coverage index
- Each point: One country
- Color: Income level
- Size: Population

**Correlation Matrix**:
Shows correlations between:
- Gov health exp per capita
- UHC index
- OOP as % of total health spending
- Government spending as % of total health spending

**Interpretation**:
- **Positive correlation** (r > 0.5): Higher financing → Higher UHC
- **Negative correlation** (r < -0.5): Higher OOP → Lower UHC

---

### Mode 2: Financing × Outcomes

**Scatter Plot**:
- X-axis: Government health expenditure per capita
- Y-axis: Neonatal or maternal mortality rate
- Expect: Negative correlation (more spending = lower mortality)

**Correlation Matrix**:
- Gov health exp per capita vs. Neonatal mortality
- Gov health exp per capita vs. Maternal mortality
- OOP share vs. Mortality rates

---

### Mode 3: Structure × Outcomes

**Stacked Bar Chart**:
Shows how financing structure (government, OOP, external, etc.) differs between:
- Countries with high UHC (>75) vs. low UHC (<50)
- Countries with low mortality vs. high mortality

**Key Insights**:
- Countries with government-dominant financing have better outcomes
- High OOP dependence is associated with worse outcomes
- External aid is more common in low-income, high-mortality countries

---

### Interactive Features

**Hover**: View exact values for any data point
**Filter**: Select specific countries or regions
**Toggle**: Show/hide specific income groups
**Download**: Export charts as PNG or data as CSV

---

## Understanding the Data

### Data Period: 2000-2023

The platform covers **24 years** of health financing data, allowing you to:
- Track long-term trends
- Identify turning points (e.g., policy changes)
- Assess progress toward goals

### 54 African Countries

Full coverage of all African countries, enabling:
- Pan-African analysis
- Country-specific deep dives
- Regional comparisons

### Income Levels

Countries are classified by World Bank income groups:

| Income Level | GNI per capita | Examples |
|--------------|----------------|----------|
| Low income | ≤ $1,085 | Burundi, DRC, Niger |
| Lower-middle | $1,086-$4,255 | Kenya, Nigeria, Zambia |
| Upper-middle | $4,256-$13,205 | South Africa, Botswana, Seychelles |

**Note**: Seychelles is the only high-income country in Africa but is grouped with upper-middle for analysis.

### Regions

African Union sub-regions:

- **Eastern Africa**: 13 countries (Kenya, Ethiopia, Tanzania...)
- **Western Africa**: 16 countries (Nigeria, Ghana, Côte d'Ivoire...)
- **Southern Africa**: 5 countries (South Africa, Botswana, Zimbabwe...)
- **Northern Africa**: 5 countries (Egypt, Morocco, Tunisia...)
- **Central Africa**: 9 countries (Cameroon, DRC, Chad...)

### Data Quality

All data from WHO GHED is:
✅ **Standardized**: Uses SHA 2011 framework for comparability
✅ **Validated**: Verified against national health accounts
✅ **Comprehensive**: Covers all financing sources
✅ **Updated**: Latest available data (2023)

### Missing Data

Some countries/years may have missing data due to:
- Unavailability of national health accounts
- Conflict or political instability
- Reporting delays

Missing data is shown as:
- "N/A" in tables
- Gaps in line charts
- Gray in maps

---

## Downloading Data

### What Can You Download?

1. **Filtered Data** (Data Explorer): CSV files with your selected filters
2. **Chart Data**: Data underlying any chart visualization
3. **Full Dataset**: Complete master dataset for offline analysis

### How to Download

#### From Data Explorer
1. Set your filters (countries, years, indicators)
2. Click **"Download CSV"** button
3. File downloads to your browser's download folder
4. Open in Excel, Google Sheets, R, Python, etc.

#### From Charts
1. Hover over any chart
2. Click **download icon** (💾) in top-right corner
3. Choose format:
   - **PNG**: Image of the chart
   - **CSV**: Data behind the chart
   - **SVG**: Vector graphic (for publications)

#### Full Dataset
1. Go to **"Sources"** page
2. Click **"Download Master Dataset"** link
3. Get complete dataset with all countries, years, and indicators

### Data Format

**CSV Files** include:
- **Headers**: Column names (Country, Year, Indicator, Value...)
- **Values**: Numeric data (use period as decimal separator)
- **Encoding**: UTF-8 (works internationally)

**Example CSV**:
```csv
Country,Year,Gov_Health_Exp_Per_Capita,UHC_Index,Neonatal_Mortality
Algeria,2023,245.50,78,15.2
Angola,2023,89.30,52,27.4
Benin,2023,32.80,49,28.1
```

### Using Downloaded Data

**Excel**:
1. Open downloaded CSV file
2. Data → Text to Columns (if needed)
3. Create charts, pivot tables, etc.

**R**:
```r
data <- read.csv("health_financing_data.csv")
summary(data)
```

**Python**:
```python
import pandas as pd
data = pd.read_csv("health_financing_data.csv")
data.head()
```

---

## Tips and Best Practices

### 1. Start with Overview

✅ **Do**: Begin on the **Home** page to understand the platform's scope
✅ **Do**: Read the **About** page to understand methodology
❌ **Don't**: Jump straight to Cross-Dimensional without understanding individual indicators

### 2. Use Filters Effectively

✅ **Do**: Start with a few countries, then expand
✅ **Do**: Compare similar countries (same income level or region)
❌ **Don't**: Select all 54 countries at once (charts become unreadable)

### 3. Compare Over Time

✅ **Do**: Use line charts to see trends
✅ **Do**: Look for inflection points (e.g., 2001 Abuja Declaration)
✅ **Do**: Compare before/after major policy changes

### 4. Understand Context

✅ **Do**: Consider income level when comparing countries
✅ **Do**: Account for population size (per capita vs. absolute values)
✅ **Do**: Check data availability (some years may be incomplete)

### 5. Use Cross-Dimensional Wisely

✅ **Do**: Look for patterns and outliers
✅ **Do**: Investigate outliers (countries doing better/worse than expected)
❌ **Don't**: Assume correlation = causation

### 6. Download Smartly

✅ **Do**: Download filtered data for specific analysis
✅ **Do**: Use full dataset for comprehensive research
❌ **Don't**: Download data you don't need

### 7. Cite Your Sources

When using data from this platform:

**Citation Format**:
```
United Nations Economic Commission for Africa (UN-ECA). (2026).
Africa Health Financing Gap Analysis Platform. Data sourced from
WHO Global Health Expenditure Database (GHED). Retrieved from
[platform URL]
```

---

## Frequently Asked Questions

### General Questions

**Q: Is this platform free to use?**
A: Yes, the platform is publicly accessible at no cost.

**Q: Do I need to create an account?**
A: No, no registration or login is required.

**Q: Can I use this data for research publications?**
A: Yes, with proper citation (see section above).

---

### Data Questions

**Q: Where does the data come from?**
A: All data is sourced from the WHO Global Health Expenditure Database (GHED), the authoritative source for health financing data worldwide.

**Q: How often is data updated?**
A: The platform contains data through 2023. WHO GHED updates annually, typically in Q2-Q3 of the following year.

**Q: Why is some data missing?**
A: Missing data occurs when countries haven't reported to WHO, often due to lack of national health accounts, conflict, or reporting delays.

**Q: Can I access data before 2000?**
A: This platform focuses on 2000-2023. For earlier data, visit the WHO GHED portal directly.

**Q: Why is Seychelles grouped with "Upper-middle" income instead of "High" income?**
A: Seychelles is the only high-income African country. For meaningful regional comparisons, it's grouped with upper-middle income countries.

---

### Technical Questions

**Q: Which browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (all recent versions). JavaScript must be enabled.

**Q: The charts aren't loading. What should I do?**
A:
1. Check your internet connection
2. Clear browser cache and refresh
3. Try a different browser
4. Disable browser extensions (ad blockers, etc.)

**Q: Can I use this platform on mobile?**
A: Yes, the platform is mobile-responsive. However, complex charts are best viewed on desktop or tablet.

**Q: How do I download data?**
A: See the "Downloading Data" section above. Click the download button in Data Explorer or on individual charts.

---

### Analysis Questions

**Q: What does "Gini coefficient" mean?**
A: The Gini coefficient measures inequality. Values range from 0 (perfect equality) to 1 (perfect inequality). Higher values indicate greater disparity between countries.

**Q: What is the Abuja Declaration?**
A: In 2001, African heads of state pledged to allocate at least 15% of their national budget to health. This platform tracks progress toward that commitment.

**Q: How is UHC measured?**
A: The UHC service coverage index (0-100) is a composite indicator from WHO that measures population coverage by essential health services across 14 tracer indicators.

**Q: Why do some countries with high spending have poor outcomes?**
A: Health outcomes depend on many factors beyond financing: governance, health system efficiency, disease burden, infrastructure, conflict, etc. High spending doesn't guarantee good outcomes if systems are inefficient or inequitable.

**Q: Can I compare African countries to other regions?**
A: This platform focuses exclusively on Africa. For global comparisons, visit the WHO GHED portal.

---

### Platform Features

**Q: Can I save my filters or charts?**
A: Currently, the platform doesn't have a save/bookmark feature. You can:
- Download data (CSV) with your filters applied
- Download charts (PNG/SVG)
- Bookmark specific page URLs in your browser

**Q: Can I embed charts in my website or presentation?**
A: You can download charts as PNG or SVG and embed those images. Direct iframe embedding is not currently supported.

**Q: Is there an API to access the data programmatically?**
A: The platform has a backend API, but it's not publicly documented for external use. For programmatic access, we recommend downloading the full dataset CSV and loading it into your analysis tool.

---

### Support

**Q: I found a bug or error. Who do I contact?**
A: Platform Issues → United Nations Economic Commission for Africa (UN-ECA)
   Website: https://www.uneca.org

**Q: I have questions about the data itself.**
A: Data Questions → WHO Global Health Expenditure Database
   Email: healthaccounts@who.int
   Portal: https://apps.who.int/nha/database

**Q: Can I request new features?**
A: Yes, contact the UN-ECA team with feature requests. We regularly update the platform based on user feedback.

---

## Complementary Platform

This Gap Analysis Platform works alongside the **Health Financing Dashboard**:

🔗 **URL**: https://health-dashboard-winter-sky-9151.fly.dev/

**Purpose**: Real-time monitoring and visualization of health financing indicators

**Relationship**:
- **This platform** (Gap Analysis): Deep dive into gaps, trends, and cross-dimensional relationships
- **Dashboard**: Real-time monitoring, quick stats, executive summaries

**When to Use Each**:
- Use **this platform** for: Research, detailed analysis, downloading data, trend analysis
- Use **Dashboard** for: Quick overview, monitoring progress, executive briefings

---

## Getting Help

### Quick Help Resources

1. **Hover tooltips**: Hover over charts and controls for context-sensitive help
2. **About page**: Background on the project and methodology
3. **Sources page**: Details on data sources and limitations
4. **This guide**: Comprehensive user instructions

### Contact Support

**Platform Issues**:
- United Nations Economic Commission for Africa (UN-ECA)
- Addis Ababa, Ethiopia
- https://www.uneca.org

**Data Questions**:
- WHO Global Health Expenditure Database
- Email: healthaccounts@who.int
- https://apps.who.int/nha/database

---

## Glossary

**Abuja Declaration**: 2001 commitment by African heads of state to allocate ≥15% of national budget to health

**GHED**: WHO Global Health Expenditure Database - the authoritative source for health financing data

**Gini Coefficient**: Measure of inequality (0 = perfect equality, 1 = perfect inequality)

**Out-of-Pocket (OOP)**: Direct household payments for health services at point of care

**SHA 2011**: System of Health Accounts 2011 - WHO framework for tracking health financing

**UHC**: Universal Health Coverage - ensuring all people have access to needed health services without financial hardship

**UHC Service Coverage Index**: Composite indicator (0-100) measuring population coverage by essential health services

**WHO**: World Health Organization - UN agency responsible for international public health

---

**User Guide Version**: 1.0
**Last Updated**: 2026-03-22
**Platform Version**: 1.0
**Maintained By**: UN-ECA Platform Team

**Feedback**: We welcome your feedback to improve this platform. Contact us at the addresses above.

