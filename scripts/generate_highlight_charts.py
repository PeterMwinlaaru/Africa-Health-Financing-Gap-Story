"""
Generate Charts for Health Financing Gap Highlights
====================================================
Creates visualizations for the key messages from the health financing analysis.

Author: Health Financing Gap Analysis Team
Date: March 2026
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
from scipy import stats
import os

# Set style
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette("husl")

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'processed_data')
OUTPUT_DIR = os.path.join(BASE_DIR, 'reports', 'charts')

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Color schemes
COLORS = {
    'primary': '#1F4E79',
    'secondary': '#2E75B6',
    'accent': '#5B9BD5',
    'warning': '#ED7D31',
    'danger': '#C00000',
    'success': '#70AD47',
    'neutral': '#7F7F7F',
    'light': '#D6DCE4'
}

INCOME_COLORS = {
    'Low': '#C00000',
    'Lower-middle': '#ED7D31',
    'Upper-middle': '#70AD47'
}

SUBREGION_COLORS = {
    'Eastern Africa': '#1F4E79',
    'Middle Africa': '#2E75B6',
    'Northern Africa': '#5B9BD5',
    'Southern Africa': '#70AD47',
    'Western Africa': '#ED7D31'
}


def load_data():
    """Load and prepare the master dataset."""
    df = pd.read_csv(os.path.join(DATA_DIR, 'master_dataset.csv'))
    df = df[(df['year'] >= 2000) & (df['year'] <= 2023)]
    return df


def save_chart(fig, filename, dpi=300):
    """Save chart to output directory."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(filepath, dpi=dpi, bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close(fig)
    print(f"  Saved: {filename}")


# =============================================================================
# CHART 1: Countries Meeting Threshold by Year
# Highlight: Only 3 (5.6%) African countries exceeded the threshold in 2023
# =============================================================================
def chart_threshold_by_year(df):
    """Bar chart showing countries meeting threshold by year."""
    yearly = df.groupby('year').agg({
        'Gov exp Health per capita More than Threshold': 'sum',
        'location': 'nunique'
    }).reset_index()
    yearly.columns = ['year', 'countries_meeting', 'total_countries']
    yearly['pct'] = (yearly['countries_meeting'] / yearly['total_countries'] * 100).round(1)

    fig, ax = plt.subplots(figsize=(14, 6))

    bars = ax.bar(yearly['year'], yearly['countries_meeting'], color=COLORS['primary'], edgecolor='white')

    # Add data labels
    for bar, pct in zip(bars, yearly['pct']):
        height = bar.get_height()
        ax.annotate(f'{int(height)}\n({pct}%)',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=8, fontweight='bold')

    # Highlight 2023
    bars[-1].set_color(COLORS['warning'])

    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Number of Countries Meeting Threshold', fontsize=12, fontweight='bold')
    ax.set_title('African Countries Meeting Government Health Spending Threshold (2000-2023)\n'
                 'Only 3 countries (5.6%) exceeded the threshold in 2023',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(yearly['year'])
    ax.set_xticklabels(yearly['year'], rotation=45, ha='right')
    ax.set_ylim(0, max(yearly['countries_meeting']) + 3)

    # Add reference line at 3
    ax.axhline(y=3, color=COLORS['danger'], linestyle='--', alpha=0.7, label='2023 level (3 countries)')
    ax.legend(loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart01_threshold_by_year.png')


# =============================================================================
# CHART 2: Threshold Achievement by Income Group (2023)
# Highlight: All 22 low-income countries fell short
# =============================================================================
def chart_threshold_by_income_2023(df):
    """Stacked bar showing threshold achievement by income group in 2023."""
    df_2023 = df[df['year'] == 2023]

    income_data = df_2023.groupby('income').agg({
        'Gov exp Health per capita More than Threshold': ['sum', 'count']
    }).reset_index()
    income_data.columns = ['income', 'meeting', 'total']
    income_data['not_meeting'] = income_data['total'] - income_data['meeting']

    # Order by income level
    order = ['Low', 'Lower-middle', 'Upper-middle']
    income_data['income'] = pd.Categorical(income_data['income'], categories=order, ordered=True)
    income_data = income_data.sort_values('income')

    fig, ax = plt.subplots(figsize=(10, 6))

    x = np.arange(len(income_data))
    width = 0.6

    bars1 = ax.bar(x, income_data['not_meeting'], width, label='Not Meeting Threshold',
                   color=COLORS['danger'], edgecolor='white')
    bars2 = ax.bar(x, income_data['meeting'], width, bottom=income_data['not_meeting'],
                   label='Meeting Threshold', color=COLORS['success'], edgecolor='white')

    # Add labels
    for i, (not_meeting, meeting, total) in enumerate(zip(income_data['not_meeting'],
                                                           income_data['meeting'],
                                                           income_data['total'])):
        if not_meeting > 0:
            ax.text(i, not_meeting/2, f'{int(not_meeting)}', ha='center', va='center',
                    fontsize=12, fontweight='bold', color='white')
        if meeting > 0:
            ax.text(i, not_meeting + meeting/2, f'{int(meeting)}', ha='center', va='center',
                    fontsize=12, fontweight='bold', color='white')

    ax.set_xlabel('Income Group', fontsize=12, fontweight='bold')
    ax.set_ylabel('Number of Countries', fontsize=12, fontweight='bold')
    ax.set_title('Government Health Spending Threshold Achievement by Income Group (2023)\n'
                 'All 22 low-income countries fell short of the threshold',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels([f'{inc}\n(n={t})' for inc, t in zip(income_data['income'], income_data['total'])])
    ax.legend(loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart02_threshold_by_income_2023.png')


# =============================================================================
# CHART 3: Spending Gap Widening Over Time
# Highlight: Gap widened from USD 416 (2015) to USD 535.20 (2023)
# =============================================================================
def chart_spending_gap_trend(df):
    """Line chart showing gap between highest and lowest spending countries."""
    yearly = df.groupby('year')['Gov exp Health per capita'].agg(['max', 'min']).reset_index()
    yearly['gap'] = yearly['max'] - yearly['min']

    fig, ax = plt.subplots(figsize=(12, 6))

    ax.plot(yearly['year'], yearly['gap'], marker='o', linewidth=2.5,
            color=COLORS['primary'], markersize=8)

    # Highlight 2015 and 2023
    y2015 = yearly[yearly['year'] == 2015]['gap'].values[0]
    y2023 = yearly[yearly['year'] == 2023]['gap'].values[0]

    ax.scatter([2015, 2023], [y2015, y2023], color=COLORS['warning'], s=150, zorder=5)
    ax.annotate(f'${y2015:.0f}', xy=(2015, y2015), xytext=(2015-0.5, y2015+30),
                fontsize=11, fontweight='bold', color=COLORS['warning'])
    ax.annotate(f'${y2023:.1f}', xy=(2023, y2023), xytext=(2023-0.5, y2023+30),
                fontsize=11, fontweight='bold', color=COLORS['warning'])

    ax.fill_between(yearly['year'], yearly['gap'], alpha=0.2, color=COLORS['primary'])

    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Gap in Per Capita Spending (USD)', fontsize=12, fontweight='bold')
    ax.set_title('Widening Gap in Government Health Spending Per Capita (2000-2023)\n'
                 'Gap increased from $416 (2015) to $535 (2023) between highest and lowest spending countries',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(yearly['year'])
    ax.set_xticklabels(yearly['year'], rotation=45, ha='right')

    plt.tight_layout()
    save_chart(fig, 'chart03_spending_gap_trend.png')


# =============================================================================
# CHART 4: Health Expenditure vs Abuja Target
# Highlight: Africa's average (5%) is about one-third of the Abuja target (15%)
# =============================================================================
def chart_abuja_comparison(df):
    """Line chart comparing actual spending to Abuja target."""
    yearly = df.groupby('year')['Gov exp Health on budget'].mean().reset_index()

    fig, ax = plt.subplots(figsize=(12, 6))

    ax.plot(yearly['year'], yearly['Gov exp Health on budget'], marker='o', linewidth=2.5,
            color=COLORS['primary'], markersize=6, label='Africa Average')
    ax.axhline(y=15, color=COLORS['danger'], linestyle='--', linewidth=2, label='Abuja Target (15%)')

    # Fill the gap
    ax.fill_between(yearly['year'], yearly['Gov exp Health on budget'], 15, alpha=0.2,
                    color=COLORS['danger'], label='Gap to Target')

    # Add average value annotation
    avg = yearly['Gov exp Health on budget'].mean()
    ax.annotate(f'Average: {avg:.1f}%\n(~1/3 of target)', xy=(2012, avg), xytext=(2012, avg+2),
                fontsize=11, fontweight='bold', color=COLORS['primary'],
                arrowprops=dict(arrowstyle='->', color=COLORS['primary']))

    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Health Expenditure as % of Government Budget', fontsize=12, fontweight='bold')
    ax.set_title('Government Health Expenditure vs Abuja Declaration Target (2000-2023)\n'
                 "Africa's average (~5%) is about one-third of the 15% Abuja target",
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(yearly['year'])
    ax.set_xticklabels(yearly['year'], rotation=45, ha='right')
    ax.set_ylim(0, 20)
    ax.legend(loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart04_abuja_comparison.png')


# =============================================================================
# CHART 5: Countries Meeting Abuja Target Over Time
# Highlight: Only 1 country in 2023 vs 3 in 2022
# =============================================================================
def chart_abuja_countries_trend(df):
    """Bar chart showing countries meeting Abuja target by year."""
    yearly = df.groupby('year')['Gov exp Health on budget > 15'].sum().reset_index()
    yearly.columns = ['year', 'countries_meeting']

    fig, ax = plt.subplots(figsize=(14, 6))

    colors = [COLORS['primary']] * len(yearly)
    colors[-1] = COLORS['danger']  # Highlight 2023
    colors[-2] = COLORS['warning']  # Highlight 2022

    bars = ax.bar(yearly['year'], yearly['countries_meeting'], color=colors, edgecolor='white')

    # Add data labels
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{int(height)}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=10, fontweight='bold')

    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Number of Countries', fontsize=12, fontweight='bold')
    ax.set_title('African Countries Meeting Abuja Declaration Target (>15% of Budget to Health)\n'
                 'Only 1 country met the target in 2023, down from 3 in 2022',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(yearly['year'])
    ax.set_xticklabels(yearly['year'], rotation=45, ha='right')

    # Add legend
    legend_elements = [mpatches.Patch(facecolor=COLORS['danger'], label='2023 (1 country)'),
                      mpatches.Patch(facecolor=COLORS['warning'], label='2022 (3 countries)')]
    ax.legend(handles=legend_elements, loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart05_abuja_countries_trend.png')


# =============================================================================
# CHART 6: OOP Threshold Exceedance
# Highlight: About 3/4 of countries exceeded OOP 20% threshold in 2023
# =============================================================================
def chart_oop_threshold_2023(df):
    """Pie chart showing OOP threshold in 2023."""
    df_2023 = df[df['year'] == 2023]

    below_20 = df_2023['Out-of-pocket on health exp < 20'].sum()
    above_20 = len(df_2023) - below_20

    fig, ax = plt.subplots(figsize=(10, 8))

    sizes = [above_20, below_20]
    labels = [f'Exceeded Threshold\n(>{20}% OOP)\n{int(above_20)} countries ({above_20/len(df_2023)*100:.1f}%)',
              f'Within Threshold\n(<20% OOP)\n{int(below_20)} countries ({below_20/len(df_2023)*100:.1f}%)']
    colors = [COLORS['danger'], COLORS['success']]
    explode = (0.05, 0)

    wedges, texts = ax.pie(sizes, labels=labels, colors=colors, explode=explode,
                           startangle=90, textprops={'fontsize': 11, 'fontweight': 'bold'})

    ax.set_title('Out-of-Pocket Health Expenditure Threshold (2023)\n'
                 'About three-quarters of African countries exceeded the 20% OOP threshold',
                 fontsize=14, fontweight='bold', pad=20)

    plt.tight_layout()
    save_chart(fig, 'chart06_oop_threshold_2023.png')


# =============================================================================
# CHART 7: Financing Gap by Subregion
# Highlight: Average $125.4; Eastern Africa $109.6, Middle Africa $179.2
# =============================================================================
def chart_gap_by_subregion(df):
    """Bar chart showing financing gap by subregion."""
    df_2023 = df[df['year'] == 2023]

    subregion_gap = df_2023.groupby('Subregion')['Gap for Gov exp Health per capita'].mean().reset_index()
    subregion_gap.columns = ['Subregion', 'avg_gap']
    subregion_gap = subregion_gap.sort_values('avg_gap', ascending=True)

    overall_avg = df_2023['Gap for Gov exp Health per capita'].mean()

    fig, ax = plt.subplots(figsize=(10, 6))

    colors = [SUBREGION_COLORS.get(sr, COLORS['neutral']) for sr in subregion_gap['Subregion']]
    bars = ax.barh(subregion_gap['Subregion'], subregion_gap['avg_gap'], color=colors, edgecolor='white')

    # Add data labels
    for bar in bars:
        width = bar.get_width()
        ax.annotate(f'${width:.1f}',
                    xy=(width, bar.get_y() + bar.get_height()/2),
                    xytext=(5, 0), textcoords="offset points",
                    ha='left', va='center', fontsize=11, fontweight='bold')

    # Add average line
    ax.axvline(x=overall_avg, color=COLORS['danger'], linestyle='--', linewidth=2,
               label=f'Africa Average: ${overall_avg:.1f}')

    ax.set_xlabel('Average Health Financing Gap (USD per capita)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Sub-region', fontsize=12, fontweight='bold')
    ax.set_title('Government Health Financing Gap by Sub-region (2023)\n'
                 'Middle Africa has the largest gap; Eastern Africa has the smallest',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(loc='lower right')

    plt.tight_layout()
    save_chart(fig, 'chart07_gap_by_subregion.png')


# =============================================================================
# CHART 8: Gini Inequality by Income Group
# Highlight: Lower-middle (0.48) vs Upper-middle (0.25)
# =============================================================================
def chart_gini_by_income(df):
    """Bar chart showing Gini coefficient by income group."""
    df_2023 = df[df['year'] == 2023]

    gini_data = []
    for income in ['Low', 'Lower-middle', 'Upper-middle']:
        values = df_2023[df_2023['income'] == income]['Gov exp Health per capita'].dropna()
        if len(values) > 1:
            # Calculate Gini
            sorted_vals = np.sort(values)
            n = len(sorted_vals)
            index = np.arange(1, n + 1)
            gini = (2 * np.sum(index * sorted_vals) - (n + 1) * np.sum(sorted_vals)) / (n * np.sum(sorted_vals))
            gini_data.append({'income': income, 'gini': gini})

    gini_df = pd.DataFrame(gini_data)
    order = ['Low', 'Lower-middle', 'Upper-middle']
    gini_df['income'] = pd.Categorical(gini_df['income'], categories=order, ordered=True)
    gini_df = gini_df.sort_values('income')

    fig, ax = plt.subplots(figsize=(10, 6))

    colors = [INCOME_COLORS.get(inc, COLORS['neutral']) for inc in gini_df['income']]
    bars = ax.bar(gini_df['income'], gini_df['gini'], color=colors, edgecolor='white', width=0.6)

    # Add data labels
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.2f}',
                    xy=(bar.get_x() + bar.get_width()/2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=14, fontweight='bold')

    ax.set_xlabel('Income Group', fontsize=12, fontweight='bold')
    ax.set_ylabel('Gini Coefficient', fontsize=12, fontweight='bold')
    ax.set_title('Inequality in Government Health Spending by Income Group (2023)\n'
                 'Lower-middle income countries show nearly twice the inequality of upper-middle income',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_ylim(0, 0.6)

    plt.tight_layout()
    save_chart(fig, 'chart08_gini_by_income.png')


# =============================================================================
# CHART 9: Budget Priority Gap by Income Group
# Highlight: LIC 9.5%, LMIC 7.8%, UMIC 5.1%
# =============================================================================
def chart_budget_gap_by_income(df):
    """Bar chart showing budget priority gap by income group."""
    df_2023 = df[df['year'] == 2023]

    income_gap = df_2023.groupby('income')['Gap Gov exp Health on budget'].mean().reset_index()
    income_gap.columns = ['income', 'avg_gap']

    order = ['Low', 'Lower-middle', 'Upper-middle']
    income_gap['income'] = pd.Categorical(income_gap['income'], categories=order, ordered=True)
    income_gap = income_gap.sort_values('income')

    fig, ax = plt.subplots(figsize=(10, 6))

    colors = [INCOME_COLORS.get(inc, COLORS['neutral']) for inc in income_gap['income']]
    bars = ax.bar(income_gap['income'], income_gap['avg_gap'], color=colors, edgecolor='white', width=0.6)

    # Add data labels
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.1f}%',
                    xy=(bar.get_x() + bar.get_width()/2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=14, fontweight='bold')

    # Add reference line at overall average
    overall_avg = df_2023['Gap Gov exp Health on budget'].mean()
    ax.axhline(y=overall_avg, color=COLORS['primary'], linestyle='--', linewidth=2,
               label=f'Average Gap: {overall_avg:.1f}%')

    ax.set_xlabel('Income Group', fontsize=12, fontweight='bold')
    ax.set_ylabel('Budget Priority Gap (percentage points)', fontsize=12, fontweight='bold')
    ax.set_title('Gap to Abuja Target (15%) by Income Group (2023)\n'
                 'Low-income countries face the largest gap at 9.5 percentage points',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_ylim(0, 12)
    ax.legend(loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart09_budget_gap_by_income.png')


# =============================================================================
# CHART 10: Budget Priority Gap by Subregion
# Highlight: Eastern 9.3%, Western 9.1%, Southern 6.0%, Northern 6.6%
# =============================================================================
def chart_budget_gap_by_subregion(df):
    """Bar chart showing budget priority gap by subregion."""
    df_2023 = df[df['year'] == 2023]

    subregion_gap = df_2023.groupby('Subregion')['Gap Gov exp Health on budget'].mean().reset_index()
    subregion_gap.columns = ['Subregion', 'avg_gap']
    subregion_gap = subregion_gap.sort_values('avg_gap', ascending=True)

    fig, ax = plt.subplots(figsize=(10, 6))

    colors = [SUBREGION_COLORS.get(sr, COLORS['neutral']) for sr in subregion_gap['Subregion']]
    bars = ax.barh(subregion_gap['Subregion'], subregion_gap['avg_gap'], color=colors, edgecolor='white')

    # Add data labels
    for bar in bars:
        width = bar.get_width()
        ax.annotate(f'{width:.1f}%',
                    xy=(width, bar.get_y() + bar.get_height()/2),
                    xytext=(5, 0), textcoords="offset points",
                    ha='left', va='center', fontsize=11, fontweight='bold')

    ax.set_xlabel('Budget Priority Gap (percentage points from 15% target)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Sub-region', fontsize=12, fontweight='bold')
    ax.set_title('Gap to Abuja Target by Sub-region (2023)\n'
                 'Eastern and Western Africa have the largest gaps; Southern Africa has the smallest',
                 fontsize=14, fontweight='bold', pad=20)

    plt.tight_layout()
    save_chart(fig, 'chart10_budget_gap_by_subregion.png')


# =============================================================================
# CHART 11: OOP Below Threshold Trend
# Highlight: Increased from 13.7% (2000) to 24.1% (2023)
# =============================================================================
def chart_oop_protection_trend(df):
    """Line chart showing financial protection trend."""
    yearly = df.groupby('year').agg({
        'Out-of-pocket on health exp < 20': 'sum',
        'location': 'nunique'
    }).reset_index()
    yearly['pct_protected'] = (yearly['Out-of-pocket on health exp < 20'] / yearly['location'] * 100)

    fig, ax = plt.subplots(figsize=(12, 6))

    ax.plot(yearly['year'], yearly['pct_protected'], marker='o', linewidth=2.5,
            color=COLORS['success'], markersize=6)
    ax.fill_between(yearly['year'], yearly['pct_protected'], alpha=0.2, color=COLORS['success'])

    # Highlight start and end
    y2000 = yearly[yearly['year'] == 2000]['pct_protected'].values[0]
    y2023 = yearly[yearly['year'] == 2023]['pct_protected'].values[0]

    ax.scatter([2000, 2023], [y2000, y2023], color=COLORS['primary'], s=150, zorder=5)
    ax.annotate(f'{y2000:.1f}%', xy=(2000, y2000), xytext=(2000+0.5, y2000-3),
                fontsize=11, fontweight='bold', color=COLORS['primary'])
    ax.annotate(f'{y2023:.1f}%', xy=(2023, y2023), xytext=(2023-1.5, y2023+2),
                fontsize=11, fontweight='bold', color=COLORS['primary'])

    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('% of Countries with OOP < 20%', fontsize=12, fontweight='bold')
    ax.set_title('Financial Protection in Health: Countries Below 20% OOP Threshold (2000-2023)\n'
                 'Financial protection improved from 13.7% to 24.1% of countries meeting the threshold',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(yearly['year'])
    ax.set_xticklabels(yearly['year'], rotation=45, ha='right')
    ax.set_ylim(0, 35)

    plt.tight_layout()
    save_chart(fig, 'chart11_oop_protection_trend.png')


# =============================================================================
# CHART 12: Financing Sources (2014-2023 Average)
# Highlight: OOP (36.7%) was the dominant source
# =============================================================================
def chart_financing_sources(df):
    """Stacked bar showing financing sources over time."""
    df_recent = df[(df['year'] >= 2014) & (df['year'] <= 2023)]

    sources = ['Govern on health exp', 'Out-of-pocket on health exp',
               'External on health exp', 'Voluntary Prepayments on health exp',
               'Other Private on health exp']
    source_labels = ['Government', 'Out-of-Pocket', 'External/Donors',
                     'Voluntary Prepaid', 'Other Private']
    source_colors = [COLORS['primary'], COLORS['danger'], COLORS['warning'],
                     COLORS['success'], COLORS['neutral']]

    yearly = df_recent.groupby('year')[sources].mean().reset_index()

    fig, ax = plt.subplots(figsize=(14, 7))

    bottom = np.zeros(len(yearly))
    for source, label, color in zip(sources, source_labels, source_colors):
        values = yearly[source].values
        ax.bar(yearly['year'], values, bottom=bottom, label=label, color=color, edgecolor='white')
        bottom += values

    # Add overall average annotation
    avg_oop = df_recent['Out-of-pocket on health exp'].mean()
    ax.annotate(f'OOP Average:\n{avg_oop:.1f}%', xy=(2018, 65), fontsize=11, fontweight='bold',
                color=COLORS['danger'], bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Share of Total Health Expenditure (%)', fontsize=12, fontweight='bold')
    ax.set_title('Health Financing Sources in Africa (2014-2023)\n'
                 'Out-of-pocket expenditure (36.7% average) remains the dominant financing source',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(loc='upper right', bbox_to_anchor=(1.15, 1))
    ax.set_ylim(0, 105)

    plt.tight_layout()
    save_chart(fig, 'chart12_financing_sources.png')


# =============================================================================
# CHART 13: UHC Trend
# Highlight: UHC hovered around 50% between 2014-2023
# =============================================================================
def chart_uhc_trend(df):
    """Line chart showing UHC trend over time."""
    yearly = df.groupby('year')['Universal health coverage'].mean().reset_index()

    fig, ax = plt.subplots(figsize=(12, 6))

    ax.plot(yearly['year'], yearly['Universal health coverage'], marker='o', linewidth=2.5,
            color=COLORS['primary'], markersize=6)
    ax.fill_between(yearly['year'], yearly['Universal health coverage'], alpha=0.2, color=COLORS['primary'])

    # Add 50% reference line
    ax.axhline(y=50, color=COLORS['warning'], linestyle='--', linewidth=2, label='50% Benchmark')

    # Recent average
    recent = yearly[yearly['year'] >= 2014]['Universal health coverage'].mean()
    ax.annotate(f'2014-2023 Average:\n{recent:.1f}%', xy=(2018, recent+3), fontsize=11, fontweight='bold',
                color=COLORS['primary'], bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('UHC Service Coverage Index', fontsize=12, fontweight='bold')
    ax.set_title('Universal Health Coverage (UHC) Index Trend in Africa (2000-2023)\n'
                 'UHC has hovered around 50% with marginal increases in recent years',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(yearly['year'])
    ax.set_xticklabels(yearly['year'], rotation=45, ha='right')
    ax.set_ylim(30, 60)
    ax.legend(loc='lower right')

    plt.tight_layout()
    save_chart(fig, 'chart13_uhc_trend.png')


# =============================================================================
# CHART 14: UHC Range by Country (2023)
# Highlight: Seychelles (80%) to Chad (26%) - more than threefold variation
# =============================================================================
def chart_uhc_by_country(df):
    """Bar chart showing UHC by country in 2023."""
    df_2023 = df[df['year'] == 2023][['location', 'Universal health coverage']].dropna()
    df_2023 = df_2023.sort_values('Universal health coverage', ascending=True)

    fig, ax = plt.subplots(figsize=(14, 12))

    # Color by position
    colors = plt.cm.RdYlGn(np.linspace(0, 1, len(df_2023)))

    bars = ax.barh(df_2023['location'], df_2023['Universal health coverage'], color=colors, edgecolor='white')

    # Add 50% line
    ax.axvline(x=50, color=COLORS['danger'], linestyle='--', linewidth=2, label='50% Threshold')

    # Highlight min and max
    ax.scatter([df_2023['Universal health coverage'].min()], [df_2023['location'].iloc[0]],
               color=COLORS['danger'], s=200, zorder=5)
    ax.scatter([df_2023['Universal health coverage'].max()], [df_2023['location'].iloc[-1]],
               color=COLORS['success'], s=200, zorder=5)

    ax.set_xlabel('UHC Service Coverage Index (%)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Country', fontsize=12, fontweight='bold')
    ax.set_title('Universal Health Coverage by Country (2023)\n'
                 'Coverage varies more than threefold: from Chad (26%) to Seychelles (80%)',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(loc='lower right')
    ax.tick_params(axis='y', labelsize=8)

    plt.tight_layout()
    save_chart(fig, 'chart14_uhc_by_country.png')


# =============================================================================
# CHART 15: Maternal Mortality Decline
# Highlight: Declined from 556 (2000) to 292 (2023)
# =============================================================================
def chart_mmr_trend(df):
    """Line chart showing maternal mortality decline."""
    yearly = df.groupby('year')['Maternal mortality ratio'].mean().reset_index()

    fig, ax = plt.subplots(figsize=(12, 6))

    ax.plot(yearly['year'], yearly['Maternal mortality ratio'], marker='o', linewidth=2.5,
            color=COLORS['primary'], markersize=6)
    ax.fill_between(yearly['year'], yearly['Maternal mortality ratio'], alpha=0.2, color=COLORS['primary'])

    # Add SDG target line
    ax.axhline(y=70, color=COLORS['success'], linestyle='--', linewidth=2, label='SDG Target (70 per 100,000)')

    # Highlight start and end
    y2000 = yearly[yearly['year'] == 2000]['Maternal mortality ratio'].values[0]
    y2023 = yearly[yearly['year'] == 2023]['Maternal mortality ratio'].values[0]

    ax.scatter([2000, 2023], [y2000, y2023], color=COLORS['warning'], s=150, zorder=5)
    ax.annotate(f'{y2000:.0f}', xy=(2000, y2000), xytext=(2000+0.5, y2000+30),
                fontsize=11, fontweight='bold', color=COLORS['warning'])
    ax.annotate(f'{y2023:.0f}', xy=(2023, y2023), xytext=(2023-1, y2023+30),
                fontsize=11, fontweight='bold', color=COLORS['warning'])

    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Maternal Mortality Ratio (per 100,000 live births)', fontsize=12, fontweight='bold')
    ax.set_title('Maternal Mortality Ratio Decline in Africa (2000-2023)\n'
                 'MMR declined by about half, from 556 to 292 per 100,000 live births',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(yearly['year'])
    ax.set_xticklabels(yearly['year'], rotation=45, ha='right')
    ax.legend(loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart15_mmr_trend.png')


# =============================================================================
# CHART 16: Countries On Course for SDG MMR Target
# Highlight: Only 8 out of 54 countries on course
# =============================================================================
def chart_mmr_on_course(df):
    """Pie chart showing countries on course for SDG MMR."""
    df_2023 = df[df['year'] == 2023]

    on_course = df_2023['mmr_on_course'].sum()
    not_on_course = len(df_2023) - on_course

    fig, ax = plt.subplots(figsize=(10, 8))

    sizes = [not_on_course, on_course]
    labels = [f'Not on Course\n{int(not_on_course)} countries\n({not_on_course/len(df_2023)*100:.0f}%)',
              f'On Course for SDG\n{int(on_course)} countries\n({on_course/len(df_2023)*100:.0f}%)']
    colors = [COLORS['danger'], COLORS['success']]
    explode = (0, 0.1)

    wedges, texts = ax.pie(sizes, labels=labels, colors=colors, explode=explode,
                           startangle=90, textprops={'fontsize': 12, 'fontweight': 'bold'})

    ax.set_title('Countries On Course for SDG Maternal Mortality Target (2023)\n'
                 'Only 8 out of 54 countries (15%) are on course to achieve the SDG target of 70 per 100,000',
                 fontsize=14, fontweight='bold', pad=20)

    plt.tight_layout()
    save_chart(fig, 'chart16_mmr_on_course.png')


# =============================================================================
# CHART 17: Correlation - Spending vs UHC
# Highlight: Correlation coefficient of 0.70
# =============================================================================
def chart_spending_uhc_correlation(df):
    """Scatter plot showing correlation between spending and UHC."""
    df_2023 = df[df['year'] == 2023][['Gov exp Health per capita', 'Universal health coverage',
                                       'location', 'income']].dropna()

    # Calculate correlation
    corr, p_value = stats.pearsonr(df_2023['Gov exp Health per capita'],
                                    df_2023['Universal health coverage'])

    fig, ax = plt.subplots(figsize=(12, 8))

    # Color by income
    for income, color in INCOME_COLORS.items():
        subset = df_2023[df_2023['income'] == income]
        ax.scatter(subset['Gov exp Health per capita'], subset['Universal health coverage'],
                   c=color, label=income, s=100, alpha=0.7, edgecolors='white')

    # Add regression line
    z = np.polyfit(df_2023['Gov exp Health per capita'], df_2023['Universal health coverage'], 1)
    p = np.poly1d(z)
    x_line = np.linspace(df_2023['Gov exp Health per capita'].min(),
                         df_2023['Gov exp Health per capita'].max(), 100)
    ax.plot(x_line, p(x_line), "--", color=COLORS['neutral'], linewidth=2)

    # Add correlation annotation
    ax.annotate(f'Correlation: r = {corr:.2f}\n(p < 0.001)',
                xy=(0.95, 0.05), xycoords='axes fraction',
                fontsize=14, fontweight='bold', color=COLORS['primary'],
                ha='right', va='bottom',
                bbox=dict(boxstyle='round', facecolor='white', alpha=0.9))

    ax.set_xlabel('Government Health Expenditure Per Capita (USD)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Universal Health Coverage Index (%)', fontsize=12, fontweight='bold')
    ax.set_title('Relationship Between Government Health Spending and UHC (2023)\n'
                 'Strong positive correlation (r = 0.70): Higher spending associated with better coverage',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(title='Income Group', loc='lower right')

    plt.tight_layout()
    save_chart(fig, 'chart17_spending_uhc_correlation.png')


# =============================================================================
# CHART 18: Correlation - Spending vs MMR
# Highlight: Correlation coefficient of -0.47
# =============================================================================
def chart_spending_mmr_correlation(df):
    """Scatter plot showing correlation between spending and MMR."""
    df_2023 = df[df['year'] == 2023][['Gov exp Health per capita', 'Maternal mortality ratio',
                                       'location', 'income']].dropna()

    # Calculate correlation
    corr, p_value = stats.pearsonr(df_2023['Gov exp Health per capita'],
                                    df_2023['Maternal mortality ratio'])

    fig, ax = plt.subplots(figsize=(12, 8))

    # Color by income
    for income, color in INCOME_COLORS.items():
        subset = df_2023[df_2023['income'] == income]
        ax.scatter(subset['Gov exp Health per capita'], subset['Maternal mortality ratio'],
                   c=color, label=income, s=100, alpha=0.7, edgecolors='white')

    # Add regression line
    z = np.polyfit(df_2023['Gov exp Health per capita'], df_2023['Maternal mortality ratio'], 1)
    p = np.poly1d(z)
    x_line = np.linspace(df_2023['Gov exp Health per capita'].min(),
                         df_2023['Gov exp Health per capita'].max(), 100)
    ax.plot(x_line, p(x_line), "--", color=COLORS['neutral'], linewidth=2)

    # Add SDG target line
    ax.axhline(y=70, color=COLORS['success'], linestyle=':', linewidth=2, label='SDG Target')

    # Add correlation annotation
    ax.annotate(f'Correlation: r = {corr:.2f}\n(p < 0.001)',
                xy=(0.95, 0.95), xycoords='axes fraction',
                fontsize=14, fontweight='bold', color=COLORS['primary'],
                ha='right', va='top',
                bbox=dict(boxstyle='round', facecolor='white', alpha=0.9))

    ax.set_xlabel('Government Health Expenditure Per Capita (USD)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Maternal Mortality Ratio (per 100,000 live births)', fontsize=12, fontweight='bold')
    ax.set_title('Relationship Between Government Health Spending and Maternal Mortality (2023)\n'
                 'Moderate negative correlation (r = -0.47): Higher spending associated with lower mortality',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(title='Income Group', loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart18_spending_mmr_correlation.png')


# =============================================================================
# CHART 19: Cross-tabulation - UHC vs Threshold
# Highlight: All 31 countries with UHC<50% spent below half the threshold
# =============================================================================
def chart_uhc_threshold_crosstab(df):
    """Heatmap showing cross-tabulation of UHC and spending threshold."""
    df_2023 = df[df['year'] == 2023].copy()

    # Create categories
    df_2023['uhc_cat'] = pd.cut(df_2023['Universal health coverage'],
                                 bins=[0, 50, 100], labels=['UHC < 50%', 'UHC >= 50%'])

    # Calculate spending as % of threshold
    df_2023['spending_pct'] = (df_2023['Gov exp Health per capita'] / df_2023['income_threshold'] * 100)
    df_2023['spending_cat'] = pd.cut(df_2023['spending_pct'],
                                      bins=[0, 50, 100, float('inf')],
                                      labels=['<50% of threshold', '50-100% of threshold', '>100% of threshold'])

    # Create cross-tabulation
    crosstab = pd.crosstab(df_2023['uhc_cat'], df_2023['spending_cat'])

    fig, ax = plt.subplots(figsize=(10, 6))

    sns.heatmap(crosstab, annot=True, fmt='d', cmap='RdYlGn', ax=ax,
                annot_kws={'size': 16, 'weight': 'bold'},
                cbar_kws={'label': 'Number of Countries'})

    ax.set_xlabel('Government Health Spending (as % of Income-Specific Threshold)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Universal Health Coverage', fontsize=12, fontweight='bold')
    ax.set_title('Cross-tabulation: UHC Level vs Government Health Spending (2023)\n'
                 'All countries with UHC below 50% spent below the income-specific threshold',
                 fontsize=14, fontweight='bold', pad=20)

    plt.tight_layout()
    save_chart(fig, 'chart19_uhc_threshold_crosstab.png')


# =============================================================================
# CHART 20: MMR by Income Group
# Highlight: LIC 388.9 vs Upper-middle 41.9 (9x difference)
# =============================================================================
def chart_mmr_by_income(df):
    """Bar chart showing MMR by income group."""
    df_2023 = df[df['year'] == 2023]

    income_mmr = df_2023.groupby('income')['Maternal mortality ratio'].mean().reset_index()
    income_mmr.columns = ['income', 'avg_mmr']

    order = ['Low', 'Lower-middle', 'Upper-middle']
    income_mmr['income'] = pd.Categorical(income_mmr['income'], categories=order, ordered=True)
    income_mmr = income_mmr.sort_values('income')

    fig, ax = plt.subplots(figsize=(10, 6))

    colors = [INCOME_COLORS.get(inc, COLORS['neutral']) for inc in income_mmr['income']]
    bars = ax.bar(income_mmr['income'], income_mmr['avg_mmr'], color=colors, edgecolor='white', width=0.6)

    # Add data labels
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.1f}',
                    xy=(bar.get_x() + bar.get_width()/2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=14, fontweight='bold')

    # Add SDG target line
    ax.axhline(y=70, color=COLORS['success'], linestyle='--', linewidth=2, label='SDG Target (70)')

    # Add disparity annotation
    lic = income_mmr[income_mmr['income'] == 'Low']['avg_mmr'].values[0]
    umic = income_mmr[income_mmr['income'] == 'Upper-middle']['avg_mmr'].values[0]
    ratio = lic / umic
    ax.annotate(f'{ratio:.0f}x disparity', xy=(1, (lic + umic)/2), fontsize=12, fontweight='bold',
                color=COLORS['danger'])

    ax.set_xlabel('Income Group', fontsize=12, fontweight='bold')
    ax.set_ylabel('Maternal Mortality Ratio (per 100,000 live births)', fontsize=12, fontweight='bold')
    ax.set_title('Maternal Mortality by Income Group (2023)\n'
                 'Low-income countries have ~9 times higher MMR than upper-middle income countries',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart20_mmr_by_income.png')


# =============================================================================
# CHART 21: MMR vs Spending Cross-tabulation
# Highlight: 93% (43/46) not meeting SDG MMR spent <50% of threshold
# =============================================================================
def chart_mmr_spending_crosstab(df):
    """Bar chart showing MMR achievement vs spending level."""
    df_2023 = df[df['year'] == 2023].copy()

    # Calculate spending as % of threshold
    df_2023['spending_pct'] = (df_2023['Gov exp Health per capita'] / df_2023['income_threshold'] * 100)
    df_2023['spending_cat'] = df_2023['spending_pct'].apply(
        lambda x: '<50% of threshold' if x < 50 else '>=50% of threshold')

    df_2023['mmr_cat'] = df_2023['Maternal mortality ratio'].apply(
        lambda x: 'Met SDG Target (MMR ≤ 70)' if x <= 70 else 'Not Met SDG Target (MMR > 70)')

    # Cross-tabulation
    crosstab = pd.crosstab(df_2023['mmr_cat'], df_2023['spending_cat'])

    fig, ax = plt.subplots(figsize=(12, 6))

    x = np.arange(len(crosstab.columns))
    width = 0.35

    colors = [COLORS['success'], COLORS['danger']]
    for i, (idx, row) in enumerate(crosstab.iterrows()):
        offset = (i - 0.5) * width
        bars = ax.bar(x + offset, row, width, label=idx, color=colors[i], edgecolor='white')

        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{int(height)}',
                        xy=(bar.get_x() + bar.get_width()/2, height),
                        xytext=(0, 3), textcoords="offset points",
                        ha='center', va='bottom', fontsize=12, fontweight='bold')

    ax.set_xlabel('Government Health Spending Level', fontsize=12, fontweight='bold')
    ax.set_ylabel('Number of Countries', fontsize=12, fontweight='bold')
    ax.set_title('Maternal Mortality SDG Achievement vs Government Health Spending (2023)\n'
                 '93% (43/46) of countries not meeting SDG MMR target spent less than 50% of the threshold',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(crosstab.columns)
    ax.legend(loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart21_mmr_spending_crosstab.png')


# =============================================================================
# CHART 22: Sub-regional Threshold Achievement
# Highlight: Eastern, Northern, and Western Africa each have 1 country meeting threshold
# =============================================================================
def chart_threshold_by_subregion(df):
    """Stacked bar showing threshold achievement by subregion."""
    df_2023 = df[df['year'] == 2023]

    subregion_data = df_2023.groupby('Subregion').agg({
        'Gov exp Health per capita More than Threshold': ['sum', 'count']
    }).reset_index()
    subregion_data.columns = ['Subregion', 'meeting', 'total']
    subregion_data['not_meeting'] = subregion_data['total'] - subregion_data['meeting']

    fig, ax = plt.subplots(figsize=(12, 6))

    x = np.arange(len(subregion_data))
    width = 0.6

    bars1 = ax.bar(x, subregion_data['not_meeting'], width, label='Not Meeting Threshold',
                   color=COLORS['danger'], edgecolor='white')
    bars2 = ax.bar(x, subregion_data['meeting'], width, bottom=subregion_data['not_meeting'],
                   label='Meeting Threshold', color=COLORS['success'], edgecolor='white')

    # Add labels
    for i, (not_meeting, meeting) in enumerate(zip(subregion_data['not_meeting'],
                                                    subregion_data['meeting'])):
        if not_meeting > 0:
            ax.text(i, not_meeting/2, f'{int(not_meeting)}', ha='center', va='center',
                    fontsize=11, fontweight='bold', color='white')
        if meeting > 0:
            ax.text(i, not_meeting + meeting/2, f'{int(meeting)}', ha='center', va='center',
                    fontsize=11, fontweight='bold', color='white')

    ax.set_xlabel('Sub-region', fontsize=12, fontweight='bold')
    ax.set_ylabel('Number of Countries', fontsize=12, fontweight='bold')
    ax.set_title('Government Health Spending Threshold Achievement by Sub-region (2023)\n'
                 'Eastern, Northern, and Western Africa each have 1 country meeting the threshold',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(subregion_data['Subregion'], rotation=15, ha='right')
    ax.legend(loc='upper right')

    plt.tight_layout()
    save_chart(fig, 'chart22_threshold_by_subregion.png')


# =============================================================================
# CHART 23: Spending Range - Highest vs Lowest
# Highlight: Highest exceeds USD 500, lowest USD 3
# =============================================================================
def chart_spending_range(df):
    """Bar chart showing spending range in 2023."""
    df_2023 = df[df['year'] == 2023][['location', 'Gov exp Health per capita']].dropna()
    df_2023 = df_2023.sort_values('Gov exp Health per capita', ascending=True)

    # Get top 5 and bottom 5
    bottom5 = df_2023.head(5)
    top5 = df_2023.tail(5)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

    # Bottom 5
    bars1 = ax1.barh(bottom5['location'], bottom5['Gov exp Health per capita'],
                     color=COLORS['danger'], edgecolor='white')
    for bar in bars1:
        width = bar.get_width()
        ax1.annotate(f'${width:.1f}',
                     xy=(width, bar.get_y() + bar.get_height()/2),
                     xytext=(5, 0), textcoords="offset points",
                     ha='left', va='center', fontsize=11, fontweight='bold')
    ax1.set_xlabel('USD per capita', fontsize=12, fontweight='bold')
    ax1.set_title('Lowest 5 Countries', fontsize=12, fontweight='bold')
    ax1.set_xlim(0, 30)

    # Top 5
    bars2 = ax2.barh(top5['location'], top5['Gov exp Health per capita'],
                     color=COLORS['success'], edgecolor='white')
    for bar in bars2:
        width = bar.get_width()
        ax2.annotate(f'${width:.1f}',
                     xy=(width, bar.get_y() + bar.get_height()/2),
                     xytext=(5, 0), textcoords="offset points",
                     ha='left', va='center', fontsize=11, fontweight='bold')
    ax2.set_xlabel('USD per capita', fontsize=12, fontweight='bold')
    ax2.set_title('Highest 5 Countries', fontsize=12, fontweight='bold')

    fig.suptitle('Government Health Spending Per Capita: Highest vs Lowest Countries (2023)\n'
                 'More than 100-fold variation: from ~$3 to over $500 per capita',
                 fontsize=14, fontweight='bold', y=1.02)

    plt.tight_layout()
    save_chart(fig, 'chart23_spending_range.png')


# =============================================================================
# MAIN FUNCTION
# =============================================================================
def generate_all_charts():
    """Generate all charts for the health financing highlights."""
    print("=" * 70)
    print("GENERATING HEALTH FINANCING HIGHLIGHT CHARTS")
    print("=" * 70)

    print("\nLoading data...")
    df = load_data()
    print(f"Loaded {len(df)} records for {df['location'].nunique()} countries")

    print("\nGenerating charts...")

    # Generate all charts
    chart_threshold_by_year(df)
    chart_threshold_by_income_2023(df)
    chart_spending_gap_trend(df)
    chart_abuja_comparison(df)
    chart_abuja_countries_trend(df)
    chart_oop_threshold_2023(df)
    chart_gap_by_subregion(df)
    chart_gini_by_income(df)
    chart_budget_gap_by_income(df)
    chart_budget_gap_by_subregion(df)
    chart_oop_protection_trend(df)
    chart_financing_sources(df)
    chart_uhc_trend(df)
    chart_uhc_by_country(df)
    chart_mmr_trend(df)
    chart_mmr_on_course(df)
    chart_spending_uhc_correlation(df)
    chart_spending_mmr_correlation(df)
    chart_uhc_threshold_crosstab(df)
    chart_mmr_by_income(df)
    chart_mmr_spending_crosstab(df)
    chart_threshold_by_subregion(df)
    chart_spending_range(df)

    print("\n" + "=" * 70)
    print(f"All charts saved to: {OUTPUT_DIR}")
    print("=" * 70)


if __name__ == "__main__":
    generate_all_charts()
