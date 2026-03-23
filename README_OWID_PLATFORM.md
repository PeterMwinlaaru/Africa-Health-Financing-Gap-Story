# Africa Health Financing Gap Platform - Our World in Data Style

> **A content-rich, story-driven data platform** - Not a dashboard!

## 🎯 What Makes This "Our World in Data"-Style?

This platform follows the **Our World in Data philosophy**: Each chart tells a story, has its own page, and is sharable and embeddable.

### Key Differences from a Dashboard

| Dashboard Approach | Our World in Data Approach |
|-------------------|---------------------------|
| ✗ All charts on one page | ✓ Each chart has its own dedicated page |
| ✗ Limited context | ✓ Rich narrative with every chart |
| ✗ Chart-focused | ✓ Story-focused with data supporting narratives |
| ✗ Generic filtering | ✓ Custom Data Explorer tool |
| ✗ Static views | ✓ Sharable, embeddable individual charts |
| ✗ Numbers-first | ✓ Insights-first with context |

## 📊 Platform Structure

```
https://yoursite.com/
├── /                              → Landing page with featured insights
├── /charts                        → Browse all charts library
├── /chart/[slug]                  → Individual chart page (CORE FEATURE)
│   ├── Interactive visualization
│   ├── Narrative explanation
│   ├── Key insights
│   ├── Data sources
│   ├── Methodology
│   ├── Download options
│   └── Related charts
├── /explorer                      → Data Explorer tool
├── /topics/[category]             → Topic landing pages
├── /about                         → About & methodology
└── /sources                       → Data sources
```

## ✨ Core Features

### 1. Individual Chart Pages (Like OWID)

Each indicator gets its own dedicated URL:
- `/chart/public-health-expenditure-trends`
- `/chart/abuja-declaration-progress`
- `/chart/uhc-index-trends`
- etc.

**Every chart page includes:**
- 📊 Interactive visualization (line, bar, pie charts)
- 📝 "What you should know" narrative section
- 💡 Key insights (bullet points)
- 📚 Data sources with links
- 🔬 Methodology explanation
- 📥 Download data (CSV)
- 🔗 Share/Embed buttons
- 🔄 Related charts suggestions

### 2. Landing Page

Features:
- Hero section with key finding
- Featured charts (3 most important)
- Browse by topic cards
- Statistics overview
- Call-to-action to Data Explorer

### 3. Data Explorer

Interactive tool to create custom visualizations:
- Select indicator from dropdown
- Choose multiple countries (up to 5)
- Auto-generates line chart
- Export custom data

### 4. Chart Library

Browse all available charts:
- Filter by topic/category
- Search functionality (future)
- Grid view with thumbnails
- Quick access to all visualizations

### 5. Topic Pages

One page per indicator category:
- Public Health Financing
- Budget Priority
- Financial Protection
- Financing Structure
- Universal Health Coverage
- Health Outcomes
- Cross-Dimensional Analysis
- Fiscal Space

## 🚀 Quick Start

### Running the Platform

```bash
# Start backend (Terminal 1)
cd backend
npm start

# Start frontend (Terminal 2)
cd frontend/health-financing-dashboard
npm start
```

Visit: `http://localhost:3000`

### Or use the startup script:
```bash
# Just double-click
start.bat
```

## 📖 How to Use the Platform

### For End Users

1. **Start at Home** - See featured insights and charts
2. **Explore Charts** - Click any chart to see full analysis
3. **Read the Story** - Each chart page explains the data
4. **Download Data** - Get CSV for your own analysis
5. **Use Data Explorer** - Create custom comparisons

### For Developers/Content Creators

#### Adding a New Chart

1. **Define the chart in `src/config/charts.ts`:**

```typescript
{
  id: 'your-chart-id',
  slug: 'your-chart-slug',
  title: 'Your Chart Title',
  subtitle: 'Brief description',
  category: 'Topic Category',
  narrative: `
    Multi-paragraph explanation of what this data means.

    Tell the story behind the numbers.
  `,
  insights: [
    'Key finding 1',
    'Key finding 2',
    'Key finding 3'
  ],
  dataEndpoint: '/data/master',
  chartType: 'line',
  xField: 'year',
  yField: 'indicator_name',
  sources: [
    {
      name: 'Source Name',
      url: 'https://source.com',
      description: 'What this source provides'
    }
  ],
  relatedCharts: ['other-chart-slug'],
  methodology: 'How we calculated this indicator',
  featured: true // Show on homepage
}
```

2. **Chart automatically appears:**
   - On homepage (if featured)
   - In chart library
   - In topic page
   - At `/chart/your-chart-slug`

3. **No additional coding needed!** The ChartPage component handles everything.

## 🎨 Chart Configuration System

### Available Chart Types

- `'line'` - Time series trends
- `'bar'` - Country comparisons, categorical data
- `'pie'` - Composition/distribution
- `'scatter'` - Correlation analysis (future)
- `'map'` - Geographic distribution (future)

### Example Configurations

**Time Series (All Countries Average):**
```typescript
chartType: 'line',
xField: 'year',
yField: 'Gov exp Health per capita',
groupBy: undefined  // Aggregates all countries
```

**Regional Comparison:**
```typescript
chartType: 'line',
xField: 'year',
yField: 'Universal health coverage',
groupBy: 'Subregion'  // One line per region
```

**Latest Year Bar Chart:**
```typescript
chartType: 'bar',
xField: 'location',  // Country names
yField: 'Gov exp Health on budget'  // Budget share
```

## 📁 File Structure

```
frontend/health-financing-dashboard/src/
├── config/
│   └── charts.ts              # All chart definitions (ADD NEW CHARTS HERE)
├── components/
│   └── Layout/
│       ├── Header.tsx         # Top navigation
│       └── Footer.tsx         # Footer with links
├── pages/
│   ├── Home/                  # Landing page
│   ├── ChartPage/             # Individual chart view (CORE)
│   ├── ChartLibrary/          # Browse all charts
│   ├── DataExplorer/          # Custom visualization tool
│   ├── TopicPage/             # Topic landing pages
│   ├── About/                 # About page
│   └── Sources/               # Data sources
├── services/
│   └── api.ts                 # API calls to backend
└── App.tsx                    # Main routing
```

## 🔑 Key Components

### ChartPage.tsx (Most Important!)

This is the heart of the OWID-style platform. It:
- Reads chart config from `charts.ts`
- Fetches data from API
- Processes data based on chart type
- Renders the visualization
- Shows narrative, insights, sources
- Provides download/share options
- Suggests related charts

**You rarely need to edit this file** - just add new chart configs!

### charts.ts (Where You Work)

This is where you define all charts. Each chart is a configuration object. The system handles the rest.

## 🎯 Content Philosophy

Following Our World in Data's approach:

1. **Narrative First** - Explain WHY the data matters
2. **Context Always** - What should readers know?
3. **Insights Over Numbers** - Highlight key findings
4. **Sources Matter** - Always cite data sources
5. **Methodology Transparency** - Explain how you calculated it
6. **Related Content** - Help users explore further

## 📊 Current Charts

**Featured:**
1. Public Health Expenditure Trends
2. Abuja Declaration Progress
3. UHC Index Trends

**Additional:**
4. Out-of-Pocket Expenditure
5. Health Financing Gap by Income
6. Health Financing Structure

**Easy to add more** - just add to `charts.ts`!

## 🔧 Customization

### Branding

Edit:
- `Header.tsx` - Logo and site name
- `App.css` - Global styles and colors
- Individual CSS files for page-specific styling

### Color Scheme

Main colors in `ChartPage.css` and other CSS files:
- Primary: `#3b82f6` (blue)
- Text: `#1e293b` (dark gray)
- Background: `#f8fafc` (light gray)

### Adding New Features

1. **Add new chart** → Edit `config/charts.ts`
2. **Add new page** → Create in `pages/` and add route to `App.tsx`
3. **Modify existing page** → Edit the page component

## 📈 Roadmap

### Phase 1 (Complete) ✅
- Individual chart pages
- Home page with featured content
- Chart library
- Data Explorer
- Topic pages
- Sources page

### Phase 2 (Next)
- Share/Embed functionality
- Animated time-series playback
- Interactive maps with Leaflet
- Search functionality
- Country profile pages
- PDF export

### Phase 3 (Future)
- Article/story pages
- Multi-chart comparisons
- Custom chart builder
- User accounts
- Comments/discussion

## 🎓 Learning from Our World in Data

Visit https://ourworldindata.org and notice:

1. Each chart has its own URL (we do this!)
2. Rich explanatory text (we have narrative sections!)
3. Sources clearly cited (we include sources!)
4. Related content suggestions (we have related charts!)
5. Data downloadable (we have CSV download!)
6. Professional, clean design (we follow their style!)

## 💡 Best Practices

### Writing Chart Narratives

❌ **Bad:** "This chart shows government health expenditure."

✅ **Good:** "Government health expenditure per capita is a critical indicator of a country's commitment to health. The international community has established minimum thresholds... Despite progress since 2000, many African countries still fall below these thresholds..."

### Writing Insights

❌ **Bad:** "Expenditure increased"

✅ **Good:** "Average public health expenditure has grown from ~$15 per capita in 2000 to ~$50 in 2023, but over 60% of African countries still fall below international minimum thresholds"

### Choosing Chart Types

- **Time trends** → Line chart
- **Country comparisons** → Bar chart
- **Composition** → Pie chart
- **Geographic patterns** → Map (future)
- **Correlations** → Scatter plot (future)

## 🚀 Deployment

When ready for production:

```bash
# Build frontend
cd frontend/health-financing-dashboard
npm run build

# Serve built files with backend
# Or deploy to static hosting (Netlify, Vercel, etc.)
```

## 📞 Support

For questions:
- Check `ARCHITECTURE.md` for detailed design
- Review `charts.ts` for chart examples
- See `ChartPage.tsx` for implementation

---

**Built with:** React, TypeScript, Recharts, Express, Node.js

**Inspired by:** Our World in Data's mission to make research and data accessible

**Last Updated:** March 17, 2026
