# Indicator Implementation Plan
**Date**: March 20, 2026
**Purpose**: Systematic plan to ensure all indicators from `generate_report_tables.py` are properly implemented on the web platform

---

## Status Legend
- ✅ **Implemented**: Data exists, API serves it, chart config correct
- ⚠️ **Needs Fix**: Data exists, API serves it, but chart config points to wrong endpoint
- ❌ **Missing**: No chart configuration exists yet

---

## Theme 3.1: Public Health Financing
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.1.1 | Countries below threshold | countries_below_threshold.json | /api/indicators/public-health-financing | EXISTS (but shows raw data) | ⚠️ | Update to show COUNT of countries below threshold by income/subregion/year |
| 3.1.2 | Average public health financing gap | avg_gap.json | /api/indicators/public-health-financing | EXISTS | ✅ | Working correctly |
| 3.1.3 | Gini coefficient - Gov exp Health per capita | gini.json | /api/indicators/public-health-financing | EXISTS | ✅ | Working correctly |

---

## Theme 3.2: Abuja Declaration (Budget Priority)
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.2.1 | Countries below Abuja target <15% | countries_below_abuja.json | /api/indicators/budget-priority | EXISTS (but shows raw data) | ⚠️ | Update chart to show COUNT from aggregated endpoint, not raw % values |
| 3.2.2 | Average budget priority gap | avg_gap.json | /api/indicators/budget-priority | EXISTS | ⚠️ | Update to use aggregated endpoint |
| 3.2.3 | Gini coefficient - Gov exp Health on budget | gini.json | /api/indicators/budget-priority | EXISTS (but shows country comparison) | ⚠️ | Update to show Gini coefficient trend, not country comparison |

---

## Theme 3.3: Financial Protection
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.3.1 | Countries with OOP below 20% benchmark | countries_above_oop_benchmark.json | /api/indicators/financial-protection | EXISTS (but shows raw data) | ⚠️ | Update to show COUNT from aggregated endpoint |
| 3.3.2 | Average financial protection gap | avg_gap.json | /api/indicators/financial-protection | EXISTS | ⚠️ | Update to use aggregated endpoint |
| 3.3.3 | Gini coefficient - OOP expenditure | gini.json | /api/indicators/financial-protection | EXISTS | ⚠️ | Update to show Gini trend |
| 3.3.4 | Incidence of financial hardship | financial_hardship.json | /api/indicators/financial-protection | ? | ? | Check if chart exists |

---

## Theme 3.4: Financing Structure
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.4.1 | Countries with Government share >50% | countries_gov_dominant.json | /api/indicators/financing-structure | EXISTS | ⚠️ | Update to show COUNT |
| 3.4.2 | Average Government share | avg_shares.json (gov_share) | /api/indicators/financing-structure | EXISTS | ✅ | Working |
| 3.4.3 | Average Voluntary prepaid insurance share | avg_shares.json (voluntary_share) | /api/indicators/financing-structure | EXISTS | ✅ | Working |
| 3.4.4 | Average OOP share | avg_shares.json (oop_share) | /api/indicators/financing-structure | EXISTS | ✅ | Working |
| 3.4.5 | Average Other private share | avg_shares.json (other_private_share) | /api/indicators/financing-structure | EXISTS | ✅ | Working |
| 3.4.6 | Average External/donor share | avg_shares.json (external_share) | /api/indicators/financing-structure | EXISTS | ✅ | Working |

---

## Theme 3.4a: Gov Health Exp < 5% GDP
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.4a | Countries with Gov health exp < 5% of GDP | ? | ? | ? | ❌ | Need to create data file, endpoint, and chart |

---

## Theme 3.5: UHC Index
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.5.1 | Average UHC Index | avg_uhc.json | /api/indicators/uhc | EXISTS | ✅ | Working |
| 3.5.2 | Countries with UHC <50% or below regional average | countries_low_uhc.json | /api/indicators/uhc | EXISTS | ⚠️ | Update to show COUNT |
| 3.5.3 | Gini coefficient - UHC Index | gini.json | /api/indicators/uhc | ? | ❌ | Need to add chart config |

---

## Theme 3.6: Health Outcomes
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.6.1 | Average Neonatal Mortality Rate | avg_nmr.json | /api/indicators/health-outcomes | EXISTS | ✅ | Working |
| 3.6.2 | Average Maternal Mortality Ratio | avg_mmr.json | /api/indicators/health-outcomes | EXISTS | ✅ | Working |
| 3.6.3 | Countries on course for NMR ≤12 | countries_nmr_track.json | /api/indicators/health-outcomes | EXISTS | ⚠️ | Update to show COUNT |
| 3.6.4 | Countries on course for MMR <70 | countries_mmr_track.json | /api/indicators/health-outcomes | EXISTS | ⚠️ | Update to show COUNT |

---

## Theme 3.7: Financing × UHC (Cross-Tabulations)
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.7.1 | Threshold + UHC above 50th/75th percentile cross-tab | uhc_correlations.json | /api/indicators/cross-dimensional | EXISTS | ⚠️ | Update to show cross-tab |
| 3.7.2 | Abuja + UHC above 50th/75th percentile cross-tab | uhc_correlations.json | /api/indicators/cross-dimensional | EXISTS | ⚠️ | Update to show cross-tab |
| 3.7.3 | OOP below 20% + UHC above 50th/75th percentile cross-tab | uhc_correlations.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |

---

## Theme 3.8: Financing × Outcomes (Cross-Tabulations)
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.8.1 | Threshold + NMR on course cross-tab | outcome_correlations.json | /api/indicators/cross-dimensional | EXISTS | ⚠️ | Update to show cross-tab |
| 3.8.2 | Abuja + MMR on course cross-tab | outcome_correlations.json | /api/indicators/cross-dimensional | EXISTS | ⚠️ | Update to show cross-tab |

---

## Theme 3.9: Structure × UHC (Cross-Tabulations)
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.9.1 | Gov dominant (>50%) + UHC 50th/75th percentile cross-tab | structure_uhc.json | /api/indicators/cross-dimensional | EXISTS | ⚠️ | Update to show cross-tab |
| 3.9.2 | Voluntary prepaid highest + UHC cross-tab | structure_uhc.json | /api/indicators/cross-dimensional | EXISTS | ⚠️ | Update to show cross-tab |
| 3.9.3 | OOP highest + UHC cross-tab | structure_uhc.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.9.4 | Other private highest + UHC cross-tab | structure_uhc.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.9.5 | External highest + UHC cross-tab | structure_uhc.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |

---

## Theme 3.10: Structure × Outcomes (Cross-Tabulations)
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.10.1 | Gov dominant + NMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | EXISTS | ⚠️ | Update to show cross-tab |
| 3.10.2 | Voluntary prepaid highest + NMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | EXISTS | ⚠️ | Update to show cross-tab |
| 3.10.3 | OOP highest + NMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.10.4 | Other private highest + NMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.10.5 | External highest + NMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.10.6 | Gov dominant + MMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.10.7 | Voluntary prepaid highest + MMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.10.8 | OOP highest + MMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.10.9 | Other private highest + MMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |
| 3.10.10 | External highest + MMR on course | structure_outcomes.json | /api/indicators/cross-dimensional | ? | ❌ | Need to add chart config |

---

## Theme 3.11: Fiscal Space
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| 3.11.1 | Health spending elasticity | N/A (not in dataset) | N/A | ? | ❌ | Cannot implement - data not available |
| 3.11.2 | Tax revenue as % of GDP | fiscal_indicators.json | /api/indicators/fiscal-space | EXISTS | ⚠️ | Verify chart config |
| 3.11.3 | Health expenditure as % of GDP | fiscal_indicators.json | /api/indicators/fiscal-space | EXISTS | ⚠️ | Verify chart config |
| 3.11.4 | Institutional health investment share | N/A (not in dataset) | N/A | EXISTS | ❌ | Cannot implement |
| 3.11.5 | Gross fixed capital formation | investment_indicators.json | /api/indicators/fiscal-space | EXISTS | ⚠️ | Verify chart config |
| 3.11.6 | Foreign direct investment | N/A (not in dataset) | N/A | ? | ❌ | Cannot implement |
| 3.11.7 | Investment returns | N/A (not in dataset) | N/A | ? | ❌ | Cannot implement |

---

## New Cross-Tabs (Threshold Categories)
| Indicator | Description | Data File | API Endpoint | Chart Config | Status | Action Needed |
|-----------|-------------|-----------|--------------|--------------|---------|---------------|
| Threshold × UHC | 4-tier expenditure categories × UHC >50% | ? | ? | ? | ❌ | Need to create full pipeline |
| Threshold × NMR | 4-tier expenditure categories × NMR (>12 vs ≤12) | ? | ? | ? | ❌ | Need to create full pipeline |
| Threshold × MMR | 4-tier expenditure categories × MMR (>70 vs ≤70) | ? | ? | ? | ❌ | Need to create full pipeline |

---

## Summary Counts

### By Status:
- ✅ **Working**: 11 indicators
- ⚠️ **Needs Fix**: 21 indicators (chart configs need to point to aggregated endpoints)
- ❌ **Missing**: 24 indicators (need chart configs or full pipeline)
- **Cannot Implement**: 4 indicators (data not in dataset)

### Total Actionable Items: 45 indicators (21 fixes + 24 new)

---

## Implementation Priority

### Phase 1: Quick Fixes (Update Existing Charts) - 21 indicators
Fix chart configurations that already exist but point to wrong endpoints:
- 3.2.1, 3.2.2, 3.2.3 (Abuja)
- 3.3.1, 3.3.2, 3.3.3 (Financial Protection)
- 3.4.1 (Financing Structure)
- 3.5.2 (UHC)
- 3.6.3, 3.6.4 (Health Outcomes)
- 3.7.1, 3.7.2 (Financing × UHC)
- 3.8.1, 3.8.2 (Financing × Outcomes)
- 3.9.1, 3.9.2 (Structure × UHC)
- 3.10.1, 3.10.2 (Structure × Outcomes)
- 3.11.2, 3.11.3, 3.11.5 (Fiscal Space)

### Phase 2: Add Missing Charts - 16 indicators
Create new chart configurations for indicators with existing data:
- 3.3.4 (Financial hardship)
- 3.5.3 (UHC Gini)
- 3.7.3 (OOP + UHC cross-tab)
- 3.9.3, 3.9.4, 3.9.5 (Structure × UHC cross-tabs)
- 3.10.3-3.10.10 (Structure × Outcomes cross-tabs, 8 indicators)

### Phase 3: Create New Pipelines - 8 indicators
Build full data pipeline (Python → JSON → API → Chart):
- 3.4a (Gov exp < 5% GDP)
- Threshold × UHC (1 indicator)
- Threshold × NMR (1 indicator)
- Threshold × MMR (1 indicator)
- Plus 4 sub-indicators for the threshold cross-tabs (number of countries, average expenditure for each tier)

---

## Next Steps

1. **Phase 1**: Start with chart config fixes (21 indicators) - should be quick
2. **Phase 2**: Add missing chart configs (16 indicators) - moderate effort
3. **Phase 3**: Build new data pipelines (8 indicators) - requires Python, backend, and frontend work

**Estimated Time**:
- Phase 1: 3-4 hours
- Phase 2: 4-5 hours
- Phase 3: 8-10 hours
- **Total**: ~15-19 hours of focused development work

---

## Testing Checklist

After implementation:
- [ ] All 45 indicators render correctly on the platform
- [ ] Disaggregations (by income, subregion, year) work properly
- [ ] Chart interactions (tooltips, legends, filters) function correctly
- [ ] Performance is acceptable (page load < 3 seconds)
- [ ] Mobile responsiveness maintained
- [ ] All related chart links work correctly
- [ ] Data sources are properly cited
- [ ] Methodology notes are accurate
