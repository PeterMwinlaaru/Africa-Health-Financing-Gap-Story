const fs = require('fs');
const content = fs.readFileSync('frontend/health-financing-dashboard/src/config/charts.ts', 'utf8');

// Extract all charts with their topicId and yField
const chartRegex = /{\s*id:[^}]*topicId:\s*'([^']+)'[^}]*yField:\s*(?:'([^']+)'|\[([^\]]+)\])/gs;
const charts = [];
let match;

while ((match = chartRegex.exec(content)) !== null) {
  const topicId = match[1];
  if (match[2]) {
    charts.push({ topicId, yField: match[2] });
  } else if (match[3]) {
    match[3].split(',').forEach(field => {
      const cleaned = field.trim().replace(/'/g, '');
      if (cleaned) charts.push({ topicId, yField: cleaned });
    });
  }
}

// Group by topic
const byTopic = {};
charts.forEach(chart => {
  if (!byTopic[chart.topicId]) byTopic[chart.topicId] = new Set();
  byTopic[chart.topicId].add(chart.yField);
});

// Map topic IDs to theme numbers
const themeMap = {
  'public-health-financing': '3.1',
  'budget-priority': '3.2',
  'financial-protection': '3.3',
  'financing-structure': '3.4',
  'uhc-index': '3.5',
  'health-outcomes': '3.6',
  'financing-uhc': '3.7',
  'financing-outcomes': '3.8',
  'structure-uhc': '3.9',
  'structure-outcomes': '3.10',
  'fiscal-space': '3.11'
};

console.log('Indicators by Theme:\n');
Object.keys(themeMap).sort((a, b) => themeMap[a].localeCompare(themeMap[b])).forEach(topicId => {
  const indicators = byTopic[topicId];
  if (indicators) {
    console.log(`${themeMap[topicId]} ${topicId} (${indicators.size} indicators):`);
    Array.from(indicators).sort().forEach(ind => console.log(`  - ${ind}`));
    console.log('');
  }
});

console.log('\nTotal unique indicators:', new Set(charts.map(c => c.yField)).size);
