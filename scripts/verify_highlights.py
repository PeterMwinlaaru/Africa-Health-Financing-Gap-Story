"""
Verify Highlights Against Actual Data
"""
import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('../processed_data/master_dataset.csv')
df = df[(df['year'] >= 2000) & (df['year'] <= 2023)]
df_2023 = df[df['year'] == 2023]
total = len(df_2023)

print('=' * 80)
print('VERIFICATION OF HIGHLIGHTS AGAINST DATA')
print('=' * 80)

discrepancies = []

# 1. Countries meeting threshold
print('\n1. COUNTRIES MEETING THRESHOLD (2023)')
print('-' * 40)
meeting = df_2023['Gov exp Health per capita More than Threshold'].sum()
pct = meeting / total * 100
print(f'   Highlight: 3 countries (5.6%)')
print(f'   Data: {int(meeting)} countries ({pct:.1f}%)')
countries = df_2023[df_2023['Gov exp Health per capita More than Threshold'] == 1]['location'].tolist()
print(f'   Countries: {countries}')
if meeting != 3:
    discrepancies.append(f"Threshold: Highlight says 3, data shows {int(meeting)}")

# 2. Spending gap
print('\n2. SPENDING GAP (2015 vs 2023)')
print('-' * 40)
gap_2015 = df[df['year'] == 2015]['Gov exp Health per capita'].max() - df[df['year'] == 2015]['Gov exp Health per capita'].min()
gap_2023 = df[df['year'] == 2023]['Gov exp Health per capita'].max() - df[df['year'] == 2023]['Gov exp Health per capita'].min()
print(f'   Highlight: Gap from USD 416.00 (2015) to USD 535.20 (2023)')
print(f'   Data: Gap {gap_2015:.2f} (2015) to {gap_2023:.2f} (2023)')
if abs(gap_2015 - 416) > 5 or abs(gap_2023 - 535.2) > 5:
    discrepancies.append(f"Spending gap: Highlight says $416->$535.20, data shows ${gap_2015:.1f}->${gap_2023:.1f}")

# 3. ABUJA DECLARATION - CRITICAL ERROR CHECK
print('\n3. ABUJA DECLARATION - CRITICAL ISSUE!')
print('-' * 40)
print('   Highlight says: "Africa avg health expenditure as % of GDP (5.0%)"')
print('   BUT: Abuja Declaration is about % of GOVERNMENT BUDGET, not GDP!')
avg_budget = df['Gov exp Health on budget'].mean()
avg_gdp = df['Gov exp Health on GDP'].mean()
print(f'   Data - Avg % of Gov Budget: {avg_budget:.1f}%')
print(f'   Data - Avg % of GDP: {avg_gdp:.1f}%')
discrepancies.append("CRITICAL: Highlight confuses GDP with Gov Budget for Abuja target")

# 4. Countries meeting Abuja
print('\n4. COUNTRIES MEETING ABUJA TARGET (2023)')
print('-' * 40)
meeting_abuja = df_2023['Gov exp Health on budget > 15'].sum()
print(f'   Highlight: Only 1 country in 2023')
print(f'   Data: {int(meeting_abuja)} countries')
if meeting_abuja > 0:
    countries_abuja = df_2023[df_2023['Gov exp Health on budget > 15'] == 1]['location'].tolist()
    print(f'   Countries: {countries_abuja}')
if meeting_abuja != 1:
    discrepancies.append(f"Abuja 2023: Highlight says 1, data shows {int(meeting_abuja)}")

# 5. OOP threshold
print('\n5. OOP THRESHOLD EXCEEDANCE (2023)')
print('-' * 40)
below_20 = df_2023['Out-of-pocket on health exp < 20'].sum()
above_20 = total - below_20
pct_above = above_20 / total * 100
print(f'   Highlight: About three-quarters exceeded (>20% OOP)')
print(f'   Data: {int(above_20)} countries exceeded ({pct_above:.1f}%)')
if abs(pct_above - 75) > 5:
    discrepancies.append(f"OOP: Highlight says ~75%, data shows {pct_above:.1f}%")

# 6. Average financing gap
print('\n6. AVERAGE FINANCING GAP (2023)')
print('-' * 40)
avg_gap = df_2023['Gap for Gov exp Health per capita'].mean()
print(f'   Highlight: USD 125.4 per capita')
print(f'   Data: USD {avg_gap:.1f} per capita')
if abs(avg_gap - 125.4) > 5:
    discrepancies.append(f"Avg gap: Highlight says $125.4, data shows ${avg_gap:.1f}")

# 7. Gap by subregion
print('\n7. FINANCING GAP BY SUBREGION (2023)')
print('-' * 40)
print('   Highlight: Eastern Africa $109.6, Central Africa $179.2')
subregion_gap = df_2023.groupby('Subregion')['Gap for Gov exp Health per capita'].mean()
for sr in ['Eastern Africa', 'Central Africa', 'Northern Africa', 'Southern Africa', 'Western Africa']:
    if sr in subregion_gap.index:
        print(f'   {sr}: ${subregion_gap[sr]:.1f}')
if 'Eastern Africa' in subregion_gap.index and abs(subregion_gap['Eastern Africa'] - 109.6) > 5:
    discrepancies.append(f"Eastern Africa gap: Highlight says $109.6, data shows ${subregion_gap['Eastern Africa']:.1f}")

# 8. Gini by income
print('\n8. GINI BY INCOME GROUP (2023)')
print('-' * 40)
print('   Highlight: Lower-middle (0.48), Upper-middle (0.25)')
gini_results = {}
for income in ['Low', 'Lower-middle', 'Upper-middle']:
    values = df_2023[df_2023['income'] == income]['Gov exp Health per capita'].dropna()
    if len(values) > 1:
        sorted_vals = np.sort(values)
        n = len(sorted_vals)
        index = np.arange(1, n + 1)
        gini = (2 * np.sum(index * sorted_vals) - (n + 1) * np.sum(sorted_vals)) / (n * np.sum(sorted_vals))
        gini_results[income] = gini
        print(f'   {income}: {gini:.2f}')

# 9. Budget priority gap
print('\n9. BUDGET PRIORITY GAP BY INCOME (2023)')
print('-' * 40)
print('   Highlight: LIC 9.5%, LMIC 7.8%, UMIC 5.1%')
for income in ['Low', 'Lower-middle', 'Upper-middle']:
    gap = df_2023[df_2023['income'] == income]['Gap Gov exp Health on budget'].mean()
    print(f'   {income}: {gap:.1f}%')

# 10. Financial protection trend
print('\n10. FINANCIAL PROTECTION TREND')
print('-' * 40)
print('   Highlight: Improved from 13.7% (2000) to 24.1% (2023)')
for year in [2000, 2023]:
    df_year = df[df['year'] == year]
    pct = df_year['Out-of-pocket on health exp < 20'].sum() / len(df_year) * 100
    print(f'   {year}: {pct:.1f}%')

# 11. OOP dominant source
print('\n11. OOP AS DOMINANT SOURCE (2014-2023)')
print('-' * 40)
df_recent = df[(df['year'] >= 2014) & (df['year'] <= 2023)]
avg_oop = df_recent['Out-of-pocket on health exp'].mean()
print(f'   Highlight: OOP average 36.7%')
print(f'   Data: OOP average {avg_oop:.1f}%')
if abs(avg_oop - 36.7) > 2:
    discrepancies.append(f"OOP avg: Highlight says 36.7%, data shows {avg_oop:.1f}%")

# 12. UHC average
print('\n12. UHC AVERAGE (2023)')
print('-' * 40)
print('   Highlight: Average UHC 52.7%')
avg_uhc = df_2023['Universal health coverage'].mean()
print(f'   Data: {avg_uhc:.1f}%')
if abs(avg_uhc - 52.7) > 2:
    discrepancies.append(f"UHC avg: Highlight says 52.7%, data shows {avg_uhc:.1f}%")

# 13. UHC range
print('\n13. UHC RANGE (2023)')
print('-' * 40)
print('   Highlight: Seychelles (80.0%) to Chad (26.0%)')
uhc_data = df_2023[['location', 'Universal health coverage']].dropna()
uhc_max = uhc_data.loc[uhc_data['Universal health coverage'].idxmax()]
uhc_min = uhc_data.loc[uhc_data['Universal health coverage'].idxmin()]
print(f'   Data Max: {uhc_max["location"]} ({uhc_max["Universal health coverage"]:.1f}%)')
print(f'   Data Min: {uhc_min["location"]} ({uhc_min["Universal health coverage"]:.1f}%)')

# 14. MMR trend
print('\n14. MMR TREND')
print('-' * 40)
print('   Highlight: Declined from 556 (2000) to 292 (2023)')
mmr_2000 = df[df['year'] == 2000]['Maternal mortality ratio'].mean()
mmr_2023 = df[df['year'] == 2023]['Maternal mortality ratio'].mean()
print(f'   Data: {mmr_2000:.1f} (2000) to {mmr_2023:.1f} (2023)')
if abs(mmr_2000 - 556) > 20 or abs(mmr_2023 - 292) > 20:
    discrepancies.append(f"MMR trend: Highlight says 556->292, data shows {mmr_2000:.0f}->{mmr_2023:.0f}")

# 15. MMR on course
print('\n15. COUNTRIES ON COURSE FOR SDG MMR (2023)')
print('-' * 40)
print('   Highlight: Only 8 out of 54 countries')
on_course = df_2023['mmr_on_course'].sum()
print(f'   Data: {int(on_course)} countries on course')
if on_course != 8:
    discrepancies.append(f"MMR on course: Highlight says 8, data shows {int(on_course)}")

# 16. MMR disparity
print('\n16. MMR DISPARITY (2023)')
print('-' * 40)
print('   Highlight: Egypt (17) lowest, Nigeria (993) highest')
mmr_data = df_2023[['location', 'Maternal mortality ratio']].dropna()
mmr_highest = mmr_data.loc[mmr_data['Maternal mortality ratio'].idxmax()]
mmr_lowest = mmr_data.loc[mmr_data['Maternal mortality ratio'].idxmin()]
print(f'   Data Highest: {mmr_highest["location"]} ({mmr_highest["Maternal mortality ratio"]:.0f})')
print(f'   Data Lowest: {mmr_lowest["location"]} ({mmr_lowest["Maternal mortality ratio"]:.0f})')

# 17. MMR by income
print('\n17. MMR BY INCOME GROUP (2023)')
print('-' * 40)
print('   Highlight: LIC 388.9, High 41.9 (Note: We recoded High to Upper-middle)')
for income in ['Low', 'Lower-middle', 'Upper-middle']:
    mmr = df_2023[df_2023['income'] == income]['Maternal mortality ratio'].mean()
    print(f'   {income}: {mmr:.1f}')

# 18. Correlations
print('\n18. SPENDING-UHC CORRELATION (2023)')
print('-' * 40)
print('   Highlight: 0.70')
valid = df_2023[['Gov exp Health per capita', 'Universal health coverage']].dropna()
corr, _ = stats.pearsonr(valid['Gov exp Health per capita'], valid['Universal health coverage'])
print(f'   Data: {corr:.2f}')
if abs(corr - 0.70) > 0.05:
    discrepancies.append(f"UHC correlation: Highlight says 0.70, data shows {corr:.2f}")

print('\n19. SPENDING-MMR CORRELATION (2023)')
print('-' * 40)
print('   Highlight: 0.47 (stated as positive, should be negative)')
valid = df_2023[['Gov exp Health per capita', 'Maternal mortality ratio']].dropna()
corr, _ = stats.pearsonr(valid['Gov exp Health per capita'], valid['Maternal mortality ratio'])
print(f'   Data: {corr:.2f}')

# 20. Low income countries
print('\n20. LOW INCOME COUNTRIES COUNT')
print('-' * 40)
print('   Highlight: All 22 low-income countries fell short')
lic_count = len(df_2023[df_2023['income'] == 'Low'])
lic_meeting = df_2023[(df_2023['income'] == 'Low') & (df_2023['Gov exp Health per capita More than Threshold'] == 1)].shape[0]
print(f'   Data: {lic_count} low-income countries, {lic_meeting} meeting threshold')
if lic_count != 22:
    discrepancies.append(f"LIC count: Highlight says 22, data shows {lic_count}")

# 21. Budget priority gap subregions
print('\n21. BUDGET PRIORITY GAP BY SUBREGION (2023)')
print('-' * 40)
print('   Highlight: Eastern 9.3%, Western 9.1%, Southern 6.0%, Northern 6.6%')
for sr in ['Eastern Africa', 'Western Africa', 'Southern Africa', 'Northern Africa', 'Central Africa']:
    gap = df_2023[df_2023['Subregion'] == sr]['Gap Gov exp Health on budget'].mean()
    print(f'   {sr}: {gap:.1f}%')

# Summary
print('\n' + '=' * 80)
print('SUMMARY OF DISCREPANCIES')
print('=' * 80)
if discrepancies:
    for i, d in enumerate(discrepancies, 1):
        print(f'{i}. {d}')
else:
    print('No significant discrepancies found.')
