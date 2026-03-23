"""
Generate target achievement maps for all charts
"""
import pandas as pd
import json
from pathlib import Path

# Read master data
data_path = Path(r"C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\processed_data\master_dataset.csv")
df = pd.read_csv(data_path)

# Get 2023 data
df_2023 = df[df['year'] == 2023].copy()

def generate_map_data(field, threshold, direction='above'):
    """Generate target achievement map for a field"""
    map_data = {}

    field_data = df_2023[df_2023[field].notna()].copy()

    for _, row in field_data.iterrows():
        country = row['location']
        value = row[field]

        if direction == 'above':
            # Higher is better (e.g., UHC, government spending)
            if value >= threshold:
                status = "met"
                percent_below = 0
            else:
                gap_pct = ((threshold - value) / threshold) * 100
                percent_below = gap_pct

                if gap_pct <= 20:
                    status = "close"
                elif gap_pct <= 50:
                    status = "moderate"
                else:
                    status = "far"
        else:
            # Lower is better (e.g., mortality, OOP)
            if value <= threshold:
                status = "met"
                percent_below = 0
            else:
                gap_pct = ((value - threshold) / threshold) * 100
                percent_below = gap_pct

                if gap_pct <= 20:
                    status = "close"
                elif gap_pct <= 50:
                    status = "moderate"
                else:
                    status = "far"

        map_data[country] = {
            "status": status,
            "percentBelow": round(percent_below, 1)
        }

    return map_data

# Generate maps for each chart
charts_to_map = [
    {
        'name': 'Government Health Spending as Share of Budget',
        'slug': 'government-health-budget-share',
        'field': 'Gov exp Health on budget',
        'threshold': 15,
        'direction': 'above'
    },
    {
        'name': 'Government Health Spending as Share of GDP',
        'slug': 'government-health-expenditure-gdp-share',
        'field': 'Gov exp Health on GDP',
        'threshold': 5,
        'direction': 'above'
    },
    {
        'name': 'Out-of-Pocket Expenditure Share',
        'slug': 'out-of-pocket-expenditure-share',
        'field': 'Out-of-pocket on health exp',
        'threshold': 20,
        'direction': 'below'
    },
    {
        'name': 'External Health Financing Share',
        'slug': 'external-health-financing-share',
        'field': 'External on health exp',
        'threshold': 22.5,
        'direction': 'below'
    },
    {
        'name': 'Universal Health Coverage Index',
        'slug': 'uhc-service-coverage-index',
        'field': 'Universal health coverage',
        'threshold': 75,
        'direction': 'above'
    },
    {
        'name': 'Neonatal Mortality Rate',
        'slug': 'neonatal-mortality-rate-trends',
        'field': 'Neonatal mortality rate',
        'threshold': 12,
        'direction': 'below'
    },
    {
        'name': 'Maternal Mortality Ratio',
        'slug': 'maternal-mortality-ratio-trends',
        'field': 'Maternal mortality ratio',
        'threshold': 70,
        'direction': 'below'
    }
]

results = {}

for chart in charts_to_map:
    print(f"\nGenerating map for: {chart['name']}")
    map_data = generate_map_data(chart['field'], chart['threshold'], chart['direction'])

    # Count statuses
    status_counts = {'met': 0, 'close': 0, 'moderate': 0, 'far': 0}
    for country_data in map_data.values():
        status_counts[country_data['status']] += 1

    print(f"  Met: {status_counts['met']}, Close: {status_counts['close']}, Moderate: {status_counts['moderate']}, Far: {status_counts['far']}")

    results[chart['slug']] = map_data

# Save to JSON
output_path = Path(r"C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\target_achievement_maps.json")
with open(output_path, 'w') as f:
    json.dump(results, f, indent=2)

print(f"\n{'='*80}")
print(f"Maps generated! Saved to: {output_path}")
print(f"{'='*80}")
