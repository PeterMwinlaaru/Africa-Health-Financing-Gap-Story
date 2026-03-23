# Our World in Data-Style Platform Architecture

## URL Structure (Like OWID)

```
/                                   → Landing page (featured charts & topics)
/charts                             → Browse all charts
/chart/public-health-expenditure    → Individual chart page
/chart/uhc-index-trends             → Individual chart page
/chart/abuja-declaration-progress   → Individual chart page
/explorer                           → Data Explorer tool
/topics/public-health-financing     → Topic page
/topics/budget-priority             → Topic page
/countries                          → All countries list
/country/nigeria                    → Country profile page
/about                              → About & methodology
/sources                            → Data sources
```

## Page Types

### 1. Landing Page (`/`)
- Hero section with key insight
- Featured charts (3-4 highlighted visualizations)
- Topic cards (10 indicator categories)
- Latest updates
- Call-to-action to explore data

### 2. Individual Chart Pages (`/chart/[slug]`)
Each chart gets its own page with:
- **Interactive chart** (full width, responsive)
- **Title & subtitle**
- **Narrative section** - "What you should know about this data"
- **Key insights** - 3-5 bullet points
- **Chart controls:**
  - Country/region selector
  - Time range slider
  - Chart type toggle (line, bar, map)
  - Add country comparison
- **Data sources** - with links
- **Download options** - CSV, PNG, SVG
- **Share/Embed** - Get embed code
- **Related charts** - 3-4 similar visualizations
- **Methodology** - How we calculated this

### 3. Data Explorer (`/explorer`)
Interactive tool:
- **Step 1:** Select indicator(s) from dropdown
- **Step 2:** Select countries (multi-select)
- **Step 3:** Select time range
- **Step 4:** Choose chart type
- **Live preview** updates as you select
- **Generate chart** button
- **Export options** - Download or get embed code

### 4. Topic Pages (`/topics/[category]`)
For each of 10 indicator categories:
- Topic overview and importance
- 4-6 key charts for this topic
- Key insights and findings
- Related topics
- Deep-dive articles (if available)

### 5. Chart Library (`/charts`)
Browsable grid of all charts:
- Filter by topic
- Filter by country
- Search functionality
- Sort by relevance, date, popularity
- Thumbnail preview

### 6. Country Profiles (`/country/[name]`)
- Country overview
- All indicators for this country
- Time-series trends
- Regional comparison
- Key achievements and gaps
- Related countries

## Components Architecture

```
components/
├── Layout/
│   ├── Header.tsx           - Top navigation
│   ├── Footer.tsx           - Footer with links
│   └── Breadcrumb.tsx       - Breadcrumb navigation
├── Charts/
│   ├── ChartRenderer.tsx    - Universal chart component
│   ├── LineChart.tsx        - Time series
│   ├── BarChart.tsx         - Comparisons
│   ├── MapChart.tsx         - Geographic
│   └── ChartControls.tsx    - Interactive controls
├── DataExplorer/
│   ├── IndicatorSelector.tsx
│   ├── CountrySelector.tsx
│   ├── TimeRangeSelector.tsx
│   └── ChartTypeSelector.tsx
├── ChartPage/
│   ├── ChartContainer.tsx
│   ├── NarrativeSection.tsx
│   ├── InsightsPanel.tsx
│   ├── SourcesPanel.tsx
│   ├── DownloadPanel.tsx
│   └── RelatedCharts.tsx
└── Common/
    ├── Card.tsx
    ├── Button.tsx
    └── ShareButton.tsx

pages/
├── Home.tsx                 - Landing page
├── ChartLibrary.tsx         - Browse all charts
├── ChartPage.tsx            - Individual chart view
├── DataExplorer.tsx         - Interactive explorer
├── TopicPage.tsx            - Topic overview
├── CountryProfile.tsx       - Country page
├── About.tsx                - About & methodology
└── Sources.tsx              - Data sources

```

## Chart Configuration

Each chart is defined by a configuration object:

```typescript
interface ChartConfig {
  id: string;
  slug: string;  // URL-friendly
  title: string;
  subtitle: string;
  category: string;  // Topic category
  narrative: string;  // Explanation
  insights: string[];  // Key findings
  dataEndpoint: string;  // API endpoint
  chartType: 'line' | 'bar' | 'map' | 'scatter';
  xAxis: string;  // Data field
  yAxis: string;  // Data field
  sources: Source[];
  relatedCharts: string[];  // Chart IDs
  methodology: string;
}
```

## Data Flow

```
User visits /chart/uhc-index-trends
    ↓
Router loads ChartPage component with slug
    ↓
ChartPage fetches chart config
    ↓
ChartPage calls API endpoint for data
    ↓
ChartRenderer displays interactive chart
    ↓
User can filter, download, share
```

## Key Differences from Dashboard Approach

| Dashboard (Old) | OWID-Style (New) |
|----------------|------------------|
| Single page with all charts | Individual pages per chart |
| Limited narrative | Rich explanatory text |
| Basic filtering | Advanced Data Explorer |
| No sharing | Share/embed every chart |
| Chart-focused | Story-focused |
| One-size-fits-all | Customizable views |

## Implementation Priority

### Phase 1 (Core OWID Features)
1. ✅ Landing page
2. ✅ Individual chart pages (5-10 key charts)
3. ✅ Chart library/browse
4. ✅ Basic Data Explorer
5. ✅ Topic pages

### Phase 2 (Enhanced Features)
6. Country profiles
7. Advanced Data Explorer
8. Maps integration
9. Share/embed functionality
10. Chart comparison tool

### Phase 3 (Advanced)
11. Article/story pages
12. Animated time-series
13. Custom chart builder
14. API documentation
15. Mobile app

## Success Metrics

A successful OWID-style platform should:
- ✅ Each chart has a unique, shareable URL
- ✅ Users can explore data interactively
- ✅ Narrative explains the "why" not just "what"
- ✅ Charts can be embedded in other sites
- ✅ Easy to discover related content
- ✅ Data is downloadable
- ✅ Sources are clearly cited

This architecture prioritizes **content discovery** and **storytelling** over dashboard metrics.
