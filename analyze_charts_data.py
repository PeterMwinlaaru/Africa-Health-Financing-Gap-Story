"""
Analyze master dataset to generate enhancedAnalytics for all charts
"""
import pandas as pd
import numpy as np
import json
from pathlib import Path

# Read master data
data_path = Path(r"C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\processed_data\master_dataset.csv")
df = pd.read_csv(data_path)

# Chart configurations to analyze
charts_config = [
    {
        'name': 'Government Health Spending as Share of Budget',
        'field': 'Gov exp Health on budget',
        'threshold': {'value': 15, 'type': 'single'},
        'unit': '%',
        'slug': 'gov-health-budget-share'
    },
    {
        'name': 'Government Health Spending as Share of GDP',
        'field': 'Gov exp Health on GDP',
        'threshold': {'value': 5, 'type': 'single'},
        'unit': '% of GDP',
        'slug': 'gov-health-gdp-share'
    },
    {
        'name': 'Total Health Expenditure as Share of GDP',
        'field': 'Exp Health on GDP',
        'threshold': None,
        'unit': '% of GDP',
        'slug': 'total-health-expenditure-gdp-share'
    },
    {
        'name': 'Out-of-Pocket Expenditure Share',
        'field': 'Out-of-pocket on health exp',
        'threshold': {'value': 20, 'type': 'single', 'direction': 'below'},
        'unit': '% of health expenditure',
        'slug': 'out-of-pocket-expenditure-share'
    },
    {
        'name': 'External Health Financing Share',
        'field': 'External on health exp',
        'threshold': {'value': 22.5, 'type': 'single', 'direction': 'below'},
        'unit': '% of health expenditure',
        'slug': 'external-health-financing-share'
    },
    {
        'name': 'Universal Health Coverage Index',
        'field': 'Universal health coverage',
        'threshold': {'value': 75, 'type': 'single'},
        'unit': 'index (0-100)',
        'slug': 'uhc-service-coverage-index'
    },
    {
        'name': 'Neonatal Mortality Rate',
        'field': 'Neonatal mortality rate',
        'threshold': {'value': 12, 'type': 'single', 'direction': 'below'},
        'unit': 'per 1,000 live births',
        'slug': 'neonatal-mortality-rate-trends'
    },
    {
        'name': 'Maternal Mortality Ratio',
        'field': 'Maternal mortality ratio',
        'threshold': {'value': 70, 'type': 'single', 'direction': 'below'},
        'unit': 'per 100,000 live births',
        'slug': 'maternal-mortality-ratio-trends'
    }
]

def calculate_gini(values):
    """Calculate Gini coefficient"""
    values = np.array(values)
    values = values[~np.isnan(values)]
    if len(values) == 0:
        return None
    values = np.sort(values)
    n = len(values)
    index = np.arange(1, n + 1)
    return (2 * np.sum(index * values)) / (n * np.sum(values)) - (n + 1) / n

def analyze_chart(config):
    """Analyze a single chart's data"""
    field = config['field']
    threshold = config['threshold']
    unit = config['unit']

    print(f"\n{'='*80}")
    print(f"Analyzing: {config['name']}")
    print(f"Field: {field}")
    print(f"{'='*80}")

    # Filter data for this field
    field_data = df[df[field].notna()].copy()

    if len(field_data) == 0:
        print(f"WARNING: No data found for field {field}")
        return None

    # 1. CONTINENTAL OVERVIEW
    current_year_data = field_data[field_data['year'] == 2023]
    baseline_year_data = field_data[field_data['year'] == 2000]

    current_avg = current_year_data[field].mean()
    baseline_avg = baseline_year_data[field].mean() if len(baseline_year_data) > 0 else None

    if baseline_avg and baseline_avg != 0:
        growth_pct = ((current_avg - baseline_avg) / baseline_avg) * 100
        trend_text = f"{growth_pct:+.1f}% change since 2000"
    else:
        trend_text = "Baseline data not available"

    continental_overview = {
        'current': f"Africa average: {current_avg:.2f} {unit} (2023)",
        'baseline': f"{baseline_avg:.2f} {unit} (2000)" if baseline_avg else "N/A",
        'trend': trend_text
    }

    print(f"\nContinental Overview:")
    print(f"  Current: {continental_overview['current']}")
    print(f"  Baseline: {continental_overview['baseline']}")
    print(f"  Trend: {continental_overview['trend']}")

    # 2. TARGET ACHIEVEMENT (if threshold exists)
    target_achievement = None
    if threshold:
        threshold_val = threshold['value']
        direction = threshold.get('direction', 'above')

        if direction == 'below':
            meets_target = current_year_data[current_year_data[field] <= threshold_val]
            not_meets_target = current_year_data[current_year_data[field] > threshold_val]
        else:
            meets_target = current_year_data[current_year_data[field] >= threshold_val]
            not_meets_target = current_year_data[current_year_data[field] < threshold_val]

        countries_met = len(meets_target)
        countries_not_met = len(not_meets_target)

        # Get country names meeting target
        countries_met_names = []
        for _, row in meets_target.head(5).iterrows():
            countries_met_names.append(f"{row['location']} ({row[field]:.2f})")

        # Calculate average gap for countries not meeting target
        if direction == 'below':
            gaps = not_meets_target[field] - threshold_val
        else:
            gaps = threshold_val - not_meets_target[field]

        avg_gap = gaps.mean() if len(gaps) > 0 else 0

        # Gap distribution
        if direction == 'below':
            close = len(not_meets_target[(not_meets_target[field] > threshold_val) &
                                        (not_meets_target[field] <= threshold_val * 1.2)])
            moderate = len(not_meets_target[(not_meets_target[field] > threshold_val * 1.2) &
                                           (not_meets_target[field] <= threshold_val * 1.5)])
            far = len(not_meets_target[not_meets_target[field] > threshold_val * 1.5])
        else:
            close = len(not_meets_target[(not_meets_target[field] < threshold_val) &
                                        (not_meets_target[field] >= threshold_val * 0.8)])
            moderate = len(not_meets_target[(not_meets_target[field] < threshold_val * 0.8) &
                                           (not_meets_target[field] >= threshold_val * 0.5)])
            far = len(not_meets_target[not_meets_target[field] < threshold_val * 0.5])

        target_achievement = {
            'targetDescription': f"Target threshold: {threshold_val} {unit}",
            'countriesMet': int(countries_met),
            'countriesMetNames': countries_met_names,
            'countriesNotMet': int(countries_not_met),
            'averageGap': f"{avg_gap:.2f} {unit} {'above' if direction == 'below' else 'below'} target",
            'gapDistribution': {
                'close': int(close),
                'moderate': int(moderate),
                'far': int(far)
            }
        }

        print(f"\nTarget Achievement:")
        print(f"  Countries meeting target: {countries_met}")
        print(f"  Countries not meeting target: {countries_not_met}")
        print(f"  Average gap: {avg_gap:.2f}")

    # 3. PROGRESS ANALYSIS
    recent_data = field_data[field_data['year'].between(2018, 2023)]

    # Group by country and calculate trend
    country_trends = {}
    for country in recent_data['location'].unique():
        country_data = recent_data[recent_data['location'] == country].sort_values('year')
        if len(country_data) >= 3:
            # Simple linear trend
            years = country_data['year'].values
            values = country_data[field].values
            if len(years) > 1:
                slope = np.polyfit(years, values, 1)[0]
                country_trends[country] = slope

    # Classify as improving/stagnating/worsening
    improving = sum(1 for slope in country_trends.values() if slope > 0.1)
    worsening = sum(1 for slope in country_trends.values() if slope < -0.1)
    stagnating = len(country_trends) - improving - worsening

    # Average annual change
    if len(recent_data) > 0:
        avg_2023 = recent_data[recent_data['year'] == 2023][field].mean()
        avg_2018 = recent_data[recent_data['year'] == 2018][field].mean()
        if avg_2018 and avg_2018 != 0:
            annual_change = ((avg_2023 - avg_2018) / avg_2018) / 5 * 100
            annual_change_text = f"{annual_change:+.1f}% average annually (2018-2023)"
        else:
            annual_change_text = "Insufficient data"
    else:
        annual_change_text = "No recent data"

    progress_analysis = {
        'improving': int(improving),
        'stagnating': int(stagnating),
        'worsening': int(worsening),
        'averageAnnualChange': annual_change_text,
        'recentTrend': f"Recent trends show {improving} countries improving, {stagnating} stagnating, and {worsening} worsening"
    }

    print(f"\nProgress Analysis:")
    print(f"  Improving: {improving}")
    print(f"  Stagnating: {stagnating}")
    print(f"  Worsening: {worsening}")

    # 4. EQUITY & DISTRIBUTION
    current_year_data_sorted = current_year_data.sort_values(field, ascending=False)

    top_performers = []
    for _, row in current_year_data_sorted.head(5).iterrows():
        top_performers.append({
            'country': row['location'],
            'value': f"{row[field]:.2f} {unit}"
        })

    bottom_performers = []
    for _, row in current_year_data_sorted.tail(5).iterrows():
        bottom_performers.append({
            'country': row['location'],
            'value': f"{row[field]:.2f} {unit}"
        })

    # Calculate Gini
    gini = calculate_gini(current_year_data[field].values)
    gini_text = f"{gini:.2f} ({'high' if gini > 0.4 else 'moderate' if gini > 0.3 else 'low'} inequality)" if gini else None

    equity = {
        'giniCoefficient': gini_text,
        'topPerformers': top_performers,
        'bottomPerformers': bottom_performers
    }

    print(f"\nEquity:")
    print(f"  Gini: {gini_text}")
    print(f"  Top performer: {top_performers[0]['country']}")
    print(f"  Bottom performer: {bottom_performers[0]['country']}")

    # 5. GEOGRAPHIC PATTERNS
    subregion_avgs = current_year_data.groupby('Subregion')[field].mean().sort_values(ascending=False)

    leading_region = subregion_avgs.index[0] if len(subregion_avgs) > 0 else "Unknown"
    lagging_region = subregion_avgs.index[-1] if len(subregion_avgs) > 0 else "Unknown"

    geographic_patterns = {
        'leadingRegion': f"{leading_region} leads with {subregion_avgs.iloc[0]:.2f} {unit}",
        'laggingRegion': f"{lagging_region} lags with {subregion_avgs.iloc[-1]:.2f} {unit}",
        'clustering': f"Significant variation across subregions: {subregion_avgs.iloc[0]:.2f} to {subregion_avgs.iloc[-1]:.2f} {unit}"
    }

    print(f"\nGeographic Patterns:")
    print(f"  Leading: {geographic_patterns['leadingRegion']}")
    print(f"  Lagging: {geographic_patterns['laggingRegion']}")

    # 6. POLICY INSIGHTS (generate based on data)
    policy_insights = []

    # Insight 1: Current status vs target
    if threshold:
        direction = threshold.get('direction', 'above')
        if countries_not_met > countries_met:
            policy_insights.append(
                f"Only {countries_met} of 54 African countries meet the {threshold['value']} {unit} target, indicating widespread challenges"
            )
        else:
            policy_insights.append(
                f"{countries_met} African countries have achieved the {threshold['value']} {unit} target"
            )
    else:
        policy_insights.append(
            f"Continental average of {current_avg:.2f} {unit} shows current performance levels"
        )

    # Insight 2: Progress trend
    if improving > worsening:
        policy_insights.append(
            f"Positive momentum: {improving} countries showing improvement vs {worsening} worsening"
        )
    elif worsening > improving:
        policy_insights.append(
            f"Concerning trend: {worsening} countries worsening vs only {improving} improving"
        )
    else:
        policy_insights.append(
            f"Mixed progress: {improving} improving, {worsening} worsening, and {stagnating} stagnating"
        )

    # Insight 3: Inequality
    if gini and gini > 0.4:
        policy_insights.append(
            f"High inequality persists: top performers at {top_performers[0]['value']} vs bottom at {bottom_performers[0]['value']}"
        )

    # Insight 4: Regional patterns
    if len(subregion_avgs) > 0:
        ratio = subregion_avgs.iloc[0] / subregion_avgs.iloc[-1] if subregion_avgs.iloc[-1] != 0 else 0
        if ratio > 2:
            policy_insights.append(
                f"Stark regional disparities: {leading_region} outperforms {lagging_region} by {ratio:.1f}x"
            )

    # Insight 5: Specific to indicator
    if 'mortality' in field.lower():
        policy_insights.append(
            "Improving health financing and service delivery are critical to reducing mortality rates"
        )
    elif 'out-of-pocket' in field.lower():
        policy_insights.append(
            "High out-of-pocket spending indicates weak financial protection and risk of catastrophic expenditure"
        )
    elif 'external' in field.lower():
        policy_insights.append(
            "High external dependency creates sustainability risks; domestic resource mobilization is essential"
        )
    elif 'coverage' in field.lower():
        policy_insights.append(
            "Expanding service coverage requires both infrastructure investment and financial protection mechanisms"
        )

    enhanced_analytics = {
        'continentalOverview': continental_overview,
        'targetAchievement': target_achievement,
        'progressAnalysis': progress_analysis,
        'equity': equity,
        'geographicPatterns': geographic_patterns,
        'policyInsights': policy_insights[:5]  # Limit to 5 insights
    }

    return enhanced_analytics

# Analyze all charts
results = {}
for chart in charts_config:
    result = analyze_chart(chart)
    if result:
        results[chart['slug']] = result

# Save results to JSON file
output_path = Path(r"C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\enhanced_analytics_results.json")
with open(output_path, 'w') as f:
    json.dump(results, f, indent=2)

print(f"\n{'='*80}")
print(f"Analysis complete! Results saved to: {output_path}")
print(f"{'='*80}")
