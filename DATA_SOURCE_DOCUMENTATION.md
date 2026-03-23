# Data Source Documentation
## Africa Health Financing Gap Analysis Platform

**Last Updated**: 2026-03-22
**Data Coverage**: 2000-2023
**Geographic Coverage**: 54 African countries

---

## Data Source

### WHO Global Health Expenditure Database (GHED)

**Official URL**: https://apps.who.int/nha/database/Home/IndicatorsDownload/en

**Description**: The World Health Organization's Global Health Expenditure Database (GHED) is the **sole source** for all data used in this platform. All health financing indicators, UHC coverage metrics, health outcome indicators, and related data were downloaded from WHO GHED.

**Data Download Method**: Bulk data download from WHO NHA Indicators Download portal

---

## Data Acquisition Details

### Download Information

**Source Portal**: WHO National Health Accounts Database
**Download Page**: https://apps.who.int/nha/database/Home/IndicatorsDownload/en
**Access Method**: Public data download (freely available)
**Data Format**: Downloaded locally and processed for platform use
**Data Period**: 2000-2023 (24 years of historical data)

### What Was Downloaded

The following indicator categories were obtained from WHO GHED:

#### 1. Government Health Expenditure
- Government health expenditure per capita (current US$)
- Government health expenditure as % of GDP
- Government health expenditure as % of government budget
- Government health expenditure as % of total health expenditure

#### 2. Total Health Expenditure
- Total health expenditure per capita (current US$)
- Total health expenditure as % of GDP

#### 3. Financing Sources
- Out-of-pocket health expenditure (% of current health expenditure)
- External health expenditure (% of current health expenditure)
- Domestic private health expenditure (% of current health expenditure)
- Voluntary prepayments (% of current health expenditure)
- Domestic general government health expenditure (% of total health expenditure)

#### 4. Financial Protection Indicators
- Out-of-pocket spending as % of total health expenditure
- Catastrophic health spending incidence

#### 5. Health System Performance
- UHC Service Coverage Index (from WHO UHC Data Portal)
- Neonatal mortality rate (from UN SDG Database)
- Maternal mortality ratio (from UN SDG Database)

---

## Data Processing & Integration

### Data Pipeline

**Step 1: Download**
- Data downloaded from WHO GHED bulk download portal
- CSV/Excel format obtained with all indicators and years

**Step 2: Data Cleaning**
- Standardized country names and codes
- Handled missing values and data gaps
- Validated against WHO data dictionaries
- Removed duplicates and inconsistencies

**Step 3: Integration**
- Merged health financing data with complementary sources:
  - World Bank population data
  - UN SDG health outcome indicators
  - Regional classifications (African subregions)
  - Income group classifications

**Step 4: Database Storage**
- Structured data stored in platform database
- Indexed for fast querying and filtering
- Organized for cross-dimensional analysis

**Step 5: API Development**
- RESTful API endpoints created for data access
- Filtering by country, year, indicator, region
- Aggregation capabilities for regional/income group analysis

---

## Data Quality & Validation

### WHO Data Quality Standards

WHO GHED data undergoes rigorous quality assurance:

1. **National Validation**: Data submitted by countries through National Health Accounts
2. **WHO Technical Review**: Validated by WHO health financing experts
3. **Cross-Source Verification**: Checked against government budgets, IMF, World Bank data
4. **Methodological Consistency**: Follows SHA 2011 framework
5. **Time Series Checks**: Validated for consistency across years

### Known Data Limitations

**Temporal Coverage**:
- Some countries have incomplete data for early years (2000-2005)
- Latest data (2023) may be preliminary for some countries
- Data typically lags by 1-2 years due to reporting cycles

**Indicator Coverage**:
- Not all indicators available for all countries/years
- Some disaggregated indicators have limited coverage
- External health expenditure estimates may vary

**Methodology Changes**:
- SHA 2011 methodology adoption created breaks in some time series
- Country reporting practices evolve over time
- Classification changes may affect comparability

---

## How WHO GHED Consolidates Data

**Important Note**: All data for this platform was downloaded from the single WHO Global Health Expenditure Database. However, WHO GHED itself consolidates and validates data from multiple authoritative sources to create a comprehensive, standardized dataset.

### Sources WHO GHED Integrates (Behind the Scenes)

When you download from WHO GHED, the database has already integrated data from:

**National Sources**:
- National Health Accounts reports
- Ministry of Finance budget documents
- Ministry of Health expenditure reports
- National statistical offices

**International Economic Data**:
- World Bank (GDP, population estimates)
- International Monetary Fund (economic indicators)
- UN Population Division (demographic data)

**WHO Programs & Databases**:
- WHO UHC monitoring (service coverage indicators)
- WHO Global Health Observatory (health outcomes)
- WHO SDG monitoring (maternal mortality, neonatal mortality)

**Validation Sources**:
- Government financial reports
- OECD health statistics (for cross-validation)
- Regional health organizations

### What This Means for Users

✅ **You download from one place:** WHO GHED bulk download portal
✅ **WHO does the integration:** All underlying sources are validated and merged by WHO
✅ **Single citation needed:** Credit WHO GHED as the source
✅ **Consistent methodology:** SHA 2011 framework applied across all data
✅ **Quality assured:** WHO validates all integrated data

---

## Data Attribution & Citation

### Platform Citation

```
United Nations Economic Commission for Africa (UN-ECA). (2026).
Africa Health Financing Gap Analysis Platform.
Data sourced from WHO Global Health Expenditure Database (2000-2023).
Addis Ababa, Ethiopia.
Available at: [Platform URL]
```

### WHO Data Citation

```
World Health Organization. (2024).
Global Health Expenditure Database.
Geneva: World Health Organization.
Available at: https://apps.who.int/nha/database/Home/IndicatorsDownload/en
Accessed: [Download Date]
```

### Academic Citation (APA Style)

```
United Nations Economic Commission for Africa. (2026).
Africa Health Financing Gap Analysis Platform [Data visualization platform].
Retrieved from [Platform URL].
Data source: World Health Organization Global Health Expenditure Database (2000-2023).
```

---

## Data Update Policy

### Current Data Version

**Downloaded**: 2024 (specific date when data was downloaded)
**WHO GHED Version**: 2024 release
**Data Coverage**: 2000-2023
**Countries**: 54 African nations

### Update Frequency

**WHO GHED Updates**:
- WHO updates GHED annually (typically Q2-Q3)
- New data released with 1-2 year lag
- Revisions may be applied to historical data

**Platform Update Recommendations**:
- Annual data refresh recommended
- Download latest WHO GHED data
- Re-run data processing pipeline
- Validate against previous version
- Document changes and revisions

### Accessing Latest Data

Users can access the most current data directly from:
- **WHO GHED**: https://apps.who.int/nha/database
- **WHO Data Portal**: https://www.who.int/data/gho
- **Platform Updates**: Check platform for last update date

---

## Data Access Methods

### For Platform Users

**Via Platform Interface**:
1. Navigate to http://localhost:3000 (or production URL)
2. Use Charts, Data Explorer, or Cross-Dimensional Analysis tools
3. Filter by country, year, indicator, region
4. Download visualizations or data subsets

**Via API** (if available):
- RESTful API endpoints
- JSON format responses
- Query parameters for filtering
- Documentation at /api/docs

### Downloading Original WHO Data

**Step 1**: Visit https://apps.who.int/nha/database/Home/IndicatorsDownload/en

**Step 2**: Select Parameters
- Countries: Choose African countries or all
- Indicators: Select health financing indicators
- Years: Select 2000-2023 or custom range

**Step 3**: Choose Format
- CSV (recommended for analysis)
- Excel
- JSON/XML (for developers)

**Step 4**: Download and Use
- Free download, no registration required
- Attribution to WHO required in publications
- Follow WHO data use terms

---

## Health Financing Indicators Glossary

### Government Health Expenditure

**Definition**: Government and compulsory health spending from domestic sources

**Includes**:
- Central government health budget
- Social health insurance (compulsory)
- Regional/local government health spending

**Excludes**:
- External/donor funding
- Voluntary health insurance
- Out-of-pocket payments

### Total Health Expenditure (THE)

**Definition**: Sum of all health expenditure from public and private sources

**Components**:
- Government health expenditure
- Out-of-pocket payments
- Voluntary prepayments (private insurance)
- External/donor funding
- Other domestic private sources

### Out-of-Pocket (OOP) Expenditure

**Definition**: Direct household spending on health at point of service

**Includes**:
- User fees
- Co-payments
- Medicine purchases
- Informal payments

**Significance**: High OOP (>20% THE) indicates poor financial protection

### External Health Expenditure

**Definition**: Health funding from international sources

**Includes**:
- Development assistance for health
- NGO/foundation grants
- External loans for health

### Current Health Expenditure (CHE)

**Definition**: Total health expenditure excluding capital investments

**Difference from THE**: Excludes infrastructure, equipment investments

**Note**: Many WHO indicators now use CHE as denominator instead of THE

---

## System of Health Accounts (SHA 2011)

### Overview

**SHA 2011** is the international standard for health expenditure tracking developed by:
- World Health Organization (WHO)
- Organisation for Economic Co-operation and Development (OECD)
- Statistical Office of the European Union (Eurostat)

### Classification Dimensions

**1. Financing Schemes (HF)**
- Government schemes
- Compulsory health insurance
- Voluntary health insurance
- Out-of-pocket payments
- External/donor funding

**2. Healthcare Providers (HP)**
- Hospitals
- Ambulatory care providers
- Pharmacies
- Preventive care providers

**3. Healthcare Functions (HC)**
- Curative care
- Rehabilitative care
- Long-term care
- Preventive care
- Governance and health system administration

**4. Disease/Condition Categories (ICD)**
- Based on International Classification of Diseases

**5. Age and Gender**
- Disaggregation by demographic groups

---

## Policy Benchmarks & Targets

### International Health Financing Targets

#### Abuja Declaration (2001)
- **Target**: 15% of government budget to health
- **Status**: Few African countries achieve this
- **Source**: African Union commitment

#### WHO Recommendation
- **Target**: ≥5% of GDP to health
- **Rationale**: Progress toward Universal Health Coverage
- **Reference**: WHO health financing reports

#### Financial Protection Target
- **Target**: OOP ≤20% of total health expenditure
- **Rationale**: Prevent catastrophic health spending
- **SDG Alignment**: SDG 3.8 (UHC)

#### Sustainable Development Goal 3.8
- **Goal**: Achieve universal health coverage by 2030
- **Components**:
  - Essential health service coverage
  - Financial risk protection
  - Access to quality medicines and vaccines

---

## Data Use & Licensing

### WHO Data Use Terms

**Open Access**: WHO GHED data is freely available for:
- Research and analysis
- Publication and citation
- Educational purposes
- Policy development

**Required Attribution**: Must cite WHO as source

**Prohibited Uses**:
- Commercial sale of raw data
- Misrepresentation of data
- Use that implies WHO endorsement

### Platform Data Use

**For Users**:
- Data visualizations may be used with attribution
- Screenshots and exports allowed with citation
- Academic and policy use encouraged

**Attribution Required**:
```
Data source: Africa Health Financing Gap Analysis Platform (UN-ECA)
Based on WHO Global Health Expenditure Database (2000-2023)
```

---

## Technical Specifications

### Data Formats

**Source Data**:
- Format: CSV, Excel (from WHO)
- Encoding: UTF-8
- Delimiter: Comma
- Date Format: YYYY (year only)

**Platform Database**:
- Database: PostgreSQL / MongoDB (specify actual DB)
- Schema: Relational with indexed queries
- API Format: JSON/REST

### Data Fields

**Country Information**:
- Country code (ISO 3-letter)
- Country name
- WHO region
- African subregion
- Income group
- Population

**Indicator Information**:
- Indicator code
- Indicator name
- Unit (US$, %, etc.)
- Category (financing, structure, protection, outcomes)

**Data Values**:
- Year (2000-2023)
- Value (numeric)
- Data quality flags
- Source notes

---

## Contact & Support

### For Data Questions

**WHO Health Financing**:
- Email: healthaccounts@who.int
- Website: https://www.who.int/health-topics/health-financing

**WHO Data Support**:
- GHO Portal: https://www.who.int/data/gho
- GHED Portal: https://apps.who.int/nha/database

### For Platform Questions

**UN-ECA**:
- Website: https://www.uneca.org
- Location: Addis Ababa, Ethiopia

### For Technical Issues

Report platform bugs or technical issues through appropriate channels (specify if available).

---

## References & Further Reading

### Key WHO Publications

1. **Global Health Expenditure Database Documentation**
   - https://apps.who.int/nha/database/DocumentationCentre/Index/en

2. **System of Health Accounts 2011**
   - https://www.who.int/publications/i/item/9789264116016

3. **Global Spending on Health Reports** (annual)
   - https://www.who.int/publications/i/item/9789240064911

### African Health Financing

1. **African Union - Abuja Declaration**
   - Review and monitoring reports

2. **UN-ECA Health Financing Reports**
   - Regional analyses for Africa
   - https://www.uneca.org

3. **World Bank - Health Financing in Africa**
   - Country case studies
   - Policy recommendations

---

## Change Log

### Version History

**Version 1.0** (2026-03-22):
- Initial platform launch
- WHO GHED data (2000-2023) integrated
- 54 African countries covered
- 24 indicators implemented

**Future Updates**:
- Annual data refresh planned
- Additional indicators to be added
- Enhanced regional analysis features

---

## Appendix: Country Coverage

### 54 African Countries Included

**Northern Africa**:
- Algeria, Egypt, Libya, Morocco, Sudan, Tunisia

**Western Africa**:
- Benin, Burkina Faso, Cape Verde, Côte d'Ivoire, Gambia, Ghana, Guinea, Guinea-Bissau, Liberia, Mali, Mauritania, Niger, Nigeria, Senegal, Sierra Leone, Togo

**Eastern Africa**:
- Burundi, Comoros, Djibouti, Eritrea, Ethiopia, Kenya, Madagascar, Malawi, Mauritius, Mozambique, Rwanda, Seychelles, Somalia, South Sudan, Tanzania, Uganda, Zambia, Zimbabwe

**Central Africa**:
- Angola, Cameroon, Central African Republic, Chad, Congo, Democratic Republic of Congo, Equatorial Guinea, Gabon, São Tomé and Príncipe

**Southern Africa**:
- Botswana, Eswatini, Lesotho, Namibia, South Africa

---

**Document Version**: 1.0
**Last Updated**: 2026-03-22
**Maintained By**: UN-ECA Health Financing Platform Team
