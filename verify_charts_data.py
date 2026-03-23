#!/usr/bin/env python3
"""
Verify charts.ts statistics against actual master_dataset.csv
"""

import pandas as pd
import json
from pathlib import Path

# Load the master dataset
data_path = Path("processed_data/master_dataset.csv")
df = pd.read_csv(data_path)

print("=" * 80)
print("DATA VERIFICATION REPORT")
print("=" * 80)
print()

# Basic dataset info
print("DATASET OVERVIEW:")
print(f"Total records: {len(df)}")
print(f"Year range: {df['year'].min():.0f} - {df['year'].max():.0f}")
print(f"Unique countries: {df['location'].nunique()}")
print()

# Get latest year with most complete data
latest_year = df[df['Gov exp Health per capita'].notna()]['year'].max()
print(f"Latest year with data: {latest_year:.0f}")
print()

# Filter to latest year
latest_df = df[df['year'] == latest_year].copy()

print("=" * 80)
print(f"GOVERNMENT HEALTH EXPENDITURE PER CAPITA ANALYSIS ({latest_year:.0f})")
print("=" * 80)
print()

# Get threshold data from metadata
with open('processed_data/metadata.json', 'r') as f:
    metadata = json.load(f)

thresholds = metadata['thresholds']['gov_exp_health_per_capita']
print(f"Thresholds by income level:")
print(f"  Low income: ${thresholds['Low']}")
print(f"  Lower-middle income: ${thresholds['Lower-middle']}")
print(f"  Upper-middle income: ${thresholds['Upper-middle']}")
print()

# Check countries meeting income-specific thresholds
latest_df['meets_threshold'] = False

for idx, row in latest_df.iterrows():
    if pd.notna(row['Gov exp Health per capita']) and pd.notna(row['income']):
        value = row['Gov exp Health per capita']
        income_level = row['income']

        if income_level in thresholds:
            threshold = thresholds[income_level]
            latest_df.at[idx, 'meets_threshold'] = value >= threshold

countries_with_data = latest_df['Gov exp Health per capita'].notna().sum()
countries_meeting = latest_df['meets_threshold'].sum()

print(f"Countries with data in {latest_year:.0f}: {countries_with_data}")
print(f"Countries meeting income-specific thresholds: {countries_meeting}")
print(f"Percentage: {(countries_meeting / countries_with_data * 100):.1f}%")
print()

# List countries meeting threshold
meeting_countries = latest_df[latest_df['meets_threshold'] == True]['location'].tolist()
print(f"Countries meeting threshold: {meeting_countries}")
print()

# Continental average
avg_spending = latest_df['Gov exp Health per capita'].mean()
print(f"Continental average (Gov exp Health per capita, {latest_year:.0f}): ${avg_spending:.2f}")
print()

print("=" * 80)
print(f"ABUJA TARGET ANALYSIS ({latest_year:.0f})")
print("=" * 80)
print()

# Abuja target (15% of government budget)
abuja_threshold = metadata['thresholds']['abuja_target']
print(f"Abuja target: {abuja_threshold}% of government budget")
print()

abuja_data = latest_df[latest_df['Gov exp Health on budget'].notna()].copy()
abuja_data['meets_abuja'] = abuja_data['Gov exp Health on budget'] >= abuja_threshold

abuja_meeting = abuja_data['meets_abuja'].sum()
abuja_total = len(abuja_data)

print(f"Countries with data: {abuja_total}")
print(f"Countries meeting Abuja target: {abuja_meeting}")
print(f"Percentage: {(abuja_meeting / abuja_total * 100):.1f}%")
print()

# List countries meeting Abuja
abuja_countries = abuja_data[abuja_data['meets_abuja'] == True]['location'].tolist()
print(f"Countries meeting Abuja target: {abuja_countries}")
print()

# Continental average for Abuja
avg_abuja = abuja_data['Gov exp Health on budget'].mean()
print(f"Continental average (Gov exp Health on budget, {latest_year:.0f}): {avg_abuja:.2f}%")
print()

print("=" * 80)
print("GROWTH ANALYSIS (2000 baseline)")
print("=" * 80)
print()

# Get 2000 baseline and latest year
baseline_year = 2000
baseline_df = df[df['year'] == baseline_year].copy()

baseline_avg = baseline_df['Gov exp Health per capita'].mean()
latest_avg = latest_df['Gov exp Health per capita'].mean()

if pd.notna(baseline_avg) and pd.notna(latest_avg):
    growth_pct = ((latest_avg - baseline_avg) / baseline_avg) * 100
    print(f"2000 baseline average: ${baseline_avg:.2f}")
    print(f"{latest_year:.0f} average: ${latest_avg:.2f}")
    print(f"Growth: {growth_pct:.1f}%")
else:
    print("Insufficient data for growth calculation")
print()

print("=" * 80)
print("OUT-OF-POCKET SPENDING ANALYSIS")
print("=" * 80)
print()

oop_threshold = metadata['thresholds']['oop_benchmark']
print(f"OOP threshold: {oop_threshold}% of health expenditure")
print()

oop_data = latest_df[latest_df['Out-of-pocket on health exp'].notna()].copy()
oop_data['meets_oop'] = oop_data['Out-of-pocket on health exp'] <= oop_threshold

oop_meeting = oop_data['meets_oop'].sum()
oop_total = len(oop_data)

print(f"Countries with data ({latest_year:.0f}): {oop_total}")
print(f"Countries meeting OOP protection target (<=20%): {oop_meeting}")
print(f"Percentage: {(oop_meeting / oop_total * 100):.1f}%")
print()

avg_oop = oop_data['Out-of-pocket on health exp'].mean()
print(f"Continental average OOP ({latest_year:.0f}): {avg_oop:.2f}%")
print()

print("=" * 80)
print("UHC SERVICE COVERAGE ANALYSIS")
print("=" * 80)
print()

uhc_data = latest_df[latest_df['Universal health coverage'].notna()].copy()
avg_uhc = uhc_data['Universal health coverage'].mean()

print(f"Countries with UHC data ({latest_year:.0f}): {len(uhc_data)}")
print(f"Continental average UHC index: {avg_uhc:.1f}")
print()

print("=" * 80)
print("SUMMARY OF KEY FINDINGS")
print("=" * 80)
print()
print(f"1. Latest year with data: {latest_year:.0f}")
print(f"2. Gov exp per capita (income-specific threshold):")
print(f"   - Countries meeting: {countries_meeting} of {countries_with_data} ({(countries_meeting / countries_with_data * 100):.1f}%)")
print(f"   - Continental avg: ${avg_spending:.2f}")
print(f"3. Abuja target (15% of budget):")
print(f"   - Countries meeting: {abuja_meeting} of {abuja_total} ({(abuja_meeting / abuja_total * 100):.1f}%)")
print(f"   - Continental avg: {avg_abuja:.2f}%")
print(f"4. OOP financial protection (<=20%):")
print(f"   - Countries meeting: {oop_meeting} of {oop_total} ({(oop_meeting / oop_total * 100):.1f}%)")
print(f"   - Continental avg: {avg_oop:.2f}%")
print(f"5. UHC service coverage:")
print(f"   - Continental avg: {avg_uhc:.1f}")
print()

print("=" * 80)
print("ISSUES TO VERIFY IN charts.ts:")
print("=" * 80)
print()
print("1. Check if 'Only 3 out of 54 countries (5.6%) meet their income-specific thresholds' is accurate")
print(f"   ACTUAL: {countries_meeting} out of {countries_with_data} ({(countries_meeting / countries_with_data * 100):.1f}%)")
print()
print("2. Check if 'Government health spending has grown 193.7% since 2000' is accurate")
if pd.notna(baseline_avg) and pd.notna(latest_avg):
    print(f"   ACTUAL: Growth of {growth_pct:.1f}% from 2000 to {latest_year:.0f}")
else:
    print("   CANNOT VERIFY - Missing baseline data")
print()
print("3. Check if year references are consistent (should be {latest_year:.0f}, not 2023)")
print()
print("4. Check if 'Only 1 of 54 African countries meets the 15% Abuja target' is accurate")
print(f"   ACTUAL: {abuja_meeting} out of {abuja_total} ({(abuja_meeting / abuja_total * 100):.1f}%)")
print()

print("=" * 80)
