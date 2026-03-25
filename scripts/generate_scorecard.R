# ============================================================
# Health Financing Gap Scorecard Generator
# Produces a scorecard showing countries meeting key thresholds
# ============================================================

# ============================================================
# 1. Load packages
# ============================================================
library(dplyr)
library(tidyr)
library(readxl)
library(openxlsx)
library(ggplot2)
library(scales)
library(viridis)

# ============================================================
# 2. Load data
# ============================================================
# Adjust path as needed
data_path <- "../../raw_data/Health_Financing Data.xlsx"
df_raw <- read_excel(data_path)

# Get most recent year with complete data
# Find year with most non-NA values for per capita indicator
recent_year <- df_raw %>%
  group_by(year) %>%
  summarise(n_complete = sum(!is.na(`Gov exp Health per capita`)), .groups = "drop") %>%
  filter(n_complete > 0) %>%
  slice_max(year, n = 1) %>%
  pull(year)

df <- df_raw %>%
  filter(year == recent_year)

cat("Processing data for year:", recent_year, "\n")

# ============================================================
# 3. Define income-specific thresholds for Per Capita
# ============================================================
threshold_per_capita <- function(income_level) {
  case_when(
    income_level == "Low" ~ 112,
    income_level == "Lower-middle" ~ 146,
    income_level == "Upper-middle" ~ 477,
    income_level == "High" ~ 477,
    TRUE ~ 146  # default
  )
}

# ============================================================
# 4. Extract key indicators and check thresholds
# ============================================================

# Per Capita: Government health expenditure per capita (PPP)
per_capita <- df %>%
  select(
    country = location,
    income = income,
    score = `Gov exp Health per capita`
  ) %>%
  filter(!is.na(score) & !is.na(country)) %>%
  mutate(
    threshold = threshold_per_capita(income),
    meets = score >= threshold,
    indicator = "Per Capita"
  )

# >5% GDP: Government health expenditure as % of GDP
gdp_pct <- df %>%
  select(
    country = location,
    score = `Gov exp Health on GDP`
  ) %>%
  filter(!is.na(score) & !is.na(country)) %>%
  mutate(
    threshold = 5,
    meets = score >= threshold,
    indicator = ">5% GDP"
  )

# >15% Budget: Abuja Declaration (% of government expenditure)
budget_pct <- df %>%
  select(
    country = location,
    score = `Gov exp Health on budget`
  ) %>%
  filter(!is.na(score) & !is.na(country)) %>%
  mutate(
    threshold = 15,
    meets = score >= threshold,
    indicator = ">15% Budget"
  )

# OOP <20%: Out-of-pocket expenditure (should be below 20%)
oop <- df %>%
  select(
    country = location,
    score = `Out-of-pocket on health exp`
  ) %>%
  filter(!is.na(score) & !is.na(country)) %>%
  mutate(
    threshold = 20,
    meets = score < threshold,  # Note: meets if BELOW threshold
    indicator = "OOP <20%"
  )

# ============================================================
# 5. Combine all indicators
# ============================================================
all_indicators <- bind_rows(
  per_capita %>% select(country, indicator, score, threshold, meets, income),
  gdp_pct %>% select(country, indicator, score, threshold, meets),
  budget_pct %>% select(country, indicator, score, threshold, meets),
  oop %>% select(country, indicator, score, threshold, meets)
)

# ============================================================
# 6. Filter to only countries that meet at least one criterion
# ============================================================
countries_meeting_any <- all_indicators %>%
  filter(meets == TRUE) %>%
  pull(country) %>%
  unique()

cat("\nCountries meeting at least one threshold:", length(countries_meeting_any), "\n")

scorecard_data <- all_indicators %>%
  filter(country %in% countries_meeting_any)

# ============================================================
# 7. Create display string (value + ✔ if meets)
# ============================================================
scorecard_data <- scorecard_data %>%
  mutate(
    # Round scores appropriately
    score_rounded = case_when(
      indicator == "Per Capita" ~ round(score, 1),
      TRUE ~ round(score, 2)
    ),
    # Create display value
    value_display = case_when(
      indicator == "Per Capita" ~ paste0(score_rounded, " (", threshold, ")"),
      TRUE ~ as.character(score_rounded)
    ),
    # Add checkmark if meets threshold
    value_display = ifelse(meets, paste0(value_display, " ✔"), value_display)
  )

# ============================================================
# 8. Reshape to wide format (scorecard)
# ============================================================
scorecard <- scorecard_data %>%
  select(country, indicator, value_display) %>%
  pivot_wider(
    names_from = indicator,
    values_from = value_display,
    values_fill = ""
  ) %>%
  arrange(country)

# Reorder columns for better presentation
column_order <- c("country", "Per Capita", ">5% GDP", ">15% Budget", "OOP <20%")
scorecard <- scorecard %>%
  select(any_of(column_order))

# ============================================================
# 9. View result
# ============================================================
cat("\n========================================\n")
cat("HEALTH FINANCING GAP SCORECARD\n")
cat("Year:", recent_year, "\n")
cat("========================================\n\n")

print(scorecard, n = Inf)

# ============================================================
# 10. Export to Excel with formatting
# ============================================================
output_file <- "../reports/Health_Financing_Scorecard.xlsx"

wb <- createWorkbook()
addWorksheet(wb, "Scorecard")

# Write title
writeData(wb, "Scorecard", "Health Financing Gap Scorecard", startRow = 1, startCol = 1)
writeData(wb, "Scorecard", paste("Year:", recent_year), startRow = 2, startCol = 1)

# Write data
writeData(wb, "Scorecard", scorecard, startRow = 4, startCol = 1)

# Format header
headerStyle <- createStyle(
  fontSize = 12,
  fontColour = "#FFFFFF",
  fgFill = "#4F81BD",
  halign = "center",
  valign = "center",
  textDecoration = "bold",
  border = "TopBottomLeftRight"
)

addStyle(wb, "Scorecard", headerStyle, rows = 4, cols = 1:ncol(scorecard), gridExpand = TRUE)

# Format title
titleStyle <- createStyle(
  fontSize = 16,
  textDecoration = "bold"
)
addStyle(wb, "Scorecard", titleStyle, rows = 1, cols = 1)

# Auto-width columns
setColWidths(wb, "Scorecard", cols = 1:ncol(scorecard), widths = "auto")

# Save
saveWorkbook(wb, output_file, overwrite = TRUE)

cat("\n✔ Scorecard exported to:", output_file, "\n")

# ============================================================
# 11. Summary statistics
# ============================================================
cat("\n========================================\n")
cat("SUMMARY STATISTICS\n")
cat("========================================\n\n")

summary_stats <- scorecard_data %>%
  group_by(indicator) %>%
  summarise(
    `Total Countries Meeting Threshold` = sum(meets),
    `Total Countries Evaluated` = n(),
    `Percentage Meeting` = round(100 * sum(meets) / n(), 1)
  )

print(summary_stats)

# ============================================================
# 12. Countries meeting multiple criteria
# ============================================================
cat("\n========================================\n")
cat("COUNTRIES MEETING MULTIPLE CRITERIA\n")
cat("========================================\n\n")

multi_criteria <- scorecard_data %>%
  group_by(country) %>%
  summarise(
    `Criteria Met` = sum(meets),
    .groups = "drop"
  ) %>%
  filter(`Criteria Met` >= 2) %>%
  arrange(desc(`Criteria Met`))

print(multi_criteria, n = Inf)

# ============================================================
# 13. Create Beautiful Visualizations
# ============================================================
cat("\n========================================\n")
cat("GENERATING VISUALIZATIONS\n")
cat("========================================\n\n")

# Prepare data for visualization
viz_data <- scorecard_data %>%
  mutate(
    # Clean indicator names for display
    indicator_clean = case_when(
      indicator == "Per Capita" ~ "Gov Health Exp\nPer Capita",
      indicator == ">5% GDP" ~ "Health Exp\n>5% of GDP",
      indicator == ">15% Budget" ~ "Health Budget\n>15% (Abuja)",
      indicator == "OOP <20%" ~ "Out-of-Pocket\n<20%"
    ),
    # Set factor levels to control column order (matching reference image)
    indicator_clean = factor(indicator_clean, levels = c(
      "Gov Health Exp\nPer Capita",
      "Health Budget\n>15% (Abuja)",
      "Health Exp\n>5% of GDP",
      "Out-of-Pocket\n<20%"
    )),
    # Create status label
    status = ifelse(meets, "Meets Threshold", "Below Threshold")
  )

# Calculate criteria met per country
criteria_summary <- scorecard_data %>%
  group_by(country) %>%
  summarise(
    criteria_met = sum(meets),
    total_criteria = n(),
    .groups = "drop"
  ) %>%
  arrange(desc(criteria_met))

# Create custom sorting for heatmap: greens on top for each indicator
# Sort by meets status for each indicator in order (matching column order from reference image)
indicator_order <- c("Per Capita", ">15% Budget", ">5% GDP", "OOP <20%")

heatmap_sort <- scorecard_data %>%
  select(country, indicator, meets) %>%
  mutate(indicator = factor(indicator, levels = indicator_order)) %>%
  pivot_wider(names_from = indicator, values_from = meets, values_fill = FALSE) %>%
  arrange(desc(`Per Capita`), desc(`>15% Budget`), desc(`>5% GDP`), desc(`OOP <20%`))

# Join back to get ordering
# Reverse order so greens appear at TOP of heatmap (ggplot2 plots first factor level at bottom)
viz_data <- viz_data %>%
  left_join(criteria_summary %>% select(country, criteria_met), by = "country") %>%
  mutate(country = factor(country, levels = rev(heatmap_sort$country)))

# Define color scheme
color_meets <- "#2ECC71"      # Green for meets threshold
color_not_meets <- "#E74C3C"  # Red for doesn't meet
color_neutral <- "#95A5A6"    # Gray for neutral

# ============================================================
# CHART 1: Heatmap - Countries vs Indicators
# ============================================================
cat("Creating Chart 1: Scorecard Heatmap...\n")

p1 <- ggplot(viz_data, aes(x = indicator_clean, y = country, fill = meets)) +
  geom_tile(color = "white", size = 1.5) +
  geom_text(aes(label = ifelse(meets, paste(score_rounded, "✓"), "✗")),
            size = 8, fontface = "bold", color = "white") +
  scale_fill_manual(
    values = c("TRUE" = color_meets, "FALSE" = color_not_meets),
    labels = c("TRUE" = "Meets Threshold", "FALSE" = "Below Threshold"),
    name = "Status"
  ) +
  labs(
    title = "Health Financing Status Scorecard",
    subtitle = paste("Performance across key health financing thresholds -", recent_year),
    x = "Health Financing Indicator",
    y = NULL,
    caption = "Source: Health Financing Data | Countries sorted with greens at top for each indicator"
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(face = "bold", size = 18, hjust = 0.5),
    plot.subtitle = element_text(size = 12, hjust = 0.5, color = "gray40", margin = margin(b = 20)),
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
    axis.text.x = element_text(size = 11, face = "bold"),
    axis.text.y = element_text(size = 10),
    axis.title.x = element_text(margin = margin(t = 15), face = "bold"),
    legend.position = "top",
    legend.title = element_text(face = "bold", size = 11),
    legend.text = element_text(size = 10),
    panel.grid = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/scorecard_heatmap.png", p1,
       width = 12, height = 10, dpi = 300, bg = "white")

# ============================================================
# CHART 2: Criteria Met Summary Bar Chart
# ============================================================
cat("Creating Chart 2: Criteria Met Summary...\n")

p2 <- ggplot(criteria_summary, aes(x = reorder(country, criteria_met), y = criteria_met)) +
  geom_col(aes(fill = criteria_met), width = 0.7, show.legend = FALSE) +
  geom_text(aes(label = criteria_met), hjust = -0.3, size = 4, fontface = "bold") +
  scale_fill_gradient(low = "#E74C3C", high = "#2ECC71") +
  scale_y_continuous(limits = c(0, 4.5), breaks = 0:4) +
  coord_flip() +
  labs(
    title = "Countries Meeting Health Financing Thresholds",
    subtitle = paste("Number of criteria met out of 4 possible -", recent_year),
    x = NULL,
    y = "Number of Criteria Met",
    caption = "Criteria: Per Capita Spending, >5% GDP, >15% Budget (Abuja), OOP <20%"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0, margin = margin(t = 15)),
    axis.text.y = element_text(size = 10),
    axis.text.x = element_text(size = 10),
    axis.title.x = element_text(margin = margin(t = 10), face = "bold"),
    panel.grid.major.y = element_blank(),
    panel.grid.minor = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/criteria_met_summary.png", p2,
       width = 10, height = 8, dpi = 300, bg = "white")

# ============================================================
# CHART 3: Grouped Bar Chart by Indicator
# ============================================================
cat("Creating Chart 3: Performance by Indicator...\n")

indicator_summary <- scorecard_data %>%
  group_by(indicator) %>%
  summarise(
    meets = sum(meets),
    not_meets = n() - sum(meets),
    total = n(),
    pct_meets = 100 * sum(meets) / n(),
    .groups = "drop"
  ) %>%
  mutate(
    indicator_clean = case_when(
      indicator == "Per Capita" ~ "Gov Health Exp\nPer Capita",
      indicator == ">5% GDP" ~ "Health Exp\n>5% of GDP",
      indicator == ">15% Budget" ~ "Health Budget\n>15% (Abuja)",
      indicator == "OOP <20%" ~ "Out-of-Pocket\n<20%"
    )
  ) %>%
  pivot_longer(cols = c(meets, not_meets), names_to = "status", values_to = "count")

p3 <- ggplot(indicator_summary, aes(x = indicator_clean, y = count, fill = status)) +
  geom_col(position = "stack", width = 0.6) +
  geom_text(data = indicator_summary %>% filter(status == "meets"),
            aes(label = paste0(round(pct_meets, 1), "%"), y = total/2),
            size = 5, fontface = "bold", color = "white") +
  scale_fill_manual(
    values = c("meets" = color_meets, "not_meets" = color_not_meets),
    labels = c("meets" = "Meets Threshold", "not_meets" = "Below Threshold"),
    name = "Status"
  ) +
  scale_y_continuous(breaks = seq(0, 20, 2)) +
  labs(
    title = "Health Financing Threshold Compliance",
    subtitle = paste("Number of countries meeting each threshold -", recent_year),
    x = "Health Financing Indicator",
    y = "Number of Countries",
    caption = "Source: Health Financing Data"
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
    axis.text.x = element_text(size = 11, face = "bold"),
    axis.text.y = element_text(size = 10),
    axis.title = element_text(face = "bold", size = 11),
    axis.title.x = element_text(margin = margin(t = 10)),
    axis.title.y = element_text(margin = margin(r = 10)),
    legend.position = "top",
    legend.title = element_text(face = "bold"),
    panel.grid.minor = element_blank(),
    panel.grid.major.x = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/indicator_compliance.png", p3,
       width = 12, height = 8, dpi = 300, bg = "white")

# ============================================================
# CHART 4: Faceted Performance Chart (All Indicators)
# ============================================================
cat("Creating Chart 4: Detailed Performance by Indicator...\n")

# Prepare data with score ranges
viz_data_scores <- viz_data %>%
  mutate(
    # Create relative score (as % of threshold)
    score_pct = case_when(
      indicator == "OOP <20%" ~ (threshold - score) / threshold * 100,  # Inverted for OOP
      TRUE ~ (score / threshold) * 100
    ),
    exceeds = score_pct >= 100
  )

p4 <- ggplot(viz_data_scores, aes(x = reorder(country, criteria_met), y = score_pct, fill = exceeds)) +
  geom_col(width = 0.7) +
  geom_hline(yintercept = 100, linetype = "dashed", color = "black", size = 0.8) +
  scale_fill_manual(
    values = c("TRUE" = color_meets, "FALSE" = color_not_meets),
    labels = c("TRUE" = "Meets/Exceeds", "FALSE" = "Below"),
    name = "Status"
  ) +
  facet_wrap(~ indicator_clean, scales = "free_y", ncol = 2) +
  coord_flip() +
  labs(
    title = "Health Financing Performance Relative to Thresholds",
    subtitle = paste("Performance as percentage of threshold (100% = meets threshold) -", recent_year),
    x = NULL,
    y = "Performance (% of Threshold)",
    caption = "Dashed line indicates threshold | Countries sorted by total criteria met"
  ) +
  theme_minimal(base_size = 11) +
  theme(
    plot.title = element_text(face = "bold", size = 15, hjust = 0.5),
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(size = 8, color = "gray50", hjust = 0),
    axis.text.x = element_text(size = 9),
    axis.text.y = element_text(size = 8),
    axis.title = element_text(face = "bold", size = 10),
    strip.text = element_text(face = "bold", size = 11),
    strip.background = element_rect(fill = "gray90", color = NA),
    legend.position = "top",
    legend.title = element_text(face = "bold"),
    panel.grid.minor = element_blank(),
    panel.grid.major.y = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/performance_by_indicator.png", p4,
       width = 14, height = 10, dpi = 300, bg = "white")

# ============================================================
# CHART 5: Top Performers Highlight
# ============================================================
cat("Creating Chart 5: Top Performers Spotlight...\n")

top_performers <- criteria_summary %>%
  filter(criteria_met >= 2) %>%
  left_join(scorecard_data %>%
              group_by(country) %>%
              summarise(indicators_met = paste(indicator[meets], collapse = ", "),
                       .groups = "drop"),
            by = "country")

if(nrow(top_performers) > 0) {
  p5 <- ggplot(top_performers, aes(x = reorder(country, criteria_met), y = criteria_met)) +
    geom_segment(aes(xend = country, y = 0, yend = criteria_met),
                 color = "gray70", size = 1.5) +
    geom_point(aes(color = criteria_met, size = criteria_met)) +
    geom_text(aes(label = criteria_met), color = "white", size = 5, fontface = "bold") +
    scale_color_gradient(low = "#F39C12", high = "#27AE60", guide = "none") +
    scale_size_continuous(range = c(12, 20), guide = "none") +
    scale_y_continuous(limits = c(0, 4.5), breaks = 0:4) +
    coord_flip() +
    labs(
      title = "Top Performing Countries in Health Financing",
      subtitle = paste("Countries meeting 2 or more thresholds -", recent_year),
      x = NULL,
      y = "Number of Criteria Met (out of 4)",
      caption = "Criteria: Per Capita Spending, >5% GDP, >15% Budget (Abuja), OOP <20%"
    ) +
    theme_minimal(base_size = 13) +
    theme(
      plot.title = element_text(face = "bold", size = 16, hjust = 0.5, color = "#27AE60"),
      plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
      plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
      axis.text.y = element_text(size = 12, face = "bold"),
      axis.text.x = element_text(size = 10),
      axis.title.x = element_text(margin = margin(t = 10), face = "bold"),
      panel.grid.major.y = element_blank(),
      panel.grid.minor = element_blank(),
      plot.margin = margin(20, 20, 20, 20)
    )

  ggsave("../reports/charts_v2_R/alternative_visualizations/top_performers.png", p5,
         width = 10, height = 6, dpi = 300, bg = "white")
}

cat("\n✔ All charts saved to: ../reports/charts_v2_R/alternative_visualizations/\n")
cat("  - scorecard_heatmap.png\n")
cat("  - criteria_met_summary.png\n")
cat("  - indicator_compliance.png\n")
cat("  - performance_by_indicator.png\n")
cat("  - top_performers.png\n")

# ============================================================
# CHARTS 6-9: Expenditure Performance vs Health Outcomes
# ============================================================
cat("\n========================================\n")
cat("GENERATING EXPENDITURE-OUTCOME CHARTS\n")
cat("========================================\n\n")

# Get health outcome data
health_outcomes <- df %>%
  select(
    country = location,
    income = income,
    per_capita = `Gov exp Health per capita`,
    uhc = `Universal health coverage`,
    nmr = `Infant Mortality Rate`,
    mmr = `Maternal mortality ratio`
  ) %>%
  filter(!is.na(country) & !is.na(per_capita))

# Calculate expenditure performance categories
health_outcomes <- health_outcomes %>%
  mutate(
    threshold = threshold_per_capita(income),
    pct_of_threshold = (per_capita / threshold) * 100,
    expenditure_category = case_when(
      pct_of_threshold >= 100 ~ "Meet expenditure threshold target",
      pct_of_threshold >= 75 ~ "75-99.9% of expenditure threshold",
      pct_of_threshold >= 50 ~ "50-74.9% of expenditure threshold",
      TRUE ~ "Below 50% of expenditure threshold"
    ),
    # Determine if health outcome targets are met
    uhc_meets = !is.na(uhc) & uhc >= 75,
    nmr_meets = !is.na(nmr) & nmr <= 12,
    mmr_meets = !is.na(mmr) & mmr <= 70
  )

# Create factor with ordered levels
health_outcomes <- health_outcomes %>%
  mutate(
    expenditure_category = factor(expenditure_category, levels = c(
      "Below 50% of expenditure threshold",
      "50-74.9% of expenditure threshold",
      "75-99.9% of expenditure threshold",
      "Meet expenditure threshold target"
    ))
  )

# Summary of countries by category
cat("Countries by expenditure performance category:\n")
category_summary <- health_outcomes %>%
  group_by(expenditure_category) %>%
  summarise(n_countries = n(), .groups = "drop")
print(category_summary)

# Reshape data for visualization with actual values
outcome_viz_data <- health_outcomes %>%
  select(country, expenditure_category, pct_of_threshold,
         uhc, nmr, mmr, uhc_meets, nmr_meets, mmr_meets) %>%
  pivot_longer(cols = c(uhc_meets, nmr_meets, mmr_meets),
               names_to = "outcome", values_to = "meets") %>%
  mutate(
    # Get corresponding actual values
    actual_value = case_when(
      outcome == "uhc_meets" ~ uhc,
      outcome == "nmr_meets" ~ nmr,
      outcome == "mmr_meets" ~ mmr
    ),
    # Round values appropriately
    value_rounded = case_when(
      outcome == "uhc_meets" ~ round(actual_value, 1),
      outcome == "nmr_meets" ~ round(actual_value, 1),
      outcome == "mmr_meets" ~ round(actual_value, 0)
    ),
    outcome_clean = case_when(
      outcome == "uhc_meets" ~ "Universal Health\nCoverage (≥75)",
      outcome == "nmr_meets" ~ "Neonatal Mortality\n(≤12 per 1,000)",
      outcome == "mmr_meets" ~ "Maternal Mortality\n(≤70 per 100,000)"
    ),
    outcome_clean = factor(outcome_clean, levels = c(
      "Universal Health\nCoverage (≥75)",
      "Neonatal Mortality\n(≤12 per 1,000)",
      "Maternal Mortality\n(≤70 per 100,000)"
    ))
  )

# Create a chart for each expenditure category
categories <- c(
  "Below 50% of expenditure threshold",
  "50-74.9% of expenditure threshold",
  "75-99.9% of expenditure threshold",
  "Meet expenditure threshold target"
)

chart_titles <- c(
  "Countries Below 50% of Expenditure Threshold",
  "Countries at 50-74.9% of Expenditure Threshold",
  "Countries at 75-99.9% of Expenditure Threshold",
  "Countries Meeting Expenditure Threshold Target"
)

chart_files <- c(
  "expenditure_below50_outcomes.png",
  "expenditure_50to75_outcomes.png",
  "expenditure_75to100_outcomes.png",
  "expenditure_meets_outcomes.png"
)

for (i in 1:4) {
  cat(paste0("Creating Chart ", i + 5, ": ", chart_titles[i], "...\n"))

  # Filter data for this category
  cat_data <- outcome_viz_data %>%
    filter(expenditure_category == categories[i])

  if (nrow(cat_data) > 0) {
    # Sort countries with greens at top for each indicator (like p1)
    outcome_order <- c("uhc_meets", "nmr_meets", "mmr_meets")

    country_sort <- cat_data %>%
      select(country, outcome, meets) %>%
      mutate(outcome = factor(outcome, levels = outcome_order)) %>%
      pivot_wider(names_from = outcome, values_from = meets, values_fill = FALSE) %>%
      arrange(desc(uhc_meets), desc(nmr_meets), desc(mmr_meets))

    country_order <- country_sort$country

    # Reverse order so greens appear at TOP of heatmap (ggplot2 plots first level at bottom)
    cat_data <- cat_data %>%
      mutate(country = factor(country, levels = rev(country_order)))

    # Determine font sizes based on number of countries (like p1)
    n_countries_cat <- length(unique(cat_data$country))
    text_size <- ifelse(n_countries_cat > 30, 5, ifelse(n_countries_cat > 20, 6, 8))
    axis_text_size <- ifelse(n_countries_cat > 30, 7, ifelse(n_countries_cat > 20, 9, 10))
    base_font_size <- 13  # Match p1 base size

    # Create heatmap
    p <- ggplot(cat_data, aes(x = outcome_clean, y = country, fill = meets)) +
      geom_tile(color = "white", linewidth = 1) +
      geom_text(aes(label = ifelse(is.na(meets), "N/A",
                                   ifelse(meets, paste(value_rounded, "✓"), "✗"))),
                size = text_size, fontface = "bold", color = "white") +
      scale_fill_manual(
        values = c("TRUE" = color_meets, "FALSE" = color_not_meets),
        labels = c("TRUE" = "Meets Target", "FALSE" = "Below Target"),
        name = "Status",
        na.value = "gray70"
      ) +
      labs(
        title = chart_titles[i],
        subtitle = paste("Health outcome performance -", recent_year),
        x = "Health Outcome Indicator",
        y = NULL,
        caption = "Source: Health Financing Data | Countries sorted by outcomes met"
      ) +
      theme_minimal(base_size = base_font_size) +
      theme(
        plot.title = element_text(face = "bold", size = 18, hjust = 0.5),
        plot.subtitle = element_text(size = 12, hjust = 0.5, color = "gray40", margin = margin(b = 20)),
        plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
        axis.text.x = element_text(size = 11, face = "bold"),
        axis.text.y = element_text(size = axis_text_size),
        axis.title.x = element_text(margin = margin(t = 15), face = "bold"),
        legend.position = "top",
        legend.title = element_text(face = "bold", size = 11),
        legend.text = element_text(size = 10),
        panel.grid = element_blank(),
        plot.margin = margin(20, 20, 20, 20)
      )

    # Save chart with calculated height (more compact)
    chart_height <- min(max(8, n_countries_cat * 0.25), 35)  # Cap at 35 inches, 0.25" per country
    ggsave(paste0("../reports/charts_v2_R/alternative_visualizations/", chart_files[i]), p,
           width = 10, height = chart_height, dpi = 300, bg = "white", limitsize = FALSE)
  } else {
    cat(paste0("  No countries in category: ", categories[i], "\n"))
  }
}

cat("\n✔ Expenditure-outcome charts saved to: ../reports/charts_v2_R/alternative_visualizations/\n")
cat("  - expenditure_below50_outcomes.png\n")
cat("  - expenditure_50to75_outcomes.png\n")
cat("  - expenditure_75to100_outcomes.png\n")
cat("  - expenditure_meets_outcomes.png\n")

# ============================================================
# ALTERNATIVE VISUALIZATIONS - Same Data, Different Styles
# ============================================================
cat("\n========================================\n")
cat("GENERATING ALTERNATIVE VISUALIZATIONS\n")
cat("========================================\n\n")

# ============================================================
# ALT CHART 1: Scatter Plot - Expenditure % vs Outcomes Met
# ============================================================
cat("Creating Alt Chart 1: Scatter Plot - Expenditure vs Outcomes...\n")

scatter_data <- health_outcomes %>%
  mutate(
    outcomes_met = (as.integer(uhc_meets) + as.integer(nmr_meets) + as.integer(mmr_meets))
  ) %>%
  filter(!is.na(pct_of_threshold) & !is.na(outcomes_met))

p_scatter <- ggplot(scatter_data, aes(x = pct_of_threshold, y = outcomes_met)) +
  geom_vline(xintercept = c(50, 75, 100), linetype = "dashed", color = "gray60", alpha = 0.7) +
  geom_jitter(aes(color = expenditure_category, size = per_capita),
              width = 2, height = 0.15, alpha = 0.7) +
  geom_text(data = scatter_data %>% filter(outcomes_met >= 2 | pct_of_threshold >= 100),
            aes(label = country), size = 3, hjust = -0.1, vjust = 0.5, check_overlap = TRUE) +
  scale_color_manual(
    values = c(
      "Below 50% of expenditure threshold" = "#E74C3C",
      "50-74.9% of expenditure threshold" = "#F39C12",
      "75-99.9% of expenditure threshold" = "#F1C40F",
      "Meet expenditure threshold target" = "#2ECC71"
    ),
    name = "Expenditure Category"
  ) +
  scale_size_continuous(name = "Per Capita ($)", range = c(3, 12)) +
  scale_y_continuous(breaks = 0:3, limits = c(-0.3, 3.3)) +
  labs(
    title = "Health Expenditure vs Health Outcomes Achievement",
    subtitle = paste("Relationship between spending levels and outcome targets met -", recent_year),
    x = "Government Health Expenditure (% of Income-Specific Threshold)",
    y = "Number of Health Outcome Targets Met (out of 3)",
    caption = "Vertical lines at 50%, 75%, 100% | Size = per capita spending | Targets: UHC ≥75, NMR ≤12, MMR ≤70"
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0, margin = margin(t = 10)),
    legend.position = "right",
    legend.title = element_text(face = "bold", size = 10),
    legend.text = element_text(size = 9),
    panel.grid.minor = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/alt_scatter_expenditure_outcomes.png", p_scatter,
       width = 14, height = 8, dpi = 300, bg = "white")

# ============================================================
# ALT CHART 2: Grouped Bar Chart - Outcome Achievement by Category
# ============================================================
cat("Creating Alt Chart 2: Grouped Bar - Outcomes by Expenditure Category...\n")

outcome_by_cat <- outcome_viz_data %>%
  filter(!is.na(meets)) %>%
  group_by(expenditure_category, outcome_clean) %>%
  summarise(
    total = n(),
    meets_target = sum(meets, na.rm = TRUE),
    pct_meets = 100 * meets_target / total,
    .groups = "drop"
  )

p_grouped_bar <- ggplot(outcome_by_cat, aes(x = expenditure_category, y = pct_meets, fill = outcome_clean)) +
  geom_col(position = position_dodge(width = 0.8), width = 0.7) +
  geom_text(aes(label = paste0(round(pct_meets, 1), "%")),
            position = position_dodge(width = 0.8), vjust = -0.5, size = 3.5, fontface = "bold") +
  scale_fill_manual(
    values = c(
      "Universal Health\nCoverage (≥75)" = "#3498DB",
      "Neonatal Mortality\n(≤12 per 1,000)" = "#9B59B6",
      "Maternal Mortality\n(≤70 per 100,000)" = "#E67E22"
    ),
    name = "Health Outcome"
  ) +
  scale_y_continuous(limits = c(0, 110), breaks = seq(0, 100, 20)) +
  labs(
    title = "Health Outcome Achievement Rates by Expenditure Level",
    subtitle = paste("Percentage of countries meeting targets within each expenditure category -", recent_year),
    x = "Government Health Expenditure Category",
    y = "% of Countries Meeting Target",
    caption = "Source: Health Financing Data"
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
    axis.text.x = element_text(angle = 15, hjust = 1, size = 10),
    axis.text.y = element_text(size = 10),
    axis.title = element_text(face = "bold", size = 11),
    legend.position = "top",
    legend.title = element_text(face = "bold"),
    panel.grid.minor = element_blank(),
    panel.grid.major.x = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/alt_grouped_bar_outcomes.png", p_grouped_bar,
       width = 12, height = 8, dpi = 300, bg = "white")

# ============================================================
# ALT CHART 3: Faceted Dot Plot - Individual Outcomes
# ============================================================
cat("Creating Alt Chart 3: Faceted Dot Plot - Individual Outcomes...\n")

outcome_long <- health_outcomes %>%
  select(country, expenditure_category, pct_of_threshold, uhc, nmr, mmr, uhc_meets, nmr_meets, mmr_meets) %>%
  pivot_longer(cols = c(uhc, nmr, mmr), names_to = "outcome_type", values_to = "value") %>%
  mutate(
    meets = case_when(
      outcome_type == "uhc" ~ uhc_meets,
      outcome_type == "nmr" ~ nmr_meets,
      outcome_type == "mmr" ~ mmr_meets
    ),
    outcome_label = case_when(
      outcome_type == "uhc" ~ "Universal Health Coverage",
      outcome_type == "nmr" ~ "Neonatal Mortality Rate",
      outcome_type == "mmr" ~ "Maternal Mortality Ratio"
    ),
    target_line = case_when(
      outcome_type == "uhc" ~ 75,
      outcome_type == "nmr" ~ 12,
      outcome_type == "mmr" ~ 70
    )
  ) %>%
  filter(!is.na(value))

p_faceted_dot <- ggplot(outcome_long, aes(x = pct_of_threshold, y = value, color = meets)) +
  geom_hline(aes(yintercept = target_line), linetype = "dashed", color = "black", size = 0.8) +
  geom_point(alpha = 0.6, size = 3) +
  scale_color_manual(
    values = c("TRUE" = color_meets, "FALSE" = color_not_meets),
    labels = c("TRUE" = "Meets Target", "FALSE" = "Below Target"),
    name = "Status"
  ) +
  facet_wrap(~ outcome_label, scales = "free_y", ncol = 1) +
  labs(
    title = "Health Outcomes vs Government Expenditure Performance",
    subtitle = paste("Actual outcome values plotted against expenditure threshold achievement -", recent_year),
    x = "Government Health Expenditure (% of Income-Specific Threshold)",
    y = "Outcome Value",
    caption = "Dashed line = Target threshold | Each point = one country"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
    strip.text = element_text(face = "bold", size = 11),
    strip.background = element_rect(fill = "gray90", color = NA),
    legend.position = "top",
    legend.title = element_text(face = "bold"),
    panel.grid.minor = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/alt_faceted_dot_outcomes.png", p_faceted_dot,
       width = 12, height = 12, dpi = 300, bg = "white")

# ============================================================
# ALT CHART 4: Stacked Bar - Outcome Profile by Category
# ============================================================
cat("Creating Alt Chart 4: Stacked Bar - Outcome Achievement Profile...\n")

outcome_profile <- health_outcomes %>%
  mutate(
    outcome_score = case_when(
      (as.integer(uhc_meets) + as.integer(nmr_meets) + as.integer(mmr_meets)) == 3 ~ "All 3 targets met",
      (as.integer(uhc_meets) + as.integer(nmr_meets) + as.integer(mmr_meets)) == 2 ~ "2 targets met",
      (as.integer(uhc_meets) + as.integer(nmr_meets) + as.integer(mmr_meets)) == 1 ~ "1 target met",
      TRUE ~ "No targets met"
    ),
    outcome_score = factor(outcome_score, levels = c("All 3 targets met", "2 targets met", "1 target met", "No targets met"))
  ) %>%
  group_by(expenditure_category, outcome_score) %>%
  summarise(count = n(), .groups = "drop") %>%
  group_by(expenditure_category) %>%
  mutate(total = sum(count), pct = 100 * count / total)

p_stacked <- ggplot(outcome_profile, aes(x = expenditure_category, y = count, fill = outcome_score)) +
  geom_col(width = 0.7) +
  geom_text(aes(label = ifelse(count > 0, count, "")),
            position = position_stack(vjust = 0.5), size = 4, fontface = "bold", color = "white") +
  scale_fill_manual(
    values = c(
      "All 3 targets met" = "#27AE60",
      "2 targets met" = "#52BE80",
      "1 target met" = "#F39C12",
      "No targets met" = "#E74C3C"
    ),
    name = "Outcome Achievement"
  ) +
  labs(
    title = "Health Outcome Achievement Profile by Expenditure Category",
    subtitle = paste("Distribution of countries by number of outcome targets met -", recent_year),
    x = "Government Health Expenditure Category",
    y = "Number of Countries",
    caption = "Source: Health Financing Data | Targets: UHC ≥75, NMR ≤12, MMR ≤70"
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
    axis.text.x = element_text(angle = 15, hjust = 1, size = 10),
    axis.text.y = element_text(size = 10),
    axis.title = element_text(face = "bold", size = 11),
    legend.position = "top",
    legend.title = element_text(face = "bold"),
    panel.grid.minor = element_blank(),
    panel.grid.major.x = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/alt_stacked_outcome_profile.png", p_stacked,
       width = 12, height = 8, dpi = 300, bg = "white")

# ============================================================
# ALT CHART 5: Bubble Chart - All Three Dimensions
# ============================================================
cat("Creating Alt Chart 5: Bubble Chart - Multi-dimensional View...\n")

bubble_data <- health_outcomes %>%
  mutate(outcomes_met = (as.integer(uhc_meets) + as.integer(nmr_meets) + as.integer(mmr_meets))) %>%
  filter(!is.na(uhc) & !is.na(nmr))

p_bubble <- ggplot(bubble_data, aes(x = uhc, y = nmr, size = mmr, color = expenditure_category)) +
  geom_hline(yintercept = 12, linetype = "dashed", color = "gray50", alpha = 0.5) +
  geom_vline(xintercept = 75, linetype = "dashed", color = "gray50", alpha = 0.5) +
  geom_point(alpha = 0.6) +
  scale_color_manual(
    values = c(
      "Below 50% of expenditure threshold" = "#E74C3C",
      "50-74.9% of expenditure threshold" = "#F39C12",
      "75-99.9% of expenditure threshold" = "#F1C40F",
      "Meet expenditure threshold target" = "#2ECC71"
    ),
    name = "Expenditure Category"
  ) +
  scale_size_continuous(name = "MMR (per 100k)", range = c(3, 15)) +
  scale_y_reverse() +
  labs(
    title = "Multi-Dimensional Health Outcome View",
    subtitle = paste("UHC, Neonatal Mortality, and Maternal Mortality by expenditure level -", recent_year),
    x = "Universal Health Coverage Index (target: ≥75)",
    y = "Neonatal Mortality Rate (target: ≤12 per 1,000)",
    caption = "Bubble size = Maternal Mortality Ratio | Dashed lines = target thresholds"
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
    legend.position = "right",
    legend.title = element_text(face = "bold", size = 10),
    legend.text = element_text(size = 9),
    panel.grid.minor = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("../reports/charts_v2_R/alternative_visualizations/alt_bubble_multidimensional.png", p_bubble,
       width = 14, height = 10, dpi = 300, bg = "white")

cat("\n✔ Alternative visualization charts saved to: ../reports/charts_v2_R/alternative_visualizations/\n")
cat("  - alt_scatter_expenditure_outcomes.png\n")
cat("  - alt_grouped_bar_outcomes.png\n")
cat("  - alt_faceted_dot_outcomes.png\n")
cat("  - alt_stacked_outcome_profile.png\n")
cat("  - alt_bubble_multidimensional.png\n")

cat("\n✔ Script completed successfully!\n")
