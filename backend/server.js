/**
 * Health Financing Gap API Server
 * ================================
 * Express server providing RESTful API endpoints for health financing data
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware (optional, based on environment)
if (process.env.ENABLE_REQUEST_LOGGING === 'true' || NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Base path for processed data
const DATA_PATH = process.env.DATA_PATH || '../processed_data';
const DATA_DIR = path.join(__dirname, DATA_PATH);

// Helper function to read JSON file
async function readJSONFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Failed to read file: ${filePath}`);
    }
}

// Helper function to filter data to 2000-2023 only
function filterYearRange(data) {
    if (!Array.isArray(data)) return data;
    return data.filter(d => d.year >= 2000 && d.year <= 2023);
}

// Helper function to recode 'High' income to 'Upper-middle' (Seychelles is the only High income country)
function recodeHighIncome(data) {
    if (!Array.isArray(data)) return data;
    return data.map(record => {
        const newRecord = { ...record };
        if (newRecord.income === 'High') {
            newRecord.income = 'Upper-middle';
        }
        // Also handle keys that are 'High' in aggregated data
        if (newRecord.High !== undefined) {
            newRecord['Upper-middle'] = (newRecord['Upper-middle'] || 0) + newRecord.High;
            delete newRecord.High;
        }
        return newRecord;
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Health Financing Gap API is running' });
});

// Get metadata
app.get('/api/metadata', async (req, res) => {
    try {
        const metadata = await readJSONFile(path.join(DATA_DIR, 'metadata.json'));
        res.json(metadata);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get master dataset
app.get('/api/data/master', async (req, res) => {
    try {
        const data = await readJSONFile(path.join(DATA_DIR, 'master_dataset.json'));

        // Filter out 2024 data (we only want 2000-2023) and recode High income
        let filteredData = recodeHighIncome(data.filter(d => d.year >= 2000 && d.year <= 2023));

        // Apply additional filters if provided

        if (req.query.year) {
            const years = Array.isArray(req.query.year) ? req.query.year.map(Number) : [Number(req.query.year)];
            filteredData = filteredData.filter(d => years.includes(d.year));
        }

        if (req.query.country) {
            const countries = Array.isArray(req.query.country) ? req.query.country : [req.query.country];
            filteredData = filteredData.filter(d => countries.includes(d.location));
        }

        if (req.query.income) {
            const incomes = Array.isArray(req.query.income) ? req.query.income : [req.query.income];
            filteredData = filteredData.filter(d => incomes.includes(d.income));
        }

        if (req.query.subregion) {
            const subregions = Array.isArray(req.query.subregion) ? req.query.subregion : [req.query.subregion];
            filteredData = filteredData.filter(d => subregions.includes(d.Subregion));
        }

        res.json(filteredData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get public health financing indicators
app.get('/api/indicators/public-health-financing', async (req, res) => {
    try {
        const countries_below = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'public_health_financing', 'countries_below_threshold.json'))));
        const avg_gap = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'public_health_financing', 'avg_gap.json'))));
        const gini = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'public_health_financing', 'gini.json'))));
        const range = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'public_health_financing', 'range.json'))));

        res.json({
            countries_below_threshold: countries_below,
            avg_gap,
            gini,
            range
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get budget priority indicators
app.get('/api/indicators/budget-priority', async (req, res) => {
    try {
        const countries_below = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'budget_priority', 'countries_below_abuja.json'))));
        const avg_gap = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'budget_priority', 'avg_gap.json'))));
        const gini = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'budget_priority', 'gini.json'))));
        const range = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'budget_priority', 'range.json'))));

        res.json({
            countries_below_abuja: countries_below,
            avg_gap,
            gini,
            range
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get financial protection indicators
app.get('/api/indicators/financial-protection', async (req, res) => {
    try {
        const countries_above = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'financial_protection', 'countries_above_oop_benchmark.json'))));
        const avg_gap = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'financial_protection', 'avg_gap.json'))));
        const gini = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'financial_protection', 'gini.json'))));
        const financial_hardship = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'financial_protection', 'financial_hardship.json'))));

        res.json({
            countries_above_oop_benchmark: countries_above,
            avg_gap,
            gini,
            financial_hardship
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get financing structure indicators
app.get('/api/indicators/financing-structure', async (req, res) => {
    try {
        const countries_gov_dominant = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'financing_structure', 'countries_gov_dominant.json'))));
        const avg_shares = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'financing_structure', 'avg_shares.json'))));

        res.json({
            countries_gov_dominant,
            avg_shares
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get UHC indicators
app.get('/api/indicators/uhc', async (req, res) => {
    try {
        const avg_uhc = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'uhc', 'avg_uhc.json'))));
        const countries_low_uhc = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'uhc', 'countries_low_uhc.json'))));
        const gini = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'uhc', 'gini.json'))));

        res.json({
            avg_uhc,
            countries_low_uhc,
            gini
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get health outcome indicators
app.get('/api/indicators/health-outcomes', async (req, res) => {
    try {
        const avg_nmr = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'health_outcomes', 'avg_nmr.json'))));
        const avg_mmr = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'health_outcomes', 'avg_mmr.json'))));
        const countries_nmr_track = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'health_outcomes', 'countries_nmr_track.json'))));
        const countries_mmr_track = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'health_outcomes', 'countries_mmr_track.json'))));

        res.json({
            avg_nmr,
            avg_mmr,
            countries_nmr_track,
            countries_mmr_track
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get cross-dimensional indicators
app.get('/api/indicators/cross-dimensional', async (req, res) => {
    try {
        const uhc_correlations = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'cross_dimensional', 'uhc_correlations.json'))));
        const outcome_correlations = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'cross_dimensional', 'outcome_correlations.json'))));
        const structure_uhc = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'cross_dimensional', 'structure_uhc.json'))));
        const structure_outcomes = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'cross_dimensional', 'structure_outcomes.json'))));
        const structure_uhc_extended = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'cross_dimensional', 'structure_uhc_extended.json'))));
        const structure_outcomes_extended = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'cross_dimensional', 'structure_outcomes_extended.json'))));

        res.json({
            uhc_correlations,
            outcome_correlations,
            structure_uhc,
            structure_outcomes,
            structure_uhc_extended,
            structure_outcomes_extended
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get fiscal space indicators
app.get('/api/indicators/fiscal-space', async (req, res) => {
    try {
        const fiscal_indicators = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'fiscal_space', 'fiscal_indicators.json'))));
        const percentile_indicators = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'fiscal_space', 'percentile_indicators.json'))));
        const investment_indicators = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'fiscal_space', 'investment_indicators.json'))));
        const countries_gov_gdp_above_5pct = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'fiscal_space', 'countries_gov_gdp_above_5pct.json'))));

        res.json({
            fiscal_indicators,
            percentile_indicators,
            investment_indicators,
            countries_gov_gdp_above_5pct
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get countries list
app.get('/api/countries', async (req, res) => {
    try {
        const metadata = await readJSONFile(path.join(DATA_DIR, 'metadata.json'));
        res.json(metadata.countries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get years range
app.get('/api/years', async (req, res) => {
    try {
        const metadata = await readJSONFile(path.join(DATA_DIR, 'metadata.json'));
        res.json(metadata.year_range);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get income categories
app.get('/api/income-categories', async (req, res) => {
    try {
        const metadata = await readJSONFile(path.join(DATA_DIR, 'metadata.json'));
        res.json(metadata.income_categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get subregions
app.get('/api/subregions', async (req, res) => {
    try {
        const metadata = await readJSONFile(path.join(DATA_DIR, 'metadata.json'));
        res.json(metadata.subregions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Country-specific data endpoint
app.get('/api/country/:countryName', async (req, res) => {
    try {
        const { countryName } = req.params;
        const data = await readJSONFile(path.join(DATA_DIR, 'master_dataset.json'));

        const countryData = data.filter(d => d.location === countryName);

        if (countryData.length === 0) {
            return res.status(404).json({ error: 'Country not found' });
        }

        res.json(countryData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Year-specific data endpoint
app.get('/api/year/:year', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const data = await readJSONFile(path.join(DATA_DIR, 'master_dataset.json'));

        const yearData = data.filter(d => d.year === year);

        if (yearData.length === 0) {
            return res.status(404).json({ error: 'Year not found' });
        }

        res.json(yearData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Aggregation endpoints for frontend charts
// These transform indicator data into chart-friendly format
app.get('/api/aggregate/by-year', async (req, res) => {
    try {
        const { field, groupBy } = req.query;

        if (!field) {
            return res.status(400).json({ error: 'field parameter is required' });
        }

        // Map fields to their indicator endpoints and data keys
        const fieldMapping = {
            // Public Health Financing (3.1)
            'countries_below_threshold': { endpoint: 'public_health_financing', dataKey: 'countries_below_threshold', valueField: 'countries_below_threshold' },
            'avg_health_financing_gap': { endpoint: 'public_health_financing', dataKey: 'avg_gap', valueField: 'avg_gap' },
            'gini_per_capita': { endpoint: 'public_health_financing', dataKey: 'gini', valueField: 'gini_per_capita' },

            // Budget Priority / Abuja (3.2)
            'countries_below_abuja': { endpoint: 'budget_priority', dataKey: 'countries_below_abuja', valueField: 'countries_below_abuja' },
            'avg_budget_priority_gap': { endpoint: 'budget_priority', dataKey: 'avg_gap', valueField: 'avg_budget_priority_gap' },
            'gini_budget_priority': { endpoint: 'budget_priority', dataKey: 'gini', valueField: 'gini_budget_priority' },

            // Financial Protection (3.3)
            'countries_above_oop_benchmark': { endpoint: 'financial_protection', dataKey: 'countries_above_oop_benchmark', valueField: 'countries_above_oop_benchmark' },
            'countries_below_oop_benchmark': { endpoint: 'financial_protection', dataKey: 'countries_above_oop_benchmark', valueField: 'countries_above_oop_benchmark', invert: true },
            'avg_financial_protection_gap': { endpoint: 'financial_protection', dataKey: 'avg_gap', valueField: 'avg_financial_protection_gap' },
            'gini_oop': { endpoint: 'financial_protection', dataKey: 'gini', valueField: 'gini_oop' },

            // Financing Structure (3.4)
            'countries_gov_dominant': { endpoint: 'financing_structure', dataKey: 'countries_gov_dominant', valueField: 'countries_gov_dominant' },
            'avg_gov_share': { endpoint: 'financing_structure', dataKey: 'avg_shares', valueField: 'avg_gov_share' },
            'avg_voluntary_share': { endpoint: 'financing_structure', dataKey: 'avg_shares', valueField: 'avg_voluntary_share' },
            'avg_oop_share': { endpoint: 'financing_structure', dataKey: 'avg_shares', valueField: 'avg_oop_share' },
            'avg_other_private_share': { endpoint: 'financing_structure', dataKey: 'avg_shares', valueField: 'avg_other_private_share' },
            'avg_external_share': { endpoint: 'financing_structure', dataKey: 'avg_shares', valueField: 'avg_external_share' },

            // UHC (3.5)
            'avg_uhc': { endpoint: 'uhc', dataKey: 'avg_uhc', valueField: 'avg_uhc' },
            'countries_low_uhc': { endpoint: 'uhc', dataKey: 'countries_low_uhc', valueField: 'countries_low_uhc' },
            'gini_uhc': { endpoint: 'uhc', dataKey: 'gini', valueField: 'gini_uhc' },

            // Health Outcomes (3.6)
            'avg_nmr': { endpoint: 'health_outcomes', dataKey: 'avg_nmr', valueField: 'avg_nmr' },
            'avg_mmr': { endpoint: 'health_outcomes', dataKey: 'avg_mmr', valueField: 'avg_mmr' },
            'countries_nmr_track': { endpoint: 'health_outcomes', dataKey: 'countries_nmr_track', valueField: 'countries_nmr_track' },
            'countries_mmr_track': { endpoint: 'health_outcomes', dataKey: 'countries_mmr_track', valueField: 'countries_mmr_track' },

            // Fiscal Space (3.4a, 3.11)
            'countries_gov_gdp_above_5pct': { endpoint: 'fiscal_space', dataKey: 'countries_gov_gdp_above_5pct', valueField: 'countries_gov_gdp_above_5pct' },

            // Cross-Dimensional: UHC Correlations (3.7)
            'pct_oop_benchmark_uhc50': { endpoint: 'cross_dimensional', dataKey: 'uhc_correlations', valueField: 'pct_oop_benchmark_uhc50' },
            'pct_oop_benchmark_uhc75': { endpoint: 'cross_dimensional', dataKey: 'uhc_correlations', valueField: 'pct_oop_benchmark_uhc75' },

            // Cross-Dimensional: Structure × UHC (3.9)
            'pct_voluntary_dominant_uhc50': { endpoint: 'cross_dimensional', dataKey: 'structure_uhc_extended', valueField: 'pct_voluntary_dominant_uhc50' },
            'pct_voluntary_dominant_uhc75': { endpoint: 'cross_dimensional', dataKey: 'structure_uhc_extended', valueField: 'pct_voluntary_dominant_uhc75' },
            'pct_oop_dominant_uhc50': { endpoint: 'cross_dimensional', dataKey: 'structure_uhc_extended', valueField: 'pct_oop_dominant_uhc50' },
            'pct_oop_dominant_uhc75': { endpoint: 'cross_dimensional', dataKey: 'structure_uhc_extended', valueField: 'pct_oop_dominant_uhc75' },
            'pct_other_private_dominant_uhc50': { endpoint: 'cross_dimensional', dataKey: 'structure_uhc_extended', valueField: 'pct_other_private_dominant_uhc50' },
            'pct_other_private_dominant_uhc75': { endpoint: 'cross_dimensional', dataKey: 'structure_uhc_extended', valueField: 'pct_other_private_dominant_uhc75' },
            'pct_external_dominant_uhc50': { endpoint: 'cross_dimensional', dataKey: 'structure_uhc_extended', valueField: 'pct_external_dominant_uhc50' },
            'pct_external_dominant_uhc75': { endpoint: 'cross_dimensional', dataKey: 'structure_uhc_extended', valueField: 'pct_external_dominant_uhc75' },

            // Cross-Dimensional: Structure × Outcomes (3.10)
            'pct_voluntary_dominant_nmr': { endpoint: 'cross_dimensional', dataKey: 'structure_outcomes_extended', valueField: 'pct_voluntary_dominant_nmr' },
            'pct_voluntary_dominant_mmr': { endpoint: 'cross_dimensional', dataKey: 'structure_outcomes_extended', valueField: 'pct_voluntary_dominant_mmr' },
            'pct_oop_dominant_nmr': { endpoint: 'cross_dimensional', dataKey: 'structure_outcomes_extended', valueField: 'pct_oop_dominant_nmr' },
            'pct_oop_dominant_mmr': { endpoint: 'cross_dimensional', dataKey: 'structure_outcomes_extended', valueField: 'pct_oop_dominant_mmr' },
            'pct_other_private_dominant_nmr': { endpoint: 'cross_dimensional', dataKey: 'structure_outcomes_extended', valueField: 'pct_other_private_dominant_nmr' },
            'pct_other_private_dominant_mmr': { endpoint: 'cross_dimensional', dataKey: 'structure_outcomes_extended', valueField: 'pct_other_private_dominant_mmr' },
            'pct_external_dominant_nmr': { endpoint: 'cross_dimensional', dataKey: 'structure_outcomes_extended', valueField: 'pct_external_dominant_nmr' },
            'pct_external_dominant_mmr': { endpoint: 'cross_dimensional', dataKey: 'structure_outcomes_extended', valueField: 'pct_external_dominant_mmr' },
        };

        const mapping = fieldMapping[field];
        let indicatorData;

        if (!mapping) {
            // Field not in mapping - try to aggregate from master dataset directly
            const masterData = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'master_dataset.json'))));

            // Check if field exists in master data
            if (masterData.length > 0 && masterData[0][field] === undefined) {
                return res.status(400).json({ error: `Unknown field: ${field}` });
            }

            // Aggregate from master data
            indicatorData = masterData.map(d => ({
                year: d.year,
                income: d.income,
                Subregion: d.Subregion,
                [field]: d[field]
            }));
        } else {
            // Read the indicator data from pre-aggregated files
            indicatorData = await readJSONFile(path.join(DATA_DIR, mapping.endpoint.replace('_', '_').replace(/-/g, '_'), `${mapping.dataKey}.json`));
            // Apply year filtering and income recoding
            indicatorData = recodeHighIncome(filterYearRange(indicatorData));
        }

        // Determine value field name
        const valueField = mapping ? mapping.valueField : field;

        // Determine if this is a count field (should sum) or average field (should average)
        const countFields = ['countries_below_threshold', 'countries_below_abuja', 'countries_above_oop_benchmark',
                            'countries_gov_dominant', 'countries_low_uhc', 'countries_nmr_track', 'countries_mmr_track',
                            'countries_gov_gdp_above_5pct'];
        const shouldSum = countFields.includes(field);

        if (!groupBy) {
            // Overall aggregation - sum for counts, average for other indicators
            const yearData = {};
            indicatorData.forEach(item => {
                if (!yearData[item.year]) {
                    yearData[item.year] = { year: item.year, total: 0, count: 0 };
                }
                const value = item[valueField];
                if (value !== null && value !== undefined) {
                    yearData[item.year].total += value;
                    yearData[item.year].count += 1;
                }
            });

            const result = Object.values(yearData).map(d => ({
                year: d.year,
                value: shouldSum ? d.total : (d.count > 0 ? d.total / d.count : null),
                count: d.count
            })).sort((a, b) => a.year - b.year);

            res.json(result);
        } else {
            // Group by income or Subregion
            const groupField = groupBy === 'income' ? 'income' : 'Subregion';
            const grouped = {};

            indicatorData.forEach(item => {
                const year = item.year;
                const group = item[groupField];
                const value = item[valueField];

                if (!grouped[year]) {
                    grouped[year] = { year };
                }

                if (value !== null && value !== undefined) {
                    grouped[year][group] = value;
                }
            });

            const result = Object.values(grouped).sort((a, b) => a.year - b.year);
            res.json(result);
        }
    } catch (error) {
        console.error('Aggregation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Aggregate by country - get latest year data for each country
app.get('/api/aggregate/by-country', async (req, res) => {
    try {
        const { field, year } = req.query;

        if (!field) {
            return res.status(400).json({ error: 'field parameter is required' });
        }

        // Read master dataset
        const masterData = recodeHighIncome(filterYearRange(await readJSONFile(path.join(DATA_DIR, 'master_dataset.json'))));

        // Check if field exists
        if (masterData.length > 0 && masterData[0][field] === undefined) {
            return res.status(400).json({ error: `Unknown field: ${field}` });
        }

        // Determine year to use
        const targetYear = year ? parseInt(year) : Math.max(...masterData.map(d => d.year));

        // Filter to target year and extract country data
        const countryData = masterData
            .filter(d => d.year === targetYear)
            .map(d => ({
                name: d.location,
                value: d[field],
                income: d.income,
                subregion: d.Subregion
            }))
            .filter(d => d.value !== null && d.value !== undefined)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        res.json(countryData);
    } catch (error) {
        console.error('Country aggregation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`================================`);
    console.log(`Health Financing Gap API Server`);
    console.log(`================================`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`API endpoints: http://localhost:${PORT}/api/`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`================================`);
});

module.exports = app;
