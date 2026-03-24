"""
Health Financing API Server
============================
Flask server with computed aggregate indicators based on indicator definitions.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask.json.provider import DefaultJSONProvider
import json
import os
import math
import numpy as np
from collections import defaultdict

# Custom JSON provider to handle NaN and Infinity values
class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, float):
            if math.isnan(obj) or math.isinf(obj):
                return None
        return super().default(obj)

    def dumps(self, obj, **kwargs):
        # Replace NaN/Inf with None before serializing
        def clean_value(v):
            if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                return None
            elif isinstance(v, dict):
                return {k: clean_value(val) for k, val in v.items()}
            elif isinstance(v, list):
                return [clean_value(item) for item in v]
            return v

        cleaned = clean_value(obj)
        return super().dumps(cleaned, **kwargs)

app = Flask(__name__)
app.json = CustomJSONProvider(app)
CORS(app)

# Data directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'processed_data')

# Cache
_cache = {}

# Thresholds from indicator definitions (based on Statistical Product for Health Financing Gap.docx)
THRESHOLDS = {
    'LIC_HEALTH_EXP_PC': 112,       # Low-income countries threshold (USD)
    'LMIC_HEALTH_EXP_PC': 146,      # Lower-middle-income threshold (USD)
    'UMIC_HEALTH_EXP_PC': 477,      # Upper-middle-income threshold (USD)
    'ABUJA_BUDGET_SHARE': 15,       # Abuja Declaration target (%)
    'OOP_BENCHMARK': 20,            # OOP should be below 20%
    'GOV_DOMINANT_SHARE': 50,       # Government share dominant threshold (%)
    'UHC_TARGET': 75,               # Universal Health Coverage target (index score)
    'NMR_TARGET': 12,               # Neonatal mortality target per 1000 live births
    'MMR_TARGET': 70,               # Maternal mortality target per 100,000 live births
}

def load_json(filepath):
    """Load JSON file with caching."""
    if filepath not in _cache:
        with open(filepath, 'r', encoding='utf-8') as f:
            _cache[filepath] = json.load(f)
    return _cache[filepath]

def get_master_data():
    """Load master dataset filtered to 2000-2024 with valid location."""
    all_data = load_json(os.path.join(DATA_DIR, 'master_dataset.json'))
    # Filter to 2000-2024 range AND exclude rows without a valid country/location
    return [d for d in all_data if 2000 <= d.get('year', 0) <= 2024 and d.get('location')]

def clear_cache():
    """Clear the data cache to reload fresh data."""
    global _cache
    _cache = {}

def get_metadata():
    """Load metadata."""
    return load_json(os.path.join(DATA_DIR, 'metadata.json'))

def calculate_gini(values):
    """Calculate Gini coefficient for a list of values."""
    values = [v for v in values if v is not None and not np.isnan(v)]
    if len(values) < 2:
        return None
    values = np.array(sorted(values))
    n = len(values)
    index = np.arange(1, n + 1)
    return ((2 * np.sum(index * values)) / (n * np.sum(values))) - (n + 1) / n

def get_threshold_for_income(income):
    """Get health expenditure threshold based on income category."""
    if income == 'Low':
        return THRESHOLDS['LIC_HEALTH_EXP_PC']
    elif income == 'Lower-middle':
        return THRESHOLDS['LMIC_HEALTH_EXP_PC']
    elif income == 'Upper-middle':
        return THRESHOLDS['UMIC_HEALTH_EXP_PC']
    return THRESHOLDS['LMIC_HEALTH_EXP_PC']  # Default

def safe_mean(values):
    """Calculate mean, handling None and NaN values."""
    clean = [v for v in values if v is not None and not np.isnan(v)]
    return np.mean(clean) if clean else None

def safe_sum(values):
    """Calculate sum, handling None and NaN values."""
    clean = [v for v in values if v is not None and not np.isnan(v)]
    return sum(clean) if clean else 0

# ============================================================================
# COMPUTED INDICATOR ENDPOINTS
# ============================================================================

@app.route('/api/indicators/computed/countries-below-threshold', methods=['GET'])
def countries_below_threshold():
    """
    3.1.1: Number of countries with gov health exp per capita below threshold
    by year and income group.
    """
    data = get_master_data()

    # Group by year
    by_year = defaultdict(lambda: {'total': 0, 'below': 0, 'by_income': defaultdict(lambda: {'total': 0, 'below': 0})})

    for d in data:
        year = d.get('year')
        income = d.get('income')
        exp_pc = d.get('Gov exp Health per capita')

        if year and income and exp_pc is not None:
            threshold = get_threshold_for_income(income)
            by_year[year]['total'] += 1
            by_year[year]['by_income'][income]['total'] += 1

            if exp_pc < threshold:
                by_year[year]['below'] += 1
                by_year[year]['by_income'][income]['below'] += 1

    result = []
    for year in sorted(by_year.keys()):
        item = {
            'year': year,
            'countries_below': by_year[year]['below'],
            'total_countries': by_year[year]['total'],
            'pct_below': round(by_year[year]['below'] / by_year[year]['total'] * 100, 1) if by_year[year]['total'] > 0 else 0
        }
        # Add by income breakdown
        for income, counts in by_year[year]['by_income'].items():
            safe_income = income.replace('-', '_').replace(' ', '_')
            item[f'{safe_income}_below'] = counts['below']
            item[f'{safe_income}_total'] = counts['total']
        result.append(item)

    return jsonify(result)

@app.route('/api/indicators/computed/average-financing-gap', methods=['GET'])
def average_financing_gap():
    """
    3.1.2: Average public health financing gap by year and income group.
    """
    data = get_master_data()

    by_year = defaultdict(lambda: defaultdict(list))

    for d in data:
        year = d.get('year')
        income = d.get('income')
        gap = d.get('Gap for Gov exp Health per capita')

        if year and income and gap is not None and gap > 0:
            by_year[year]['all'].append(gap)
            by_year[year][income].append(gap)

    result = []
    for year in sorted(by_year.keys()):
        item = {
            'year': year,
            'avg_gap': round(safe_mean(by_year[year]['all']), 2) if by_year[year]['all'] else None,
            'total_gap_bn': round(safe_sum(by_year[year]['all']) / 1000, 2)  # In billions
        }
        for income in ['Low', 'Lower-middle', 'Upper-middle']:
            if by_year[year][income]:
                safe_income = income.replace('-', '_').replace(' ', '_')
                item[f'{safe_income}_avg_gap'] = round(safe_mean(by_year[year][income]), 2)
        result.append(item)

    return jsonify(result)

@app.route('/api/indicators/computed/health-exp-gini', methods=['GET'])
def health_exp_gini():
    """
    3.1.3: Gini coefficient for health expenditure inequality by year.
    """
    data = get_master_data()

    by_year = defaultdict(list)

    for d in data:
        year = d.get('year')
        exp_pc = d.get('Gov exp Health per capita')

        if year and exp_pc is not None:
            by_year[year].append(exp_pc)

    result = []
    for year in sorted(by_year.keys()):
        values = by_year[year]
        clean_values = [v for v in values if v is not None and not np.isnan(v)]

        if clean_values:
            result.append({
                'year': year,
                'gini': round(calculate_gini(clean_values), 4) if len(clean_values) > 1 else None,
                'min': round(min(clean_values), 2),
                'max': round(max(clean_values), 2),
                'range': round(max(clean_values) - min(clean_values), 2)
            })

    return jsonify(result)

@app.route('/api/indicators/computed/abuja-compliance', methods=['GET'])
def abuja_compliance():
    """
    3.2.1: Number of countries meeting Abuja Declaration target (15% of budget).
    """
    data = get_master_data()

    by_year = defaultdict(lambda: {'total': 0, 'meeting': 0, 'by_income': defaultdict(lambda: {'total': 0, 'meeting': 0})})

    for d in data:
        year = d.get('year')
        income = d.get('income')
        budget_share = d.get('Gov exp Health on budget')

        if year and income and budget_share is not None:
            by_year[year]['total'] += 1
            by_year[year]['by_income'][income]['total'] += 1

            if budget_share >= THRESHOLDS['ABUJA_BUDGET_SHARE']:
                by_year[year]['meeting'] += 1
                by_year[year]['by_income'][income]['meeting'] += 1

    result = []
    for year in sorted(by_year.keys()):
        item = {
            'year': year,
            'countries_meeting': by_year[year]['meeting'],
            'countries_below': by_year[year]['total'] - by_year[year]['meeting'],
            'total_countries': by_year[year]['total'],
            'pct_meeting': round(by_year[year]['meeting'] / by_year[year]['total'] * 100, 1) if by_year[year]['total'] > 0 else 0
        }
        result.append(item)

    return jsonify(result)

@app.route('/api/indicators/computed/oop-protection', methods=['GET'])
def oop_protection():
    """
    3.4.1: Number of countries with OOP below 20% benchmark.
    """
    data = get_master_data()

    by_year = defaultdict(lambda: {'total': 0, 'protected': 0})

    for d in data:
        year = d.get('year')
        oop = d.get('Out-of-pocket on health exp')

        if year and oop is not None:
            by_year[year]['total'] += 1
            if oop <= THRESHOLDS['OOP_BENCHMARK']:
                by_year[year]['protected'] += 1

    result = []
    for year in sorted(by_year.keys()):
        item = {
            'year': year,
            'countries_protected': by_year[year]['protected'],
            'countries_exposed': by_year[year]['total'] - by_year[year]['protected'],
            'total_countries': by_year[year]['total'],
            'pct_protected': round(by_year[year]['protected'] / by_year[year]['total'] * 100, 1) if by_year[year]['total'] > 0 else 0
        }
        result.append(item)

    return jsonify(result)

@app.route('/api/indicators/computed/financing-structure', methods=['GET'])
def financing_structure():
    """
    3.5: Health financing structure - average shares by source and year.
    """
    data = get_master_data()

    by_year = defaultdict(lambda: {
        'government': [], 'oop': [], 'external': [],
        'private': [], 'voluntary': []
    })

    for d in data:
        year = d.get('year')
        if year:
            if d.get('Govern on health exp') is not None:
                by_year[year]['government'].append(d['Govern on health exp'])
            if d.get('Out-of-pocket on health exp') is not None:
                by_year[year]['oop'].append(d['Out-of-pocket on health exp'])
            if d.get('External on health exp') is not None:
                by_year[year]['external'].append(d['External on health exp'])
            if d.get('Domest Private on health exp') is not None:
                by_year[year]['private'].append(d['Domest Private on health exp'])
            if d.get('Voluntary Prepayments on health exp') is not None:
                by_year[year]['voluntary'].append(d['Voluntary Prepayments on health exp'])

    result = []
    for year in sorted(by_year.keys()):
        result.append({
            'year': year,
            'avg_government': round(safe_mean(by_year[year]['government']), 2),
            'avg_oop': round(safe_mean(by_year[year]['oop']), 2),
            'avg_external': round(safe_mean(by_year[year]['external']), 2),
            'avg_private': round(safe_mean(by_year[year]['private']), 2),
            'avg_voluntary': round(safe_mean(by_year[year]['voluntary']), 2)
        })

    return jsonify(result)

@app.route('/api/indicators/computed/uhc-progress', methods=['GET'])
def uhc_progress():
    """
    3.8: UHC index progress by year.
    """
    data = get_master_data()

    by_year = defaultdict(lambda: {'values': [], 'above_50': 0, 'above_target': 0, 'total': 0})

    for d in data:
        year = d.get('year')
        uhc = d.get('Universal health coverage')

        if year and uhc is not None:
            by_year[year]['values'].append(uhc)
            by_year[year]['total'] += 1
            if uhc >= 50:
                by_year[year]['above_50'] += 1
            if uhc >= THRESHOLDS['UHC_TARGET']:
                by_year[year]['above_target'] += 1

    result = []
    for year in sorted(by_year.keys()):
        values = by_year[year]['values']
        result.append({
            'year': year,
            'avg_uhc': round(safe_mean(values), 2),
            'countries_above_50': by_year[year]['above_50'],
            'countries_above_target': by_year[year]['above_target'],
            'total_countries': by_year[year]['total']
        })

    return jsonify(result)

@app.route('/api/indicators/computed/mortality-trends', methods=['GET'])
def mortality_trends():
    """
    3.9 & 3.10: Neonatal and maternal mortality trends.
    """
    data = get_master_data()

    by_year = defaultdict(lambda: {
        'imr': [], 'mmr': [],
        'imr_on_track': 0, 'mmr_on_track': 0, 'total': 0
    })

    for d in data:
        year = d.get('year')
        imr = d.get('Neonatal mortality rate')
        mmr = d.get('Maternal mortality ratio')

        if year:
            by_year[year]['total'] += 1
            if imr is not None:
                by_year[year]['imr'].append(imr)
                if imr <= THRESHOLDS['NMR_TARGET']:
                    by_year[year]['imr_on_track'] += 1
            if mmr is not None:
                by_year[year]['mmr'].append(mmr)
                if mmr <= THRESHOLDS['MMR_TARGET']:
                    by_year[year]['mmr_on_track'] += 1

    result = []
    for year in sorted(by_year.keys()):
        result.append({
            'year': year,
            'avg_imr': round(safe_mean(by_year[year]['imr']), 2),
            'avg_mmr': round(safe_mean(by_year[year]['mmr']), 2),
            'countries_imr_on_track': by_year[year]['imr_on_track'],
            'countries_mmr_on_track': by_year[year]['mmr_on_track'],
            'total_countries': by_year[year]['total']
        })

    return jsonify(result)

@app.route('/api/indicators/computed/fiscal-space', methods=['GET'])
def fiscal_space():
    """
    3.7: Tax revenue and fiscal space indicators.
    """
    data = get_master_data()

    by_year = defaultdict(lambda: {'tax_revenue': [], 'total_revenue': [], 'gdp_share': []})

    for d in data:
        year = d.get('year')
        if year:
            if d.get('Tax Revenue per GDP') is not None:
                by_year[year]['tax_revenue'].append(d['Tax Revenue per GDP'])
            if d.get('Total Revenue per GDP') is not None:
                by_year[year]['total_revenue'].append(d['Total Revenue per GDP'])
            if d.get('Gov exp Health on GDP') is not None:
                by_year[year]['gdp_share'].append(d['Gov exp Health on GDP'])

    result = []
    for year in sorted(by_year.keys()):
        result.append({
            'year': year,
            'avg_tax_revenue': round(safe_mean(by_year[year]['tax_revenue']), 2),
            'avg_total_revenue': round(safe_mean(by_year[year]['total_revenue']), 2),
            'avg_health_gdp_share': round(safe_mean(by_year[year]['gdp_share']), 2)
        })

    return jsonify(result)

# ============================================================================
# AGGREGATED BY GROUP ENDPOINTS (for charts)
# ============================================================================

@app.route('/api/aggregate/by-year', methods=['GET'])
def aggregate_by_year():
    """Get aggregate statistics by year for charting.

    Optional parameters:
    - field: The data field to aggregate (default: 'Gov exp Health per capita')
    - groupBy: 'income' or 'subregion' for disaggregated data
    """
    data = get_master_data()
    field = request.args.get('field', 'Gov exp Health per capita')
    group_by = request.args.get('groupBy')  # 'income' or 'subregion'

    if group_by == 'income':
        # Group by year and income
        by_year_group = defaultdict(lambda: defaultdict(list))
        for d in data:
            year = d.get('year')
            group = d.get('income')
            value = d.get(field)
            if year and group and value is not None:
                try:
                    if isinstance(value, (int, float)) and not np.isnan(value):
                        by_year_group[year][group].append(float(value))
                except (TypeError, ValueError):
                    pass

        result = []
        for year in sorted(by_year_group.keys()):
            item = {'year': year}
            for group, values in by_year_group[year].items():
                if values:
                    safe_key = group.replace('-', '_').replace(' ', '_')
                    item[safe_key] = round(np.mean(values), 2)
            result.append(item)
        return jsonify(result)

    elif group_by == 'subregion':
        # Group by year and subregion
        by_year_group = defaultdict(lambda: defaultdict(list))
        for d in data:
            year = d.get('year')
            group = d.get('Subregion')
            value = d.get(field)
            if year and group and value is not None:
                try:
                    if isinstance(value, (int, float)) and not np.isnan(value):
                        by_year_group[year][group].append(float(value))
                except (TypeError, ValueError):
                    pass

        result = []
        for year in sorted(by_year_group.keys()):
            item = {'year': year}
            for group, values in by_year_group[year].items():
                if values:
                    safe_key = group.replace(' ', '_').replace('-', '_')
                    item[safe_key] = round(np.mean(values), 2)
            result.append(item)
        return jsonify(result)

    else:
        # Default: overall average by year
        by_year = defaultdict(list)
        for d in data:
            year = d.get('year')
            value = d.get(field)
            if year and value is not None:
                try:
                    if isinstance(value, (int, float)) and not np.isnan(value):
                        by_year[year].append(float(value))
                except (TypeError, ValueError):
                    pass

        result = []
        for year in sorted(by_year.keys()):
            values = by_year[year]
            if values:
                result.append({
                    'year': year,
                    'value': round(np.mean(values), 2),
                    'min': round(min(values), 2),
                    'max': round(max(values), 2),
                    'count': len(values)
                })

        return jsonify(result)

@app.route('/api/aggregate/by-country', methods=['GET'])
def aggregate_by_country():
    """Get latest values by country for bar charts."""
    data = get_master_data()
    field = request.args.get('field', 'Gov exp Health per capita')
    year = request.args.get('year')

    # Get latest year with data for this field if not specified
    if not year:
        years_with_data = set()
        for d in data:
            if d.get('year') and d.get(field) is not None:
                try:
                    if not np.isnan(d.get(field)):
                        years_with_data.add(d.get('year'))
                except:
                    years_with_data.add(d.get('year'))
        year = max(years_with_data) if years_with_data else 2022
    else:
        year = int(year)

    result = []
    for d in data:
        if d.get('year') == year and d.get('location'):
            value = d.get(field)
            if value is not None:
                try:
                    if not np.isnan(value):
                        result.append({
                            'name': d['location'],
                            'value': round(value, 2),
                            'income': d.get('income'),
                            'subregion': d.get('Subregion')
                        })
                except:
                    result.append({
                        'name': d['location'],
                        'value': round(value, 2),
                        'income': d.get('income'),
                        'subregion': d.get('Subregion')
                    })

    # Sort by value descending
    result.sort(key=lambda x: x['value'], reverse=True)

    return jsonify(result)

@app.route('/api/aggregate/by-income', methods=['GET'])
def aggregate_by_income():
    """Get aggregate statistics by income group and year."""
    data = get_master_data()
    field = request.args.get('field', 'Gov exp Health per capita')

    by_year_income = defaultdict(lambda: defaultdict(list))

    for d in data:
        year = d.get('year')
        income = d.get('income')
        value = d.get(field)

        if year and income and value is not None and not np.isnan(value):
            by_year_income[year][income].append(value)

    result = []
    for year in sorted(by_year_income.keys()):
        item = {'year': year}
        for income, values in by_year_income[year].items():
            safe_income = income.replace('-', '_').replace(' ', '_')
            item[safe_income] = round(np.mean(values), 2)
        result.append(item)

    return jsonify(result)

# ============================================================================
# ORIGINAL ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'message': 'Health Financing API is running'})

@app.route('/api/reload', methods=['POST', 'GET'])
def reload_data():
    """Clear cache and reload data."""
    clear_cache()
    # Trigger data reload
    data = get_master_data()
    return jsonify({
        'status': 'success',
        'message': 'Data cache cleared and reloaded',
        'total_records': len(data),
        'unique_countries': len(set(d.get('location') for d in data if d.get('location')))
    })

@app.route('/api/metadata', methods=['GET'])
def metadata():
    """Get metadata about the dataset."""
    return jsonify(get_metadata())

@app.route('/api/data/master', methods=['GET'])
def master_data():
    """Get master dataset with optional filters."""
    data = get_master_data()

    year = request.args.get('year')
    country = request.args.get('country')
    income = request.args.get('income')
    subregion = request.args.get('subregion')

    filtered = data

    if year:
        years = [int(y) for y in year.split(',')]
        filtered = [d for d in filtered if d.get('year') in years]

    if country:
        countries = country.split(',')
        filtered = [d for d in filtered if d.get('location') in countries]

    if income:
        incomes = income.split(',')
        filtered = [d for d in filtered if d.get('income') in incomes]

    if subregion:
        subregions = subregion.split(',')
        filtered = [d for d in filtered if d.get('Subregion') in subregions]

    return jsonify(filtered)

@app.route('/api/countries', methods=['GET'])
def countries():
    """Get list of all countries."""
    data = get_master_data()
    country_list = sorted(list(set(d.get('location') for d in data if d.get('location'))))
    return jsonify(country_list)

@app.route('/api/years', methods=['GET'])
def years():
    """Get year range."""
    data = get_master_data()
    all_years = [d.get('year') for d in data if d.get('year')]
    return jsonify([min(all_years), max(all_years)])

@app.route('/api/thresholds', methods=['GET'])
def thresholds():
    """Get all threshold values used in indicators."""
    return jsonify(THRESHOLDS)

@app.route('/api/data-coverage', methods=['GET'])
def data_coverage():
    """Get data coverage statistics - countries per year and indicator."""
    data = get_master_data()

    # Count unique countries per year
    by_year = defaultdict(set)
    for d in data:
        year = d.get('year')
        location = d.get('location')
        if year and location:
            by_year[year].add(location)

    coverage = []
    for year in sorted(by_year.keys()):
        coverage.append({
            'year': year,
            'country_count': len(by_year[year])
        })

    # Total unique countries
    all_countries = set()
    for d in data:
        if d.get('location'):
            all_countries.add(d['location'])

    return jsonify({
        'total_unique_countries': len(all_countries),
        'coverage_by_year': coverage,
        'countries': sorted(list(all_countries))
    })

if __name__ == '__main__':
    print("Starting Health Financing API Server...")
    print(f"Data directory: {DATA_DIR}")
    print("Server running at http://localhost:5000")
    print("\nComputed indicator endpoints:")
    print("  /api/indicators/computed/countries-below-threshold")
    print("  /api/indicators/computed/average-financing-gap")
    print("  /api/indicators/computed/health-exp-gini")
    print("  /api/indicators/computed/abuja-compliance")
    print("  /api/indicators/computed/oop-protection")
    print("  /api/indicators/computed/financing-structure")
    print("  /api/indicators/computed/uhc-progress")
    print("  /api/indicators/computed/mortality-trends")
    print("  /api/indicators/computed/fiscal-space")
    print("\nAggregate endpoints:")
    print("  /api/aggregate/by-year?field=<field_name>")
    print("  /api/aggregate/by-country?field=<field_name>")
    print("  /api/aggregate/by-income?field=<field_name>")
    app.run(host='0.0.0.0', port=5000, debug=True)
