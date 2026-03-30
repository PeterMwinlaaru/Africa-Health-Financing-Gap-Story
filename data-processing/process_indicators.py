"""
Health Financing Gap Data Processing Pipeline
==============================================
This script processes raw health financing data and calculates all derived indicators
according to the Statistical Product specification.

Author: Health Financing Gap Analysis Team
Date: March 2026
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
from typing import Dict, List, Tuple

# Define thresholds based on specification
THRESHOLDS = {
    'gov_exp_health_per_capita': {
        'Low': 112,
        'Lower-middle': 146,
        'Upper-middle': 477,
        'High': 477  # Using UMIC threshold for High income
    },
    'abuja_target': 15,  # % of government budget
    'oop_benchmark': 20,  # % of current health expenditure
    'uhc_percentiles': [50, 75],
    'gov_share_dominant': 50  # % of health expenditure
}

class HealthFinancingProcessor:
    """Process and calculate health financing indicators"""

    def __init__(self, data_path: str):
        """Initialize with path to raw data"""
        self.data_path = Path(data_path)
        self.df = None
        self.indicators = {}

    def load_data(self):
        """Load raw data from Excel file"""
        print("Loading raw data...")
        self.df = pd.read_excel(self.data_path)
        print(f"Loaded {len(self.df)} records for {self.df['location'].nunique()} countries")
        print(f"Years: {int(self.df['year'].min())} - {int(self.df['year'].max())}")

    def calculate_public_health_financing_indicators(self):
        """
        Category 1: Adequacy of Public Health Financing
        """
        print("\n1. Calculating Public Health Financing Indicators...")

        df = self.df.copy()

        # Add threshold column based on income status
        df['threshold_per_capita'] = df['income'].map(THRESHOLDS['gov_exp_health_per_capita'])

        # Calculate gap
        df['public_health_gap'] = np.where(
            df['Gov exp Health per capita'] < df['threshold_per_capita'],
            df['threshold_per_capita'] - df['Gov exp Health per capita'],
            0
        )

        # 1.1 Number of countries below threshold
        countries_below_threshold = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: (x['Gov exp Health per capita'] < x['threshold_per_capita']).sum()
        ).reset_index(name='countries_below_threshold')

        # 1.2 Average public health financing gap
        avg_gap = df[df['public_health_gap'] > 0].groupby(['year', 'income', 'Subregion']).agg({
            'public_health_gap': 'mean'
        }).reset_index()
        avg_gap.columns = ['year', 'income', 'Subregion', 'avg_public_health_gap']

        # 1.3 Inequality (Gini coefficient)
        gini_public = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: self._calculate_gini(x['Gov exp Health per capita'].dropna())
        ).reset_index(name='gini_public_health_exp')

        # 1.4 Range (highest - lowest)
        range_public = df.groupby(['year', 'income', 'Subregion'])['Gov exp Health per capita'].agg([
            ('min_public_exp', 'min'),
            ('max_public_exp', 'max')
        ]).reset_index()
        range_public['range_public_exp'] = range_public['max_public_exp'] - range_public['min_public_exp']

        self.indicators['public_health_financing'] = {
            'countries_below_threshold': countries_below_threshold,
            'avg_gap': avg_gap,
            'gini': gini_public,
            'range': range_public
        }

    def calculate_budget_priority_indicators(self):
        """
        Category 2: Budgetary Priority Assigned to Health
        """
        print("2. Calculating Budget Priority Indicators...")

        df = self.df.copy()

        # Calculate gap for Abuja Declaration
        df['budget_priority_gap'] = np.where(
            df['Gov exp Health on budget'] < THRESHOLDS['abuja_target'],
            THRESHOLDS['abuja_target'] - df['Gov exp Health on budget'],
            0
        )

        # 2.1 Number of countries below Abuja target
        countries_below_abuja = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: (x['Gov exp Health on budget'] < THRESHOLDS['abuja_target']).sum()
        ).reset_index(name='countries_below_abuja')

        # 2.2 Average budget priority gap
        avg_budget_gap = df[df['budget_priority_gap'] > 0].groupby(['year', 'income', 'Subregion']).agg({
            'budget_priority_gap': 'mean'
        }).reset_index()
        avg_budget_gap.columns = ['year', 'income', 'Subregion', 'avg_budget_priority_gap']

        # 2.3 Inequality (Gini coefficient)
        gini_budget = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: self._calculate_gini(x['Gov exp Health on budget'].dropna())
        ).reset_index(name='gini_budget_priority')

        # 2.4 Range
        range_budget = df.groupby(['year', 'income', 'Subregion'])['Gov exp Health on budget'].agg([
            ('min_budget_priority', 'min'),
            ('max_budget_priority', 'max')
        ]).reset_index()
        range_budget['range_budget_priority'] = range_budget['max_budget_priority'] - range_budget['min_budget_priority']

        self.indicators['budget_priority'] = {
            'countries_below_abuja': countries_below_abuja,
            'avg_gap': avg_budget_gap,
            'gini': gini_budget,
            'range': range_budget
        }

    def calculate_financial_protection_indicators(self):
        """
        Category 3: Financial Protection of Households
        """
        print("3. Calculating Financial Protection Indicators...")

        df = self.df.copy()

        # Calculate gap (note: higher OOP is worse, so benchmark is >20%)
        df['financial_protection_gap'] = np.where(
            df['Out-of-pocket on health exp'] > THRESHOLDS['oop_benchmark'],
            df['Out-of-pocket on health exp'] - THRESHOLDS['oop_benchmark'],
            0
        )

        # 3.1 Number of countries above OOP benchmark
        countries_above_oop = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: (x['Out-of-pocket on health exp'] > THRESHOLDS['oop_benchmark']).sum()
        ).reset_index(name='countries_above_oop_benchmark')

        # 3.2 Average financial protection gap
        avg_fp_gap = df[df['financial_protection_gap'] > 0].groupby(['year', 'income', 'Subregion']).agg({
            'financial_protection_gap': 'mean'
        }).reset_index()
        avg_fp_gap.columns = ['year', 'income', 'Subregion', 'avg_financial_protection_gap']

        # 3.3 Inequality (Gini coefficient)
        gini_oop = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: self._calculate_gini(x['Out-of-pocket on health exp'].dropna())
        ).reset_index(name='gini_oop')

        # 3.4 Financial hardship incidence
        financial_hardship = df.groupby(['year', 'income', 'Subregion']).agg({
            'financial hardship': 'mean'
        }).reset_index()

        self.indicators['financial_protection'] = {
            'countries_above_oop_benchmark': countries_above_oop,
            'avg_gap': avg_fp_gap,
            'gini': gini_oop,
            'financial_hardship': financial_hardship
        }

    def calculate_health_financing_structure_indicators(self):
        """
        Category 4: Health Financing Structure (Sources)
        """
        print("4. Calculating Health Financing Structure Indicators...")

        df = self.df.copy()

        # 4.1 Countries with government as dominant source (>50%)
        countries_gov_dominant = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: (x['Govern on health exp'] > THRESHOLDS['gov_share_dominant']).sum()
        ).reset_index(name='countries_gov_dominant')

        # 4.2-4.6 Average shares by source
        financing_sources = df.groupby(['year', 'income', 'Subregion']).agg({
            'Govern on health exp': 'mean',
            'Voluntary Prepayments on health exp': 'mean',
            'Out-of-pocket on health exp': 'mean',
            'Other Private on health exp': 'mean',
            'External on health exp': 'mean'
        }).reset_index()

        financing_sources.columns = [
            'year', 'income', 'Subregion',
            'avg_gov_share', 'avg_voluntary_prepaid_share',
            'avg_oop_share', 'avg_other_private_share', 'avg_external_share'
        ]

        self.indicators['financing_structure'] = {
            'countries_gov_dominant': countries_gov_dominant,
            'avg_shares': financing_sources
        }

    def calculate_uhc_indicators(self):
        """
        Category 5: Health Outputs (UHC Index)
        """
        print("5. Calculating UHC Index Indicators...")

        df = self.df.copy()

        # 5.1 Average UHC index
        avg_uhc = df.groupby(['year', 'income', 'Subregion']).agg({
            'Universal health coverage': 'mean'
        }).reset_index()
        avg_uhc.columns = ['year', 'income', 'Subregion', 'avg_uhc_index']

        # 5.2 Countries with UHC < 50%
        countries_low_uhc = df.groupby(['year']).apply(
            lambda x: (x['Universal health coverage'] < 50).sum()
        ).reset_index(name='countries_uhc_below_50')

        # 5.3 Inequality (Gini coefficient)
        gini_uhc = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: self._calculate_gini(x['Universal health coverage'].dropna())
        ).reset_index(name='gini_uhc')

        # Calculate percentiles for Africa
        df['uhc_percentile'] = df.groupby('year')['Universal health coverage'].rank(pct=True) * 100

        self.indicators['uhc'] = {
            'avg_uhc': avg_uhc,
            'countries_low_uhc': countries_low_uhc,
            'gini': gini_uhc
        }

        # Store processed df with percentiles
        self.df = df

    def calculate_health_outcome_indicators(self):
        """
        Category 6: Health Outcomes (NMR and MMR)
        """
        print("6. Calculating Health Outcome Indicators...")

        df = self.df.copy()

        # 6.1 Average NMR
        avg_nmr = df.groupby(['year', 'income', 'Subregion']).agg({
            'Neonatal mortality rate': 'mean'
        }).reset_index()
        avg_nmr.columns = ['year', 'income', 'Subregion', 'avg_nmr']

        # 6.2 Average MMR
        avg_mmr = df.groupby(['year', 'income', 'Subregion']).agg({
            'Maternal mortality ratio': 'mean'
        }).reset_index()
        avg_mmr.columns = ['year', 'income', 'Subregion', 'avg_mmr']

        # 6.3 Countries on track for NMR target (<12 per 1,000)
        # Note: This requires trend analysis - simplified version checks current status
        countries_nmr_track = df.groupby(['year']).apply(
            lambda x: (x['Neonatal mortality rate'] < 12).sum()
        ).reset_index(name='countries_nmr_on_track')

        # 6.4 Countries on track for MMR target (<70 per 100,000)
        countries_mmr_track = df.groupby(['year']).apply(
            lambda x: (x['Maternal mortality ratio'] < 70).sum()
        ).reset_index(name='countries_mmr_on_track')

        self.indicators['health_outcomes'] = {
            'avg_nmr': avg_nmr,
            'avg_mmr': avg_mmr,
            'countries_nmr_track': countries_nmr_track,
            'countries_mmr_track': countries_mmr_track
        }

    def calculate_cross_dimensional_indicators(self):
        """
        Categories 7-9: Cross-dimensional analysis
        (Financing dimensions vs UHC and Health Outcomes)
        """
        print("7-9. Calculating Cross-Dimensional Indicators...")

        df = self.df.copy()

        # Add categorical variables for analysis
        df['meets_public_health_threshold'] = df.apply(
            lambda row: row['Gov exp Health per capita'] >= THRESHOLDS['gov_exp_health_per_capita'].get(row['income'], 146),
            axis=1
        )
        df['meets_abuja_target'] = df['Gov exp Health on budget'] >= THRESHOLDS['abuja_target']
        df['meets_oop_benchmark'] = df['Out-of-pocket on health exp'] <= THRESHOLDS['oop_benchmark']
        df['gov_dominant'] = df['Govern on health exp'] > THRESHOLDS['gov_share_dominant']

        # Calculate UHC percentiles for each year
        df['uhc_above_50th'] = df.groupby('year')['Universal health coverage'].transform(
            lambda x: x >= x.quantile(0.50)
        )
        df['uhc_above_75th'] = df.groupby('year')['Universal health coverage'].transform(
            lambda x: x >= x.quantile(0.75)
        )

        # Health outcome targets
        df['nmr_on_track'] = df['Neonatal mortality rate'] < 12
        df['mmr_on_track'] = df['Maternal mortality ratio'] < 70

        # 7.1 Financing dimensions vs UHC
        uhc_correlations = df.groupby(['year', 'income']).apply(
            lambda x: pd.Series({
                'pct_public_threshold_uhc50': (x['meets_public_health_threshold'] & x['uhc_above_50th']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_public_threshold_uhc75': (x['meets_public_health_threshold'] & x['uhc_above_75th']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_abuja_uhc50': (x['meets_abuja_target'] & x['uhc_above_50th']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_abuja_uhc75': (x['meets_abuja_target'] & x['uhc_above_75th']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_oop_benchmark_uhc50': (x['meets_oop_benchmark'] & x['uhc_above_50th']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_oop_benchmark_uhc75': (x['meets_oop_benchmark'] & x['uhc_above_75th']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
            })
        ).reset_index()

        # 7.2 Financing dimensions vs Health Outcomes
        outcome_correlations = df.groupby(['year', 'income']).apply(
            lambda x: pd.Series({
                'pct_public_threshold_nmr': (x['meets_public_health_threshold'] & x['nmr_on_track']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_abuja_mmr': (x['meets_abuja_target'] & x['mmr_on_track']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
            })
        ).reset_index()

        # 7.3 Financing structure vs UHC
        structure_uhc = df.groupby(['year', 'income']).apply(
            lambda x: pd.Series({
                'pct_gov_dominant_uhc50': (x['gov_dominant'] & x['uhc_above_50th']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_gov_dominant_uhc75': (x['gov_dominant'] & x['uhc_above_75th']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
            })
        ).reset_index()

        # 7.4 Financing structure vs Health Outcomes
        structure_outcomes = df.groupby(['year', 'income']).apply(
            lambda x: pd.Series({
                'pct_gov_dominant_nmr': (x['gov_dominant'] & x['nmr_on_track']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_gov_dominant_mmr': (x['gov_dominant'] & x['mmr_on_track']).sum() / len(x) * 100 if len(x) > 0 else np.nan,
            })
        ).reset_index()

        self.indicators['cross_dimensional'] = {
            'uhc_correlations': uhc_correlations,
            'outcome_correlations': outcome_correlations,
            'structure_uhc': structure_uhc,
            'structure_outcomes': structure_outcomes
        }

    def calculate_fiscal_space_indicators(self):
        """
        Category 10: Fiscal Space and Macroeconomic Constraints
        """
        print("10. Calculating Fiscal Space Indicators...")

        df = self.df.copy()

        # Calculate health spending elasticity (simplified: YoY growth rate comparison)
        df_sorted = df.sort_values(['location', 'year'])
        df_sorted['gdp_growth'] = df_sorted.groupby('location')['GDP per capita Constant 2023'].pct_change() * 100
        df_sorted['health_exp_growth'] = df_sorted.groupby('location')['Gov exp Health per capita'].pct_change() * 100
        df_sorted['health_elasticity'] = df_sorted['health_exp_growth'] / df_sorted['gdp_growth']

        # Desirable elasticity > 1 (health spending grows faster than GDP)
        fiscal_indicators = df_sorted.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: pd.Series({
                'pct_desirable_elasticity': (x['health_elasticity'] > 1).sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'avg_health_elasticity': x['health_elasticity'].mean()
            })
        ).reset_index()

        # Health tax revenue percentiles
        df['health_tax_above_50th'] = df.groupby('year')['Tax Revenue per GDP'].transform(
            lambda x: x >= x.quantile(0.50)
        )
        df['health_tax_above_75th'] = df.groupby('year')['Tax Revenue per GDP'].transform(
            lambda x: x >= x.quantile(0.75)
        )

        # Health expenditure to GDP percentiles
        df['health_gdp_above_50th'] = df.groupby('year')['Exp Health on GDP'].transform(
            lambda x: x >= x.quantile(0.50)
        )
        df['health_gdp_above_75th'] = df.groupby('year')['Exp Health on GDP'].transform(
            lambda x: x >= x.quantile(0.75)
        )

        percentile_indicators = df.groupby(['year', 'income', 'Subregion']).apply(
            lambda x: pd.Series({
                'pct_tax_above_50th': x['health_tax_above_50th'].sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_tax_above_75th': x['health_tax_above_75th'].sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_health_gdp_above_50th': x['health_gdp_above_50th'].sum() / len(x) * 100 if len(x) > 0 else np.nan,
                'pct_health_gdp_above_75th': x['health_gdp_above_75th'].sum() / len(x) * 100 if len(x) > 0 else np.nan,
            })
        ).reset_index()

        # Investment indicators
        investment_indicators = df.groupby(['year', 'income', 'Subregion']).agg({
            'Gross fixed capital formation, as % of Gross domestic product (GDP)': 'mean',
            'Direct foreign transfers, as % of Gross domestic product (GDP)': 'mean',
        }).reset_index()

        investment_indicators.columns = [
            'year', 'income', 'Subregion',
            'avg_gross_fixed_capital_pct_gdp',
            'avg_foreign_transfers_pct_gdp'
        ]

        self.indicators['fiscal_space'] = {
            'fiscal_indicators': fiscal_indicators,
            'percentile_indicators': percentile_indicators,
            'investment_indicators': investment_indicators
        }

    def _calculate_gini(self, values: pd.Series) -> float:
        """
        Calculate Gini coefficient for inequality measurement
        """
        values = values.dropna().values
        if len(values) == 0:
            return np.nan

        sorted_values = np.sort(values)
        n = len(values)
        index = np.arange(1, n + 1)
        return (2 * np.sum(index * sorted_values)) / (n * np.sum(sorted_values)) - (n + 1) / n

    def process_all_indicators(self):
        """Run all indicator calculations"""
        self.load_data()
        self.calculate_public_health_financing_indicators()
        self.calculate_budget_priority_indicators()
        self.calculate_financial_protection_indicators()
        self.calculate_health_financing_structure_indicators()
        self.calculate_uhc_indicators()
        self.calculate_health_outcome_indicators()
        self.calculate_cross_dimensional_indicators()
        self.calculate_fiscal_space_indicators()

    def save_processed_data(self, output_dir: Path):
        """Save all processed indicators to JSON and CSV files"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        print(f"\nSaving processed indicators to {output_dir}...")

        # Save each indicator category
        for category, data_dict in self.indicators.items():
            category_dir = output_dir / category
            category_dir.mkdir(exist_ok=True)

            for indicator_name, df in data_dict.items():
                # Save as CSV
                csv_path = category_dir / f"{indicator_name}.csv"
                df.to_csv(csv_path, index=False)

                # Save as JSON
                json_path = category_dir / f"{indicator_name}.json"
                df.to_json(json_path, orient='records', indent=2)

        # Save master dataset with all calculated fields
        master_csv = output_dir / 'master_dataset.csv'
        master_json = output_dir / 'master_dataset.json'

        self.df.to_csv(master_csv, index=False)
        self.df.to_json(master_json, orient='records', indent=2)

        # Create metadata
        metadata = {
            'generated_date': pd.Timestamp.now().isoformat(),
            'total_records': len(self.df),
            'countries': sorted([c for c in self.df['location'].unique() if isinstance(c, str)]),
            'year_range': [int(self.df['year'].min()), int(self.df['year'].max())],
            'income_categories': self.df['income'].value_counts().to_dict(),
            'subregions': self.df['Subregion'].value_counts().to_dict(),
            'thresholds': THRESHOLDS,
            'indicators': {
                category: list(data_dict.keys())
                for category, data_dict in self.indicators.items()
            }
        }

        metadata_path = output_dir / 'metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        print(f"[OK] Saved {len(self.indicators)} indicator categories")
        print(f"[OK] Master dataset: {len(self.df)} records")
        print(f"[OK] Metadata saved to {metadata_path}")

        return metadata

def main():
    """Main execution function"""
    # Define paths
    base_path = Path(r"C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap")
    data_path = base_path / "health-financing-platform" / "data-processing" / "health_data.xlsx"
    output_dir = base_path / "health-financing-platform" / "processed_data"

    # Process data
    processor = HealthFinancingProcessor(data_path)
    processor.process_all_indicators()
    metadata = processor.save_processed_data(output_dir)

    print("\n" + "="*60)
    print("DATA PROCESSING COMPLETE!")
    print("="*60)
    print(f"\nProcessed data location: {output_dir}")
    print(f"Countries: {len(metadata['countries'])}")
    print(f"Years: {metadata['year_range'][0]} - {metadata['year_range'][1]}")
    print(f"Indicator categories: {len(metadata['indicators'])}")
    print("\nReady for web platform integration!")

if __name__ == "__main__":
    main()
