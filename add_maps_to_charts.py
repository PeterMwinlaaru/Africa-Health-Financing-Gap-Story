"""
Add targetAchievementMap data to charts.ts
"""
import json
import re
from pathlib import Path

# Read the map data
maps_path = Path(r"C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\target_achievement_maps.json")
with open(maps_path, 'r') as f:
    maps_data = json.load(f)

# Read charts.ts
charts_path = Path(r"C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\frontend\health-financing-dashboard\src\config\charts.ts")
with open(charts_path, 'r', encoding='utf-8') as f:
    charts_content = f.read()

# Map slugs to search patterns
slug_patterns = {
    'government-health-budget-share': r'(slug: \'government-health-budget-share\'.*?geographicPatterns: \{.*?clustering: "[^"]+")(\s*\})',
    'government-health-expenditure-gdp-share': r'(slug: \'government-health-expenditure-gdp-share\'.*?geographicPatterns: \{.*?clustering: "[^"]+")(\s*\})',
    'out-of-pocket-expenditure-share': r'(slug: \'out-of-pocket-expenditure-share\'.*?geographicPatterns: \{.*?clustering: "[^"]+")(\s*\})',
    'external-health-financing-share': r'(slug: \'external-health-financing-share\'.*?geographicPatterns: \{.*?clustering: "[^"]+")(\s*\})',
    'uhc-service-coverage-index': r'(slug: \'uhc-service-coverage-index\'.*?geographicPatterns: \{.*?clustering: "[^"]+")(\s*\})',
    'neonatal-mortality-rate-trends': r'(slug: \'neonatal-mortality-rate-trends\'.*?geographicPatterns: \{.*?clustering: "[^"]+")(\s*\})',
    'maternal-mortality-ratio-trends': r'(slug: \'maternal-mortality-ratio-trends\'.*?geographicPatterns: \{.*?clustering: "[^"]+")(\s*\})'
}

def format_map_data(map_obj):
    """Format map data as TypeScript object"""
    lines = [',', '        targetAchievementMap: {']
    for country, data in sorted(map_obj.items()):
        status = data['status']
        percent = data['percentBelow']
        lines.append(f'          "{country}": {{ status: "{status}", percentBelow: {percent} }},')
    # Remove trailing comma from last line
    lines[-1] = lines[-1].rstrip(',')
    lines.append('        }')
    return '\n'.join(lines)

# Process each chart
for slug, pattern in slug_patterns.items():
    if slug in maps_data:
        print(f"Adding map data for: {slug}")
        map_str = format_map_data(maps_data[slug])

        # Find and replace
        def replacer(match):
            return match.group(1) + map_str + '\n      }'

        charts_content = re.sub(pattern, replacer, charts_content, flags=re.DOTALL)

# Write back
with open(charts_path, 'w', encoding='utf-8') as f:
    f.write(charts_content)

print("\n" + "="*80)
print("Successfully added target achievement maps to all charts!")
print("="*80)
