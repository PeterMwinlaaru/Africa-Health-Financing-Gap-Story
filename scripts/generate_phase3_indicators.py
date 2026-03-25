"""
Generate Phase 3 Indicators - Missing Chart Configurations
===========================================================
Creates new data files for Phase 3 indicators that need data pipelines.
"""

import pandas as pd
import numpy as np
import json
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'processed_data')
MASTER_FILE = os.path.join(DATA_DIR, 'master_dataset.csv')

# Thresholds
GOV_HEALTH_GDP_TARGET = 5  # 5% of GDP

def load_master_data():
    """Load the master dataset."""
    df = pd.read_csv(MASTER_FILE)
    # Filter for 2000-2023
    df = df[(df['year'] >= 2000) & (df['year'] <= 2023)]
    df = df[df['location'].notna()]
    # Recode 'High' income to 'Upper-middle' (only Seychelles)
    df['income'] = df['income'].replace('High', 'Upper-middle')
    return df

def count_by_condition_aggregated(df, condition_series, group_by=['year', 'income']):
    """
    Count countries meeting a condition and aggregate by group.
    Returns data in format: year, income/Subregion, count
    """
    temp_df = df.copy()
    temp_df['condition_met'] = condition_series

    # Group and count
    result = temp_df.groupby(group_by).agg({
        'condition_met': lambda x: x.sum()
    }).reset_index()

    # Rename condition_met to a more specific name based on context
    return result

def generate_gov_health_gdp_above_5pct():
    """
    Indicator 3.4a: Countries with Government health expenditure > 5% of GDP
    """
    print("Generating 3.4a: Countries with Gov health exp > 5% GDP...")

    df = load_master_data()

    # Create condition: Gov exp Health on GDP > 5
    condition = (df['Gov exp Health on GDP'] > GOV_HEALTH_GDP_TARGET).astype(float)
    condition[df['Gov exp Health on GDP'].isna()] = np.nan

    # Aggregate by year and income
    result_income = count_by_condition_aggregated(df, condition, ['year', 'income'])
    result_income.columns = ['year', 'income', 'countries_gov_gdp_above_5pct']

    # Aggregate by year and subregion
    result_subregion = count_by_condition_aggregated(df, condition, ['year', 'Subregion'])
    result_subregion.columns = ['year', 'Subregion', 'countries_gov_gdp_above_5pct']

    # Combine both
    result = []
    for _, row in result_income.iterrows():
        result.append({
            'year': int(row['year']),
            'income': row['income'],
            'countries_gov_gdp_above_5pct': float(row['countries_gov_gdp_above_5pct']) if pd.notna(row['countries_gov_gdp_above_5pct']) else None
        })

    for _, row in result_subregion.iterrows():
        result.append({
            'year': int(row['year']),
            'Subregion': row['Subregion'],
            'countries_gov_gdp_above_5pct': float(row['countries_gov_gdp_above_5pct']) if pd.notna(row['countries_gov_gdp_above_5pct']) else None
        })

    # Save to JSON
    output_dir = os.path.join(DATA_DIR, 'fiscal_space')
    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(output_dir, 'countries_gov_gdp_above_5pct.json')
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)

    # Also save CSV
    csv_file = os.path.join(output_dir, 'countries_gov_gdp_above_5pct.csv')
    pd.DataFrame(result).to_csv(csv_file, index=False)

    print(f"  [OK] Saved {output_file}")
    print(f"  [OK] Saved {csv_file}")
    print(f"  Generated {len(result)} records")

    return result

def generate_structure_uhc_crosstabs():
    """
    Indicators 3.9.3-3.9.5: Structure × UHC cross-tabulations
    - 3.9.3: Voluntary prepaid highest + UHC cross-tab
    - 3.9.4: OOP highest + UHC cross-tab
    - 3.9.5: Other private highest + UHC cross-tab
    - 3.9.6: External highest + UHC cross-tab
    """
    print("\nGenerating 3.9.3-3.9.6: Structure × UHC cross-tabs...")

    df = load_master_data()

    # Compute UHC percentiles per year
    for year in df['year'].unique():
        year_data = df[df['year'] == year]['Universal health coverage'].dropna()
        if len(year_data) > 0:
            p50 = year_data.quantile(0.50)
            p75 = year_data.quantile(0.75)
            mask = df['year'] == year
            df.loc[mask, 'uhc_above_p50'] = (df.loc[mask, 'Universal health coverage'] > p50).astype(float)
            df.loc[mask, 'uhc_above_p75'] = (df.loc[mask, 'Universal health coverage'] > p75).astype(float)
            df.loc[mask & df['Universal health coverage'].isna(), 'uhc_above_p50'] = np.nan
            df.loc[mask & df['Universal health coverage'].isna(), 'uhc_above_p75'] = np.nan

    # Identify dominant financing source
    financing_cols = ['Govern on health exp', 'Voluntary Prepayments on health exp',
                      'Out-of-pocket on health exp', 'Other Private on health exp',
                      'External on health exp']

    def get_dominant_source(row):
        values = {col: row[col] for col in financing_cols if pd.notna(row.get(col))}
        if not values:
            return np.nan
        return max(values, key=values.get)

    df['dominant_source'] = df.apply(get_dominant_source, axis=1)

    # Create binary indicators for each dominant source
    df['voluntary_dominant'] = (df['dominant_source'] == 'Voluntary Prepayments on health exp').astype(float)
    df['oop_dominant'] = (df['dominant_source'] == 'Out-of-pocket on health exp').astype(float)
    df['other_private_dominant'] = (df['dominant_source'] == 'Other Private on health exp').astype(float)
    df['external_dominant'] = (df['dominant_source'] == 'External on health exp').astype(float)

    # Calculate cross-tabulations for each source
    sources = {
        'voluntary': 'voluntary_dominant',
        'oop': 'oop_dominant',
        'other_private': 'other_private_dominant',
        'external': 'external_dominant'
    }

    all_results = []

    for source_name, source_col in sources.items():
        # Group by year and income
        for (year, income), group in df.groupby(['year', 'income']):
            valid = group[[source_col, 'uhc_above_p50', 'uhc_above_p75']].dropna()
            if len(valid) == 0:
                continue

            # Calculate percentages
            dominant_and_uhc50 = ((valid[source_col] == 1) & (valid['uhc_above_p50'] == 1)).sum()
            dominant_and_uhc75 = ((valid[source_col] == 1) & (valid['uhc_above_p75'] == 1)).sum()
            total_dominant = (valid[source_col] == 1).sum()

            pct_uhc50 = (dominant_and_uhc50 / total_dominant * 100) if total_dominant > 0 else None
            pct_uhc75 = (dominant_and_uhc75 / total_dominant * 100) if total_dominant > 0 else None

            all_results.append({
                'year': int(year),
                'income': income,
                f'pct_{source_name}_dominant_uhc50': pct_uhc50,
                f'pct_{source_name}_dominant_uhc75': pct_uhc75
            })

    # Save combined structure_uhc file (update existing one)
    output_dir = os.path.join(DATA_DIR, 'cross_dimensional')
    output_file = os.path.join(output_dir, 'structure_uhc_extended.json')

    with open(output_file, 'w') as f:
        json.dump(all_results, f, indent=2)

    csv_file = os.path.join(output_dir, 'structure_uhc_extended.csv')
    pd.DataFrame(all_results).to_csv(csv_file, index=False)

    print(f"  [OK] Saved {output_file}")
    print(f"  [OK] Saved {csv_file}")
    print(f"  Generated {len(all_results)} records")

    return all_results

def generate_structure_outcomes_crosstabs():
    """
    Indicators 3.10.3-3.10.10: Structure × Outcomes cross-tabulations
    For NMR and MMR across different dominant financing sources
    """
    print("\nGenerating 3.10.3-3.10.10: Structure × Outcomes cross-tabs...")

    df = load_master_data()

    # Create on-course indicators
    df['nmr_on_course'] = (df['Neonatal mortality rate'] <= 12).astype(float)
    df.loc[df['Neonatal mortality rate'].isna(), 'nmr_on_course'] = np.nan

    df['mmr_on_course'] = (df['Maternal mortality ratio'] < 70).astype(float)
    df.loc[df['Maternal mortality ratio'].isna(), 'mmr_on_course'] = np.nan

    # Identify dominant financing source
    financing_cols = ['Govern on health exp', 'Voluntary Prepayments on health exp',
                      'Out-of-pocket on health exp', 'Other Private on health exp',
                      'External on health exp']

    def get_dominant_source(row):
        values = {col: row[col] for col in financing_cols if pd.notna(row.get(col))}
        if not values:
            return np.nan
        return max(values, key=values.get)

    df['dominant_source'] = df.apply(get_dominant_source, axis=1)

    # Create binary indicators
    df['voluntary_dominant'] = (df['dominant_source'] == 'Voluntary Prepayments on health exp').astype(float)
    df['oop_dominant'] = (df['dominant_source'] == 'Out-of-pocket on health exp').astype(float)
    df['other_private_dominant'] = (df['dominant_source'] == 'Other Private on health exp').astype(float)
    df['external_dominant'] = (df['dominant_source'] == 'External on health exp').astype(float)

    sources = {
        'voluntary': 'voluntary_dominant',
        'oop': 'oop_dominant',
        'other_private': 'other_private_dominant',
        'external': 'external_dominant'
    }

    all_results = []

    for source_name, source_col in sources.items():
        # Group by year and income
        for (year, income), group in df.groupby(['year', 'income']):
            valid_nmr = group[[source_col, 'nmr_on_course']].dropna()
            valid_mmr = group[[source_col, 'mmr_on_course']].dropna()

            # NMR calculations
            if len(valid_nmr) > 0:
                dominant_and_nmr = ((valid_nmr[source_col] == 1) & (valid_nmr['nmr_on_course'] == 1)).sum()
                total_dominant_nmr = (valid_nmr[source_col] == 1).sum()
                pct_nmr = (dominant_and_nmr / total_dominant_nmr * 100) if total_dominant_nmr > 0 else None
            else:
                pct_nmr = None

            # MMR calculations
            if len(valid_mmr) > 0:
                dominant_and_mmr = ((valid_mmr[source_col] == 1) & (valid_mmr['mmr_on_course'] == 1)).sum()
                total_dominant_mmr = (valid_mmr[source_col] == 1).sum()
                pct_mmr = (dominant_and_mmr / total_dominant_mmr * 100) if total_dominant_mmr > 0 else None
            else:
                pct_mmr = None

            all_results.append({
                'year': int(year),
                'income': income,
                f'pct_{source_name}_dominant_nmr': pct_nmr,
                f'pct_{source_name}_dominant_mmr': pct_mmr
            })

    # Save combined structure_outcomes file (update existing one)
    output_dir = os.path.join(DATA_DIR, 'cross_dimensional')
    output_file = os.path.join(output_dir, 'structure_outcomes_extended.json')

    with open(output_file, 'w') as f:
        json.dump(all_results, f, indent=2)

    csv_file = os.path.join(output_dir, 'structure_outcomes_extended.csv')
    pd.DataFrame(all_results).to_csv(csv_file, index=False)

    print(f"  [OK] Saved {output_file}")
    print(f"  [OK] Saved {csv_file}")
    print(f"  Generated {len(all_results)} records")

    return all_results

def main():
    """Main execution function."""
    print("=" * 60)
    print("Phase 3 Indicators Generation")
    print("=" * 60)
    print()

    try:
        # Generate all Phase 3 indicators
        generate_gov_health_gdp_above_5pct()
        generate_structure_uhc_crosstabs()
        generate_structure_outcomes_crosstabs()

        print("\n" + "=" * 60)
        print("[SUCCESS] All Phase 3 indicators generated successfully!")
        print("=" * 60)

    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
