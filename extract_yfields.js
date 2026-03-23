const fs = require('fs');
const content = fs.readFileSync('frontend/health-financing-dashboard/src/config/charts.ts', 'utf8');
const yFields = new Set();
const regex = /yField:\s*(?:'([^']+)'|\[([^\]]+)\])/g;
let match;
while ((match = regex.exec(content)) !== null) {
  if (match[1]) {
    yFields.add(match[1]);
  } else if (match[2]) {
    match[2].split(',').forEach(field => {
      const cleaned = field.trim().replace(/'/g, '');
      if (cleaned) yFields.add(cleaned);
    });
  }
}
console.log('Total unique indicators in charts:', yFields.size);
console.log('\nIndicators by theme:\n');
Array.from(yFields).sort().forEach(f => console.log(f));
