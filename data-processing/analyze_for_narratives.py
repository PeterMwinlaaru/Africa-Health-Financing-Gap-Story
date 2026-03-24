import pandas as pd
import json

# Load the data
df = pd.read_excel(r'C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\data-processing\health_data.xlsx')

print('=== DATA ANALYSIS FOR NARRATIVES ===\n')

# 1. Public Health Expenditure Analysis
print('1. PUBLIC HEALTH EXPENDITURE PER CAPITA')
print(f'   Average 2000: ${df[df["year"]==2000]["Gov exp Health per capita"].mean():.2f}')
print(f'   Average 2023: ${df[df["year"]==2023]["Gov exp Health per capita"].mean():.2f}')
print(f'   Average 2024: ${df[df["year"]==2024]["Gov exp Health per capita"].mean():.2f}')
latest_year = df['year'].max()
latest_data = df[df['year']==latest_year]
below_threshold = (latest_data['Gov exp Health per capita More than Threshold'] == 0).sum()
total_countries = len(latest_data)
print(f'   Countries below threshold ({latest_year}): {below_threshold}/{total_countries} ({below_threshold/total_countries*100:.1f}%)')

# By income level
print('\n   By Income Level (2023):')
for income in df['income'].unique():
    if pd.notna(income):
        avg = df[(df['year']==2023) & (df['income']==income)]['Gov exp Health per capita'].mean()
        print(f'   - {income}: ${avg:.2f}')

# By region
print('\n   By Region (2023):')
for region in df['Subregion'].unique():
    if pd.notna(region):
        avg = df[(df['year']==2023) & (df['Subregion']==region)]['Gov exp Health per capita'].mean()
        print(f'   - {region}: ${avg:.2f}')

# 2. Abuja Declaration
print('\n2. ABUJA DECLARATION (15% BUDGET TARGET)')
abuja_2023 = df[df['year']==2023]
meeting_abuja = (abuja_2023['Gov exp Health on budget'] >= 15).sum()
avg_budget_share = abuja_2023['Gov exp Health on budget'].mean()
print(f'   Countries meeting 15% target (2023): {meeting_abuja}/{len(abuja_2023)} ({meeting_abuja/len(abuja_2023)*100:.1f}%)')
print(f'   African average budget share (2023): {avg_budget_share:.2f}%')

# Top performers
top_abuja = abuja_2023.nlargest(5, 'Gov exp Health on budget')[['location', 'Gov exp Health on budget']]
print('\n   Top 5 countries (2023):')
for idx, row in top_abuja.iterrows():
    print(f'   - {row["location"]}: {row["Gov exp Health on budget"]:.1f}%')

# 3. UHC Index
print('\n3. UNIVERSAL HEALTH COVERAGE INDEX')
uhc_2000 = df[df['year']==2000]['Universal health coverage'].mean()
uhc_2023 = df[df['year']==2023]['Universal health coverage'].mean()
print(f'   Average 2000: {uhc_2000:.1f}')
print(f'   Average 2023: {uhc_2023:.1f}')
print(f'   Improvement: +{uhc_2023-uhc_2000:.1f} points')

uhc_above_75 = (df[df['year']==2023]['Universal health coverage'] >= 75).sum()
print(f'   Countries with UHC >= 75 (2023): {uhc_above_75}')

# By region
print('\n   By Region (2023):')
for region in df['Subregion'].unique():
    if pd.notna(region):
        avg = df[(df['year']==2023) & (df['Subregion']==region)]['Universal health coverage'].mean()
        print(f'   - {region}: {avg:.1f}')

# 4. Out-of-Pocket Expenditure
print('\n4. OUT-OF-POCKET HEALTH EXPENDITURE')
oop_2023 = df[df['year']==2023]
avg_oop = oop_2023['Out-of-pocket on health exp'].mean()
above_20 = (oop_2023['Out-of-pocket on health exp'] > 20).sum()
print(f'   African average (2023): {avg_oop:.1f}%')
print(f'   Countries above 20% benchmark: {above_20}/{len(oop_2023)} ({above_20/len(oop_2023)*100:.1f}%)')

# 5. Health Outcomes
print('\n5. HEALTH OUTCOMES')
nmr_2000 = df[df['year']==2000]['Neonatal mortality rate'].mean()
nmr_2023 = df[df['year']==2023]['Neonatal mortality rate'].mean()
print(f'   Neonatal Mortality Rate:')
print(f'   - 2000: {nmr_2000:.1f} per 1,000')
print(f'   - 2023: {nmr_2023:.1f} per 1,000')
print(f'   - Reduction: {nmr_2000-nmr_2023:.1f} per 1,000 ({(nmr_2000-nmr_2023)/nmr_2000*100:.1f}%)')

mmr_2000 = df[df['year']==2000]['Maternal mortality ratio'].mean()
mmr_2023 = df[df['year']==2023]['Maternal mortality ratio'].mean()
print(f'\n   Maternal Mortality Ratio:')
print(f'   - 2000: {mmr_2000:.1f} per 100,000')
print(f'   - 2023: {mmr_2023:.1f} per 100,000')
print(f'   - Reduction: {mmr_2000-mmr_2023:.1f} per 100,000 ({(mmr_2000-mmr_2023)/mmr_2000*100:.1f}%)')

# 6. Financing Structure
print('\n6. HEALTH FINANCING STRUCTURE (2023 Average)')
fin_2023 = df[df['year']==2023]
print(f'   Government: {fin_2023["Govern on health exp"].mean():.1f}%')
print(f'   Out-of-pocket: {fin_2023["Out-of-pocket on health exp"].mean():.1f}%')
print(f'   External/Donors: {fin_2023["External on health exp"].mean():.1f}%')
print(f'   Voluntary Insurance: {fin_2023["Voluntary Prepayments on health exp"].mean():.1f}%')
print(f'   Other Private: {fin_2023["Other Private on health exp"].mean():.1f}%')

gov_dominant = (fin_2023['Govern on health exp'] > 50).sum()
print(f'\n   Countries with government >50%: {gov_dominant}/{len(fin_2023)} ({gov_dominant/len(fin_2023)*100:.1f}%)')

print('\n=== ANALYSIS COMPLETE ===')
