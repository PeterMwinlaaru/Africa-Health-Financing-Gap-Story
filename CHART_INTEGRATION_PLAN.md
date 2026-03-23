# Chart Integration Plan
**Health Financing Gap Analysis Platform**
**Date**: March 20, 2026

## Overview
This document outlines the integration plan for adding 14 charts created today (scorecard and expenditure-outcome analysis charts) into the web platform, organized by the 11 thematic areas.

---

## Charts Created Today

### **Scorecard & Primary Charts (5)**
1. `scorecard_heatmap.png` - Shows 4 key compliance thresholds
2. `criteria_met_summary.png` - Bar chart of countries meeting criteria
3. `indicator_compliance.png` - Stacked bar showing compliance rates
4. `performance_by_indicator.png` - Faceted performance chart
5. `top_performers.png` - Lollipop chart of top performers

### **Expenditure-Outcome Heatmaps (4)**
6. `expenditure_below50_outcomes.png` - Countries <50% of threshold
7. `expenditure_50to75_outcomes.png` - Countries 50-74.9% of threshold
8. `expenditure_75to100_outcomes.png` - Countries 75-99.9% of threshold
9. `expenditure_meets_outcomes.png` - Countries meeting threshold

### **Alternative Visualizations (5)**
10. `alt_scatter_expenditure_outcomes.png` - Scatter plot
11. `alt_grouped_bar_outcomes.png` - Grouped bar chart
12. `alt_faceted_dot_outcomes.png` - Faceted dot plot
13. `alt_stacked_outcome_profile.png` - Stacked bar
14. `alt_bubble_multidimensional.png` - Bubble chart

---

## Chart-to-Theme Mapping

### **Theme 3.1 - Public Health Financing**
**Charts to Add:**
- `scorecard_heatmap.png` (Per Capita section only)
- `performance_by_indicator.png` (Per Capita facet)
- `criteria_met_summary.png` (shows threshold compliance)

**New Indicators:**
- 3.1.4 - Scorecard: Countries Meeting Per Capita Threshold
- 3.1.5 - Performance by Income Level

---

### **Theme 3.2 - Budgetary Priority (Abuja Declaration)**
**Charts to Add:**
- `scorecard_heatmap.png` (>15% Budget section)
- `indicator_compliance.png` (Abuja compliance bar)
- `performance_by_indicator.png` (Budget facet)

**New Indicators:**
- 3.2.4 - Scorecard: Countries Meeting Abuja Target
- 3.2.5 - Compliance Rates by Category

---

### **Theme 3.3 - Financial Protection**
**Charts to Add:**
- `scorecard_heatmap.png` (OOP <20% section)
- `indicator_compliance.png` (OOP protection bar)
- `performance_by_indicator.png` (OOP facet)

**New Indicators:**
- 3.3.5 - Scorecard: Countries with OOP Below 20%
- 3.3.6 - Financial Protection Rates

---

### **Theme 3.5 - UHC Index**
**Charts to Add:**
- `expenditure_below50_outcomes.png` (UHC column)
- `expenditure_50to75_outcomes.png` (UHC column)
- `expenditure_75to100_outcomes.png` (UHC column)
- `expenditure_meets_outcomes.png` (UHC column)
- `alt_grouped_bar_outcomes.png` (UHC bars)

**New Indicators:**
- 3.5.4 - UHC Achievement by Expenditure Category
- 3.5.5 - UHC Rates Across Spending Levels

---

### **Theme 3.6 - Health Outcomes (NMR/MMR)**
**Charts to Add:**
- All 4 expenditure-outcome heatmaps (NMR & MMR columns)
- `alt_faceted_dot_outcomes.png` (shows actual NMR/MMR values)
- `alt_grouped_bar_outcomes.png` (NMR/MMR bars)

**New Indicators:**
- 3.6.5 - NMR Achievement by Expenditure Category
- 3.6.6 - MMR Achievement by Expenditure Category
- 3.6.7 - Mortality Outcomes vs Expenditure

---

### **Theme 3.7 - Financing Dimensions × UHC**
**Charts to Add:**
- `alt_scatter_expenditure_outcomes.png` (main correlation)
- `alt_bubble_multidimensional.png` (3D view with UHC)
- `alt_grouped_bar_outcomes.png` (UHC achievement rates)
- All 4 expenditure-outcome heatmaps (showing UHC correlation)

**New Indicators:**
- 3.7.4 - Expenditure vs UHC Correlation Analysis
- 3.7.5 - Multi-dimensional UHC Relationships
- 3.7.6 - UHC Achievement by Expenditure Tier

---

### **Theme 3.8 - Financing Dimensions × Health Outcomes**
**Charts to Add:**
- All 4 expenditure-outcome heatmaps (NMR & MMR analysis)
- `alt_scatter_expenditure_outcomes.png` (outcomes correlation)
- `alt_stacked_outcome_profile.png` (outcome achievement distribution)
- `alt_faceted_dot_outcomes.png` (actual outcome values)
- `alt_grouped_bar_outcomes.png` (NMR/MMR achievement rates)

**New Indicators:**
- 3.8.3 - Expenditure vs Mortality Outcomes
- 3.8.4 - Outcome Achievement Distribution
- 3.8.5 - NMR/MMR by Expenditure Category

---

### **Theme 3.9 - Structure × UHC**
**Charts to Add:**
- `top_performers.png` (shows multi-criteria success)

**New Indicators:**
- 3.9.6 - Top Performing Countries (Multiple Criteria)

---

### **Theme 3.10 - Structure × Outcomes**
**Charts to Add:**
- `top_performers.png` (shows outcome achievement)

**New Indicators:**
- 3.10.11 - Top Outcome Achievers

---

## Implementation Steps

### **Step 1: Copy Chart Images to Platform**
```bash
# Copy charts to public/charts directory
mkdir -p "frontend/health-financing-dashboard/public/charts/scorecard"
cp "reports/charts_v2_R/alternative_visualizations/*.png" "frontend/health-financing-dashboard/public/charts/scorecard/"
```

### **Step 2: Create StaticChart Component**
Create a new component to display static image charts:
```
frontend/health-financing-dashboard/src/components/StaticChart/StaticChart.tsx
```

**Features:**
- Display static PNG images
- Maintain responsive sizing
- Include download button
- Show metadata (date, methodology)

### **Step 3: Update charts.ts Configuration**
Add chart configurations for each new chart:

```typescript
{
  id: 'scorecard-heatmap-31',
  slug: 'scorecard-per-capita-compliance',
  title: 'Per Capita Expenditure Scorecard',
  subtitle: 'Countries meeting income-specific per capita thresholds (2023)',
  topicId: 'public-health-financing',
  indicatorNumber: '3.1.4',
  narrative: `This scorecard shows which countries meet their income-specific per capita health expenditure thresholds...`,
  insights: [
    'Only 3 countries (5.6%) meet their per capita threshold',
    'Cabo Verde, Seychelles, and Tunisia are the only countries achieving this benchmark',
    'Income-specific thresholds: Low=$112, Lower-middle=$146, Upper-middle=$477'
  ],
  dataEndpoint: 'static', // Indicates this is a static image
  chartType: 'static-image',
  staticImagePath: '/charts/scorecard/scorecard_heatmap.png',
  xField: 'country',
  yField: 'indicator',
  sources: [...],
  relatedCharts: ['gov-health-exp-per-capita', 'health-financing-gap'],
  methodology: 'Generated from 2023 data using R script. Countries sorted with successful performers at top.',
  disaggregations: ['income', 'indicator']
}
```

### **Step 4: Update InlineChart Component**
Modify `InlineChart.tsx` to handle static images:

```typescript
if (config.chartType === 'static-image') {
  return <StaticChart imagePath={config.staticImagePath} config={config} />;
}
```

### **Step 5: Add Routes (if needed)**
If creating dedicated pages for scorecard analysis:
```typescript
<Route path="/scorecard" element={<ScorecardPage />} />
<Route path="/expenditure-outcomes" element={<ExpenditureOutcomesPage />} />
```

### **Step 6: Update Navigation**
Add links to new chart sections in:
- ChartLibrary page
- Topic pages (under appropriate sections)
- Home page (if featured)

---

## Technical Specifications

### **Image Specifications:**
- **Format**: PNG
- **Resolution**: 300 DPI
- **Dimensions**: Variable (10-14 inches wide)
- **Size**: 100-400 KB per image
- **Location**: `public/charts/scorecard/`

### **Component Structure:**
```
src/
  components/
    StaticChart/
      StaticChart.tsx
      StaticChart.css
  config/
    charts.ts (updated with 14 new chart configs)
  pages/
    ScorecardPage/ (optional new page)
      ScorecardPage.tsx
```

### **API Requirements:**
- No new API endpoints needed (static images)
- Existing metadata API can provide context

---

## Priority Order

### **Phase 1: High Priority (Theme 3.1, 3.2, 3.3)**
1. Scorecard heatmap integration
2. Compliance rate charts
3. Performance by indicator charts

### **Phase 2: Medium Priority (Theme 3.7, 3.8)**
4. All 4 expenditure-outcome heatmaps
5. Scatter and grouped bar charts

### **Phase 3: Lower Priority (Alternatives)**
6. Bubble chart
7. Faceted dot plots
8. Stacked profile charts

---

## Testing Checklist

- [ ] All chart images display correctly
- [ ] Responsive on mobile devices
- [ ] Download functionality works
- [ ] Chart metadata loads properly
- [ ] Navigation links work
- [ ] Related charts link correctly
- [ ] Performance (page load times acceptable)
- [ ] Accessibility (alt text, screen readers)

---

## Benefits of Integration

1. **Comprehensive Coverage**: All 11 themes now have visual analytics
2. **Multiple Perspectives**: Same data shown in different chart types
3. **Static Performance**: PNG images load faster than dynamic charts
4. **Publication Ready**: High-resolution charts suitable for reports
5. **User Choice**: Multiple visualization options for different audiences

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Approve chart selections** for each theme
3. **Execute Step 1**: Copy images to platform
4. **Execute Step 2**: Create StaticChart component
5. **Execute Step 3**: Update chart configurations
6. **Test integration** on local server
7. **Deploy to production**

---

## Estimated Timeline

- Step 1-2: 2 hours (component creation)
- Step 3: 4 hours (14 chart configurations)
- Step 4-5: 2 hours (component integration)
- Step 6: 1 hour (testing)
- **Total**: ~9 hours of development work

---

## Contact

For questions about this integration plan:
- Generated: March 20, 2026
- Charts Location: `reports/charts_v2_R/alternative_visualizations/`
- Script: `scripts/generate_scorecard.R`
