# =============================================================================
# Generate Charts for Health Financing Gap Highlights - Version 2 (Complete)
# =============================================================================
# Creates ALL visualizations for the UPDATED key messages.
# Includes corrections to the Abuja Declaration chart and new highlights.
#
# Author: Health Financing Gap Analysis Team
# Date: March 2026
# =============================================================================

# Load required libraries
required_packages <- c("ggplot2", "dplyr", "tidyr", "readr", "scales",
                       "ggthemes", "patchwork", "ineq", "RColorBrewer")

for (pkg in required_packages) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cran.r-project.org")
    library(pkg, character.only = TRUE)
  }
}

# =============================================================================
# Configuration
# =============================================================================

get_base_dir <- function() {
  if (requireNamespace("rstudioapi", quietly = TRUE) && rstudioapi::isAvailable()) {
    script_path <- tryCatch(
      rstudioapi::getSourceEditorContext()$path,
      error = function(e) NULL
    )
    if (!is.null(script_path) && script_path != "") {
      return(dirname(dirname(script_path)))
    }
  }
  return("C:/Users/peter/OneDrive - Smart Workplace/OneDrive documents/GitHub/AI and Data Commons (Google) Project  (UN-ECA-ACS)/Health Financing Gap/health-financing-platform")
}

BASE_DIR <- get_base_dir()
DATA_DIR <- file.path(BASE_DIR, "processed_data")
OUTPUT_DIR <- file.path(BASE_DIR, "reports", "charts_v2_R")

if (!dir.exists(OUTPUT_DIR)) dir.create(OUTPUT_DIR, recursive = TRUE)

# =============================================================================
# Color Schemes
# =============================================================================

COLORS <- list(
  primary = "#1F4E79",
  secondary = "#2E75B6",
  accent = "#5B9BD5",
  warning = "#ED7D31",
  danger = "#C00000",
  success = "#70AD47",
  neutral = "#7F7F7F",
  light = "#D6DCE4"
)

INCOME_COLORS <- c(
  "Low" = "#C00000",
  "Lower-middle" = "#ED7D31",
  "Upper-middle" = "#70AD47"
)

SUBREGION_COLORS <- c(
  "Eastern Africa" = "#1F4E79",
  "Central Africa" = "#2E75B6",
  "Northern Africa" = "#5B9BD5",
  "Southern Africa" = "#70AD47",
  "Western Africa" = "#ED7D31"
)

# Custom theme with better margins for labels
theme_health <- function() {
  theme_minimal() +
    theme(
      plot.title = element_text(face = "bold", size = 13, hjust = 0.5),
      plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
      plot.caption = element_text(size = 9, hjust = 0, face = "italic", color = "red"),
      axis.title = element_text(face = "bold", size = 11),
      axis.text = element_text(size = 10),
      legend.title = element_text(face = "bold"),
      panel.grid.minor = element_blank(),
      plot.margin = margin(15, 15, 15, 15)
    )
}

# =============================================================================
# Load Data
# =============================================================================

load_data <- function() {
  df <- read_csv(file.path(DATA_DIR, "master_dataset.csv"), show_col_types = FALSE)
  df <- df %>% filter(year >= 2000, year <= 2023)
  return(df)
}

# =============================================================================
# CHART 1: Countries Meeting Threshold by Year
# =============================================================================
chart_threshold_by_year <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(
      countries_meeting = sum(`Gov exp Health per capita More than Threshold`, na.rm = TRUE),
      total_countries = n_distinct(location),
      .groups = "drop"
    ) %>%
    mutate(pct = round(countries_meeting / total_countries * 100, 1))

  max_y <- max(yearly$countries_meeting) + 4

  p <- ggplot(yearly, aes(x = year, y = countries_meeting)) +
    geom_bar(stat = "identity", fill = COLORS$primary, color = "white") +
    geom_bar(data = yearly %>% filter(year == 2023),
             stat = "identity", fill = COLORS$warning, color = "white") +
    geom_text(aes(label = paste0(countries_meeting, "\n(", pct, "%)")),
              vjust = -0.3, size = 2.2, fontface = "bold") +
    geom_hline(yintercept = 3, linetype = "dashed", color = COLORS$danger, alpha = 0.7) +
    labs(
      title = "African Countries Meeting Government Health Spending Threshold (2000-2023)",
      subtitle = "Only 3 countries (5.6%) exceeded the threshold in 2023",
      x = "Year", y = "Number of Countries Meeting Threshold"
    ) +
    scale_y_continuous(limits = c(0, max_y), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart01_threshold_by_year.png"), p,
         width = 14, height = 7, dpi = 300)
  message("  Saved: chart01_threshold_by_year.png")
}

# =============================================================================
# CHART 2: Threshold Achievement by Income Group (2023)
# =============================================================================
chart_threshold_by_income_2023 <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  income_data <- df_2023 %>%
    group_by(income) %>%
    summarise(
      meeting = sum(`Gov exp Health per capita More than Threshold`, na.rm = TRUE),
      total = n(),
      .groups = "drop"
    ) %>%
    mutate(
      not_meeting = total - meeting,
      income = factor(income, levels = c("Low", "Lower-middle", "Upper-middle"))
    ) %>%
    arrange(income)

  income_long <- income_data %>%
    pivot_longer(cols = c(meeting, not_meeting), names_to = "status", values_to = "count") %>%
    mutate(status = factor(status, levels = c("not_meeting", "meeting"),
                           labels = c("Not Meeting Threshold", "Meeting Threshold")))

  p <- ggplot(income_long, aes(x = income, y = count, fill = status)) +
    geom_bar(stat = "identity", color = "white") +
    geom_text(aes(label = ifelse(count > 0, count, "")),
              position = position_stack(vjust = 0.5),
              color = "white", fontface = "bold", size = 5) +
    scale_fill_manual(values = c("Not Meeting Threshold" = COLORS$danger,
                                  "Meeting Threshold" = COLORS$success)) +
    labs(
      title = "Government Health Spending Threshold Achievement by Income Group (2023)",
      subtitle = "All 22 low-income countries fell short of the threshold",
      x = "Income Group", y = "Number of Countries", fill = ""
    ) +
    theme_health() +
    theme(legend.position = "top")

  ggsave(file.path(OUTPUT_DIR, "chart02_threshold_by_income_2023.png"), p,
         width = 10, height = 7, dpi = 300)
  message("  Saved: chart02_threshold_by_income_2023.png")
}

# =============================================================================
# CHART 3: Spending Gap Widening Over Time
# =============================================================================
chart_spending_gap_trend <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(
      max_spending = max(`Gov exp Health per capita`, na.rm = TRUE),
      min_spending = min(`Gov exp Health per capita`, na.rm = TRUE),
      .groups = "drop"
    ) %>%
    mutate(gap = max_spending - min_spending)

  highlights <- yearly %>% filter(year %in% c(2015, 2023))
  max_y <- max(yearly$gap) + 80

  p <- ggplot(yearly, aes(x = year, y = gap)) +
    geom_ribbon(aes(ymin = 0, ymax = gap), fill = COLORS$primary, alpha = 0.2) +
    geom_line(color = COLORS$primary, linewidth = 1.2) +
    geom_point(color = COLORS$primary, size = 3) +
    geom_point(data = highlights, color = COLORS$warning, size = 6) +
    geom_text(data = highlights, aes(label = paste0("$", round(gap, 0))),
              vjust = -1.5, fontface = "bold", color = COLORS$warning, size = 4) +
    labs(
      title = "Widening Gap in Government Health Spending Per Capita (2000-2023)",
      subtitle = "Gap increased from $416 (2015) to $535 (2023) between highest and lowest spending countries",
      x = "Year", y = "Gap in Per Capita Spending (USD)"
    ) +
    scale_y_continuous(limits = c(0, max_y), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart03_spending_gap_trend.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart03_spending_gap_trend.png")
}

# =============================================================================
# CHART 4: Health Expenditure vs Abuja Target - CORRECTED!
# =============================================================================
chart_abuja_comparison_corrected <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(avg_budget = mean(`Gov exp Health on budget`, na.rm = TRUE), .groups = "drop")

  avg_overall <- mean(yearly$avg_budget, na.rm = TRUE)

  p <- ggplot(yearly, aes(x = year, y = avg_budget)) +
    geom_ribbon(aes(ymin = avg_budget, ymax = 15), fill = COLORS$danger, alpha = 0.2) +
    geom_line(color = COLORS$primary, linewidth = 1.2) +
    geom_point(color = COLORS$primary, size = 2) +
    geom_hline(yintercept = 15, linetype = "dashed", color = COLORS$danger, linewidth = 1) +
    annotate("text", x = 2011, y = avg_overall + 2.5,
             label = paste0("Average: ", round(avg_overall, 1), "%\n(Less than half of target)"),
             fontface = "bold", color = COLORS$primary, size = 4) +
    annotate("text", x = 2019, y = 16.5, label = "Abuja Target (15%)",
             color = COLORS$danger, fontface = "bold", size = 4) +
    labs(
      title = "Government Health Expenditure vs Abuja Declaration Target (2000-2023)",
      subtitle = "Africa's average (~7% of Gov Budget) is less than half the 15% Abuja target",
      x = "Year", y = "Health Expenditure as % of Government Budget",
      caption = "Note: Abuja Declaration refers to % of Government Budget, not % of GDP"
    ) +
    scale_y_continuous(limits = c(0, 22), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart04_abuja_comparison_CORRECTED.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart04_abuja_comparison_CORRECTED.png")
}

# =============================================================================
# CHART 5: Countries Meeting Abuja Target Over Time
# =============================================================================
chart_abuja_countries_trend <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(countries_meeting = sum(`Gov exp Health on budget > 15`, na.rm = TRUE), .groups = "drop") %>%
    mutate(highlight = case_when(
      year == 2023 ~ "2023",
      year == 2022 ~ "2022",
      TRUE ~ "Other"
    ))

  max_y <- max(yearly$countries_meeting) + 2

  p <- ggplot(yearly, aes(x = year, y = countries_meeting, fill = highlight)) +
    geom_bar(stat = "identity", color = "white") +
    geom_text(aes(label = countries_meeting), vjust = -0.5, fontface = "bold", size = 3) +
    scale_fill_manual(values = c("2023" = COLORS$danger, "2022" = COLORS$warning, "Other" = COLORS$primary)) +
    labs(
      title = "African Countries Meeting Abuja Declaration Target (>15% of Budget to Health)",
      subtitle = "Only 1 country met the target in 2023, down from 3 in 2022",
      x = "Year", y = "Number of Countries"
    ) +
    scale_y_continuous(limits = c(0, max_y), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

  ggsave(file.path(OUTPUT_DIR, "chart05_abuja_countries_trend.png"), p,
         width = 14, height = 7, dpi = 300)
  message("  Saved: chart05_abuja_countries_trend.png")
}

# =============================================================================
# CHART 6: OOP Threshold Achievement (2023)
# =============================================================================
chart_oop_threshold_2023 <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  below_20 <- sum(df_2023$`Out-of-pocket on health exp < 20`, na.rm = TRUE)
  total <- nrow(df_2023)
  above_20 <- total - below_20

  pie_data <- data.frame(
    category = c("Met Target\n(OOP <20%)", "Did Not Meet\n(OOP >20%)"),
    count = c(below_20, above_20),
    pct = c(below_20/total * 100, above_20/total * 100)
  )

  p <- ggplot(pie_data, aes(x = "", y = count, fill = category)) +
    geom_bar(stat = "identity", width = 1, color = "white") +
    coord_polar("y", start = 0) +
    geom_text(aes(label = paste0(count, " countries\n(", round(pct, 1), "%)")),
              position = position_stack(vjust = 0.5), color = "white", fontface = "bold", size = 4) +
    scale_fill_manual(values = c("Met Target\n(OOP <20%)" = COLORS$success,
                                  "Did Not Meet\n(OOP >20%)" = COLORS$danger)) +
    labs(
      title = "Out-of-Pocket Health Expenditure Target Achievement (2023)",
      subtitle = "Only about a quarter (13 out of 54) of African countries reached the <20% OOP target",
      fill = ""
    ) +
    theme_void() +
    theme(
      plot.title = element_text(face = "bold", size = 13, hjust = 0.5),
      plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
      legend.position = "bottom"
    )

  ggsave(file.path(OUTPUT_DIR, "chart06_oop_threshold_2023.png"), p,
         width = 10, height = 9, dpi = 300)
  message("  Saved: chart06_oop_threshold_2023.png")
}

# =============================================================================
# CHART 7: Donor Dependency Trend
# =============================================================================
chart_donor_dependency_trend <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(avg_external = mean(`External on health exp`, na.rm = TRUE), .groups = "drop")

  highlights <- yearly %>% filter(year %in% c(2000, 2023))
  max_y <- max(yearly$avg_external) + 8

  p <- ggplot(yearly, aes(x = year, y = avg_external)) +
    geom_ribbon(aes(ymin = 0, ymax = avg_external), fill = COLORS$warning, alpha = 0.2) +
    geom_line(color = COLORS$warning, linewidth = 1.2) +
    geom_point(color = COLORS$warning, size = 2) +
    geom_point(data = highlights, color = COLORS$danger, size = 6) +
    geom_text(data = highlights, aes(label = paste0(round(avg_external, 1), "%")),
              vjust = -1.5, fontface = "bold", color = COLORS$danger, size = 4) +
    labs(
      title = "Growing Donor Dependency in African Health Financing (2000-2023)",
      subtitle = "Development partner share more than doubled from 10.7% to 23.4%",
      x = "Year", y = "External/Donor Share of Health Expenditure (%)"
    ) +
    scale_y_continuous(limits = c(0, max_y), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart07_donor_dependency_trend.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart07_donor_dependency_trend.png")
}

# =============================================================================
# CHART 8: Donor Dependency Change by Subregion
# =============================================================================
chart_donor_dependency_by_subregion <- function(df) {
  df_2000 <- df %>% filter(year == 2000) %>%
    group_by(Subregion) %>%
    summarise(ext_2000 = mean(`External on health exp`, na.rm = TRUE), .groups = "drop")

  df_2023 <- df %>% filter(year == 2023) %>%
    group_by(Subregion) %>%
    summarise(ext_2023 = mean(`External on health exp`, na.rm = TRUE), .groups = "drop")

  change <- df_2000 %>%
    left_join(df_2023, by = "Subregion") %>%
    mutate(change = ext_2023 - ext_2000) %>%
    arrange(change)

  change$Subregion <- factor(change$Subregion, levels = change$Subregion)
  max_x <- max(change$change) + 5

  p <- ggplot(change, aes(x = Subregion, y = change, fill = Subregion)) +
    geom_bar(stat = "identity", color = "white") +
    geom_text(aes(label = paste0("+", round(change, 1), " pp")),
              hjust = -0.1, fontface = "bold", size = 4) +
    scale_fill_manual(values = SUBREGION_COLORS) +
    coord_flip() +
    labs(
      title = "Change in Donor Dependency by Sub-region (2000-2023)",
      subtitle = "Southern Africa saw the largest increase in donor dependency",
      x = "", y = "Change in Donor Dependency (percentage points)"
    ) +
    scale_y_continuous(limits = c(0, max_x), expand = c(0, 0)) +
    theme_health() +
    theme(legend.position = "none")

  ggsave(file.path(OUTPUT_DIR, "chart08_donor_dependency_by_subregion.png"), p,
         width = 11, height = 7, dpi = 300)
  message("  Saved: chart08_donor_dependency_by_subregion.png")
}

# =============================================================================
# CHART 9: Financing Gap by Subregion
# =============================================================================
chart_gap_by_subregion <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  subregion_gap <- df_2023 %>%
    group_by(Subregion) %>%
    summarise(avg_gap = mean(`Gap for Gov exp Health per capita`, na.rm = TRUE), .groups = "drop") %>%
    arrange(avg_gap)

  subregion_gap$Subregion <- factor(subregion_gap$Subregion, levels = subregion_gap$Subregion)
  overall_avg <- mean(df_2023$`Gap for Gov exp Health per capita`, na.rm = TRUE)
  max_x <- max(subregion_gap$avg_gap) + 30

  p <- ggplot(subregion_gap, aes(x = Subregion, y = avg_gap, fill = Subregion)) +
    geom_bar(stat = "identity", color = "white") +
    geom_text(aes(label = paste0("$", round(avg_gap, 1))), hjust = -0.1, fontface = "bold", size = 4) +
    geom_hline(yintercept = overall_avg, linetype = "dashed", color = COLORS$danger, linewidth = 1) +
    annotate("text", x = 0.7, y = overall_avg + 8,
             label = paste0("Africa Avg: $", round(overall_avg, 1)),
             color = COLORS$danger, fontface = "bold", hjust = 0, size = 3.5) +
    scale_fill_manual(values = SUBREGION_COLORS) +
    coord_flip() +
    labs(
      title = "Government Health Financing Gap by Sub-region (2023)",
      subtitle = "Central Africa has the largest gap ($179.2); Eastern Africa has the smallest ($109.6)",
      x = "", y = "Average Health Financing Gap (USD per capita)"
    ) +
    scale_y_continuous(limits = c(0, max_x), expand = c(0, 0)) +
    theme_health() +
    theme(legend.position = "none")

  ggsave(file.path(OUTPUT_DIR, "chart09_gap_by_subregion.png"), p,
         width = 11, height = 7, dpi = 300)
  message("  Saved: chart09_gap_by_subregion.png")
}

# =============================================================================
# CHART 10: Gini Inequality by Income Group
# =============================================================================
chart_gini_by_income <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  gini_data <- df_2023 %>%
    group_by(income) %>%
    filter(!is.na(`Gov exp Health per capita`)) %>%
    summarise(gini = ineq(`Gov exp Health per capita`, type = "Gini"), .groups = "drop") %>%
    mutate(income = factor(income, levels = c("Low", "Lower-middle", "Upper-middle"))) %>%
    arrange(income)

  p <- ggplot(gini_data, aes(x = income, y = gini, fill = income)) +
    geom_bar(stat = "identity", color = "white", width = 0.6) +
    geom_text(aes(label = round(gini, 2)), vjust = -0.5, fontface = "bold", size = 5) +
    scale_fill_manual(values = INCOME_COLORS) +
    labs(
      title = "Inequality in Government Health Spending by Income Group (2023)",
      subtitle = "Lower-middle income countries (0.48) show nearly twice the inequality of upper-middle (0.25)",
      x = "Income Group", y = "Gini Coefficient"
    ) +
    scale_y_continuous(limits = c(0, 0.65), expand = c(0, 0)) +
    theme_health() +
    theme(legend.position = "none")

  ggsave(file.path(OUTPUT_DIR, "chart10_gini_by_income.png"), p,
         width = 10, height = 7, dpi = 300)
  message("  Saved: chart10_gini_by_income.png")
}

# =============================================================================
# CHART 11: Budget Priority Gap by Income Group
# =============================================================================
chart_budget_gap_by_income <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  income_gap <- df_2023 %>%
    group_by(income) %>%
    summarise(avg_gap = mean(`Gap Gov exp Health on budget`, na.rm = TRUE), .groups = "drop") %>%
    mutate(income = factor(income, levels = c("Low", "Lower-middle", "Upper-middle"))) %>%
    arrange(income)

  overall_avg <- mean(df_2023$`Gap Gov exp Health on budget`, na.rm = TRUE)

  p <- ggplot(income_gap, aes(x = income, y = avg_gap, fill = income)) +
    geom_bar(stat = "identity", color = "white", width = 0.6) +
    geom_text(aes(label = paste0(round(avg_gap, 1), "%")), vjust = -0.5, fontface = "bold", size = 5) +
    geom_hline(yintercept = overall_avg, linetype = "dashed", color = COLORS$primary, linewidth = 1) +
    scale_fill_manual(values = INCOME_COLORS) +
    labs(
      title = "Gap to Abuja Target (15%) by Income Group (2023)",
      subtitle = "Low-income countries face the largest gap at 9.5 percentage points",
      x = "Income Group", y = "Budget Priority Gap (percentage points)"
    ) +
    scale_y_continuous(limits = c(0, 13), expand = c(0, 0)) +
    theme_health() +
    theme(legend.position = "none")

  ggsave(file.path(OUTPUT_DIR, "chart11_budget_gap_by_income.png"), p,
         width = 10, height = 7, dpi = 300)
  message("  Saved: chart11_budget_gap_by_income.png")
}

# =============================================================================
# CHART 12: Financial Protection Trend
# =============================================================================
chart_oop_protection_trend <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(
      below_threshold = sum(`Out-of-pocket on health exp < 20`, na.rm = TRUE),
      total = n_distinct(location),
      .groups = "drop"
    ) %>%
    mutate(pct_protected = below_threshold / total * 100)

  highlights <- yearly %>% filter(year %in% c(2000, 2023))
  max_y <- max(yearly$pct_protected) + 8

  p <- ggplot(yearly, aes(x = year, y = pct_protected)) +
    geom_ribbon(aes(ymin = 0, ymax = pct_protected), fill = COLORS$success, alpha = 0.2) +
    geom_line(color = COLORS$success, linewidth = 1.2) +
    geom_point(color = COLORS$success, size = 2) +
    geom_point(data = highlights, color = COLORS$primary, size = 6) +
    geom_text(data = highlights, aes(label = paste0(round(pct_protected, 1), "%")),
              vjust = -1.5, fontface = "bold", color = COLORS$primary, size = 4) +
    labs(
      title = "Financial Protection in Health: Countries Meeting <20% OOP Target (2000-2023)",
      subtitle = "Improved by more than 10 percentage points from 13.7% to 24.1%",
      x = "Year", y = "% of Countries with OOP < 20%"
    ) +
    scale_y_continuous(limits = c(0, max_y), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart12_oop_protection_trend.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart12_oop_protection_trend.png")
}

# =============================================================================
# CHART 13: Financial Hardship Trend
# =============================================================================
chart_financial_hardship_trend <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(avg_hardship = mean(`financial hardship`, na.rm = TRUE), .groups = "drop")

  highlights <- yearly %>% filter(year %in% c(2000, 2022))
  max_y <- max(yearly$avg_hardship, na.rm = TRUE) + 8

  p <- ggplot(yearly, aes(x = year, y = avg_hardship)) +
    geom_ribbon(aes(ymin = 0, ymax = avg_hardship), fill = COLORS$danger, alpha = 0.2) +
    geom_line(color = COLORS$danger, linewidth = 1.2) +
    geom_point(color = COLORS$danger, size = 2) +
    geom_point(data = highlights, color = COLORS$primary, size = 6) +
    geom_text(data = highlights, aes(label = paste0(round(avg_hardship, 1), "%")),
              vjust = -1.5, fontface = "bold", color = COLORS$primary, size = 4) +
    labs(
      title = "Financial Hardship Due to Out-of-Pocket Health Spending (2000-2023)",
      subtitle = "Declined from 44.9% (2000) to 35.0% (2022), but still affects >1/3 of households",
      x = "Year", y = "% of Households Facing Financial Hardship"
    ) +
    scale_y_continuous(limits = c(0, max_y), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart13_financial_hardship_trend.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart13_financial_hardship_trend.png")
}

# =============================================================================
# CHART 14: Financing Sources (2014-2023)
# =============================================================================
chart_financing_sources <- function(df) {
  df_recent <- df %>% filter(year >= 2014, year <= 2023)

  sources <- c("Govern on health exp", "Out-of-pocket on health exp",
               "External on health exp", "Voluntary Prepayments on health exp",
               "Other Private on health exp")

  yearly <- df_recent %>%
    group_by(year) %>%
    summarise(across(all_of(sources), ~mean(.x, na.rm = TRUE)), .groups = "drop")

  yearly_long <- yearly %>%
    pivot_longer(cols = -year, names_to = "source", values_to = "value") %>%
    mutate(source = factor(source, levels = sources,
                           labels = c("Government", "Out-of-Pocket", "External/Donors",
                                      "Voluntary Prepaid", "Other Private")))

  source_colors <- c("Government" = COLORS$primary, "Out-of-Pocket" = COLORS$danger,
                     "External/Donors" = COLORS$warning, "Voluntary Prepaid" = COLORS$success,
                     "Other Private" = COLORS$neutral)

  p <- ggplot(yearly_long, aes(x = year, y = value, fill = source)) +
    geom_bar(stat = "identity", color = "white") +
    scale_fill_manual(values = source_colors) +
    labs(
      title = "Health Financing Sources in Africa (2014-2023)",
      subtitle = "Out-of-pocket expenditure (36.7% average) remains the dominant financing source",
      x = "Year", y = "Share of Total Health Expenditure (%)", fill = ""
    ) +
    theme_health() +
    theme(legend.position = "right")

  ggsave(file.path(OUTPUT_DIR, "chart14_financing_sources.png"), p,
         width = 14, height = 8, dpi = 300)
  message("  Saved: chart14_financing_sources.png")
}

# =============================================================================
# CHART 15: UHC Trend
# =============================================================================
chart_uhc_trend <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(avg_uhc = mean(`Universal health coverage`, na.rm = TRUE), .groups = "drop")

  recent_avg <- yearly %>% filter(year >= 2014) %>% pull(avg_uhc) %>% mean()

  p <- ggplot(yearly, aes(x = year, y = avg_uhc)) +
    geom_ribbon(aes(ymin = 30, ymax = avg_uhc), fill = COLORS$primary, alpha = 0.2) +
    geom_line(color = COLORS$primary, linewidth = 1.2) +
    geom_point(color = COLORS$primary, size = 2) +
    geom_hline(yintercept = 50, linetype = "dashed", color = COLORS$warning, linewidth = 1) +
    annotate("text", x = 2017, y = recent_avg + 4,
             label = paste0("2014-2023 Avg: ", round(recent_avg, 1), "%"),
             fontface = "bold", color = COLORS$primary, size = 4) +
    labs(
      title = "Universal Health Coverage (UHC) Index Trend in Africa (2000-2023)",
      subtitle = "UHC has hovered around 50% with marginal increases in recent years",
      x = "Year", y = "UHC Service Coverage Index"
    ) +
    scale_y_continuous(limits = c(30, 62), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart15_uhc_trend.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart15_uhc_trend.png")
}

# =============================================================================
# CHART 16: UHC Range by Country (2023)
# =============================================================================
chart_uhc_by_country <- function(df) {
  df_2023 <- df %>%
    filter(year == 2023) %>%
    select(location, `Universal health coverage`) %>%
    filter(!is.na(`Universal health coverage`)) %>%
    arrange(`Universal health coverage`)

  df_2023$location <- factor(df_2023$location, levels = df_2023$location)

  p <- ggplot(df_2023, aes(x = location, y = `Universal health coverage`, fill = `Universal health coverage`)) +
    geom_bar(stat = "identity", color = "white") +
    geom_hline(yintercept = 50, linetype = "dashed", color = COLORS$danger, linewidth = 1) +
    scale_fill_gradient2(low = COLORS$danger, mid = COLORS$warning, high = COLORS$success, midpoint = 50) +
    coord_flip() +
    labs(
      title = "Universal Health Coverage by Country (2023)",
      subtitle = "Coverage varies more than threefold: from Chad (26%) to Seychelles (80%)",
      x = "", y = "UHC Service Coverage Index (%)"
    ) +
    theme_health() +
    theme(axis.text.y = element_text(size = 6), legend.position = "none")

  ggsave(file.path(OUTPUT_DIR, "chart16_uhc_by_country.png"), p,
         width = 14, height = 14, dpi = 300)
  message("  Saved: chart16_uhc_by_country.png")
}

# =============================================================================
# CHART 17: Neonatal Mortality Trend
# =============================================================================
chart_nmr_trend <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(avg_nmr = mean(`Neonatal mortality rate`, na.rm = TRUE), .groups = "drop")

  highlights <- yearly %>% filter(year %in% c(2000, 2023))
  max_y <- max(yearly$avg_nmr, na.rm = TRUE) + 5

  p <- ggplot(yearly, aes(x = year, y = avg_nmr)) +
    geom_ribbon(aes(ymin = 0, ymax = avg_nmr), fill = COLORS$primary, alpha = 0.2) +
    geom_line(color = COLORS$primary, linewidth = 1.2) +
    geom_point(color = COLORS$primary, size = 2) +
    geom_hline(yintercept = 12, linetype = "dashed", color = COLORS$success, linewidth = 1) +
    geom_point(data = highlights, color = COLORS$warning, size = 6) +
    geom_text(data = highlights, aes(label = round(avg_nmr, 1)),
              vjust = -1.5, fontface = "bold", color = COLORS$warning, size = 4) +
    annotate("text", x = 2019, y = 14, label = "SDG Target (12)",
             color = COLORS$success, fontface = "bold", size = 4) +
    labs(
      title = "Neonatal Mortality Rate Decline in Africa (2000-2023)",
      subtitle = "NMR declined by almost 12 points, but 2023 rate is still nearly 2x the SDG target",
      x = "Year", y = "Neonatal Mortality Rate (per 1,000 live births)"
    ) +
    scale_y_continuous(limits = c(0, max_y), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart17_nmr_trend.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart17_nmr_trend.png")
}

# =============================================================================
# CHART 18: Countries On Course for SDG NMR
# =============================================================================
chart_nmr_on_course <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  on_course <- sum(df_2023$nmr_on_course, na.rm = TRUE)
  total <- nrow(df_2023)
  not_on_course <- total - on_course

  pie_data <- data.frame(
    category = c("Not on Course", "On Course for SDG"),
    count = c(not_on_course, on_course),
    pct = c(not_on_course/total * 100, on_course/total * 100)
  )

  p <- ggplot(pie_data, aes(x = "", y = count, fill = category)) +
    geom_bar(stat = "identity", width = 1, color = "white") +
    coord_polar("y", start = 0) +
    geom_text(aes(label = paste0(count, " countries\n(", round(pct, 0), "%)")),
              position = position_stack(vjust = 0.5), color = "white", fontface = "bold", size = 4) +
    scale_fill_manual(values = c("Not on Course" = COLORS$danger, "On Course for SDG" = COLORS$success)) +
    labs(
      title = "Countries On Course for SDG Neonatal Mortality Target (2023)",
      subtitle = "Only 1 in 6 African countries (9 out of 54) is on course for the SDG target",
      fill = ""
    ) +
    theme_void() +
    theme(
      plot.title = element_text(face = "bold", size = 13, hjust = 0.5),
      plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
      legend.position = "bottom"
    )

  ggsave(file.path(OUTPUT_DIR, "chart18_nmr_on_course.png"), p,
         width = 10, height = 9, dpi = 300)
  message("  Saved: chart18_nmr_on_course.png")
}

# =============================================================================
# CHART 19: Maternal Mortality Trend
# =============================================================================
chart_mmr_trend <- function(df) {
  yearly <- df %>%
    group_by(year) %>%
    summarise(avg_mmr = mean(`Maternal mortality ratio`, na.rm = TRUE), .groups = "drop")

  highlights <- yearly %>% filter(year %in% c(2000, 2023))
  max_y <- max(yearly$avg_mmr, na.rm = TRUE) + 80

  p <- ggplot(yearly, aes(x = year, y = avg_mmr)) +
    geom_ribbon(aes(ymin = 0, ymax = avg_mmr), fill = COLORS$primary, alpha = 0.2) +
    geom_line(color = COLORS$primary, linewidth = 1.2) +
    geom_point(color = COLORS$primary, size = 2) +
    geom_hline(yintercept = 70, linetype = "dashed", color = COLORS$success, linewidth = 1) +
    geom_point(data = highlights, color = COLORS$warning, size = 6) +
    geom_text(data = highlights, aes(label = round(avg_mmr, 0)),
              vjust = -1.5, fontface = "bold", color = COLORS$warning, size = 4) +
    annotate("text", x = 2019, y = 90, label = "SDG Target (70)",
             color = COLORS$success, fontface = "bold", size = 4) +
    labs(
      title = "Maternal Mortality Ratio Decline in Africa (2000-2023)",
      subtitle = "MMR declined by about half, from 556 to 292 per 100,000 live births",
      x = "Year", y = "Maternal Mortality Ratio (per 100,000 live births)"
    ) +
    scale_y_continuous(limits = c(0, max_y), expand = c(0, 0)) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

  ggsave(file.path(OUTPUT_DIR, "chart19_mmr_trend.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart19_mmr_trend.png")
}

# =============================================================================
# CHART 20: Countries On Course for SDG MMR
# =============================================================================
chart_mmr_on_course <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  on_course <- sum(df_2023$mmr_on_course, na.rm = TRUE)
  total <- nrow(df_2023)
  not_on_course <- total - on_course

  pie_data <- data.frame(
    category = c("Not on Course", "On Course for SDG"),
    count = c(not_on_course, on_course),
    pct = c(not_on_course/total * 100, on_course/total * 100)
  )

  p <- ggplot(pie_data, aes(x = "", y = count, fill = category)) +
    geom_bar(stat = "identity", width = 1, color = "white") +
    coord_polar("y", start = 0) +
    geom_text(aes(label = paste0(count, " countries\n(", round(pct, 0), "%)")),
              position = position_stack(vjust = 0.5), color = "white", fontface = "bold", size = 4) +
    scale_fill_manual(values = c("Not on Course" = COLORS$danger, "On Course for SDG" = COLORS$success)) +
    labs(
      title = "Countries On Course for SDG Maternal Mortality Target (2023)",
      subtitle = "Only 8 out of 54 countries (15%) are on course for the SDG target of 70 per 100,000",
      fill = ""
    ) +
    theme_void() +
    theme(
      plot.title = element_text(face = "bold", size = 13, hjust = 0.5),
      plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
      legend.position = "bottom"
    )

  ggsave(file.path(OUTPUT_DIR, "chart20_mmr_on_course.png"), p,
         width = 10, height = 9, dpi = 300)
  message("  Saved: chart20_mmr_on_course.png")
}

# =============================================================================
# CHART 21: Correlation - Spending vs UHC
# =============================================================================
chart_spending_uhc_correlation <- function(df) {
  df_2023 <- df %>%
    filter(year == 2023) %>%
    select(`Gov exp Health per capita`, `Universal health coverage`, location, income) %>%
    filter(!is.na(`Gov exp Health per capita`), !is.na(`Universal health coverage`))

  corr <- cor(df_2023$`Gov exp Health per capita`, df_2023$`Universal health coverage`)

  p <- ggplot(df_2023, aes(x = `Gov exp Health per capita`, y = `Universal health coverage`, color = income)) +
    geom_point(size = 4, alpha = 0.7) +
    geom_smooth(method = "lm", se = FALSE, color = COLORS$neutral, linetype = "dashed") +
    scale_color_manual(values = INCOME_COLORS) +
    annotate("text", x = max(df_2023$`Gov exp Health per capita`) * 0.7,
             y = min(df_2023$`Universal health coverage`) + 8,
             label = paste0("Correlation: r = ", round(corr, 2)),
             fontface = "bold", color = COLORS$primary, size = 5) +
    labs(
      title = "Relationship Between Government Health Spending and UHC (2023)",
      subtitle = "Strong positive correlation (r = 0.70): Higher spending associated with better coverage",
      x = "Government Health Expenditure Per Capita (USD)",
      y = "Universal Health Coverage Index (%)",
      color = "Income Group"
    ) +
    theme_health() +
    theme(legend.position = "bottom")

  ggsave(file.path(OUTPUT_DIR, "chart21_spending_uhc_correlation.png"), p,
         width = 12, height = 9, dpi = 300)
  message("  Saved: chart21_spending_uhc_correlation.png")
}

# =============================================================================
# CHART 22: Threshold Achievement by Subregion
# =============================================================================
chart_threshold_by_subregion <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  subregion_data <- df_2023 %>%
    group_by(Subregion) %>%
    summarise(
      meeting = sum(`Gov exp Health per capita More than Threshold`, na.rm = TRUE),
      total = n(),
      .groups = "drop"
    ) %>%
    mutate(not_meeting = total - meeting)

  subregion_long <- subregion_data %>%
    pivot_longer(cols = c(meeting, not_meeting), names_to = "status", values_to = "count") %>%
    mutate(status = factor(status, levels = c("not_meeting", "meeting"),
                           labels = c("Not Meeting", "Meeting")))

  p <- ggplot(subregion_long, aes(x = Subregion, y = count, fill = status)) +
    geom_bar(stat = "identity", color = "white") +
    geom_text(aes(label = ifelse(count > 0, count, "")),
              position = position_stack(vjust = 0.5),
              color = "white", fontface = "bold", size = 4) +
    scale_fill_manual(values = c("Not Meeting" = COLORS$danger, "Meeting" = COLORS$success)) +
    labs(
      title = "Government Health Spending Threshold Achievement by Sub-region (2023)",
      subtitle = "Eastern, Northern, and Western Africa each have 1 country meeting the threshold",
      x = "", y = "Number of Countries", fill = ""
    ) +
    theme_health() +
    theme(axis.text.x = element_text(angle = 20, hjust = 1), legend.position = "top")

  ggsave(file.path(OUTPUT_DIR, "chart22_threshold_by_subregion.png"), p,
         width = 12, height = 7, dpi = 300)
  message("  Saved: chart22_threshold_by_subregion.png")
}

# =============================================================================
# CHART 23: Spending Range - Highest vs Lowest
# =============================================================================
chart_spending_range <- function(df) {
  df_2023 <- df %>%
    filter(year == 2023) %>%
    select(location, `Gov exp Health per capita`) %>%
    filter(!is.na(`Gov exp Health per capita`)) %>%
    arrange(`Gov exp Health per capita`)

  bottom5 <- head(df_2023, 5)
  top5 <- tail(df_2023, 5)

  combined <- bind_rows(
    bottom5 %>% mutate(group = "Lowest 5"),
    top5 %>% mutate(group = "Highest 5")
  )

  combined$location <- factor(combined$location, levels = c(bottom5$location, top5$location))

  p <- ggplot(combined, aes(x = location, y = `Gov exp Health per capita`, fill = group)) +
    geom_bar(stat = "identity", color = "white") +
    geom_text(aes(label = paste0("$", round(`Gov exp Health per capita`, 1))),
              hjust = -0.1, fontface = "bold", size = 3.5) +
    scale_fill_manual(values = c("Lowest 5" = COLORS$danger, "Highest 5" = COLORS$success)) +
    coord_flip() +
    facet_wrap(~group, scales = "free_y") +
    labs(
      title = "Government Health Spending Per Capita: Highest vs Lowest Countries (2023)",
      subtitle = "More than 100-fold variation: from ~$3 to over $500 per capita",
      x = "", y = "USD per capita"
    ) +
    theme_health() +
    theme(legend.position = "none", strip.text = element_text(face = "bold", size = 12))

  ggsave(file.path(OUTPUT_DIR, "chart23_spending_range.png"), p,
         width = 14, height = 7, dpi = 300)
  message("  Saved: chart23_spending_range.png")
}

# =============================================================================
# MAIN FUNCTION
# =============================================================================

generate_all_charts <- function() {
  message("=" %>% rep(70) %>% paste(collapse = ""))
  message("GENERATING ALL HEALTH FINANCING HIGHLIGHT CHARTS V2 (R VERSION)")
  message("=" %>% rep(70) %>% paste(collapse = ""))

  message("\nLoading data...")
  df <- load_data()
  message(paste("Loaded", nrow(df), "records for", n_distinct(df$location), "countries"))

  message("\nGenerating all 25 charts...")

  chart_threshold_by_year(df)
  chart_threshold_by_income_2023(df)
  chart_spending_gap_trend(df)
  chart_abuja_comparison_corrected(df)
  chart_abuja_countries_trend(df)
  chart_oop_threshold_2023(df)
  chart_donor_dependency_trend(df)
  chart_donor_dependency_by_subregion(df)
  chart_gap_by_subregion(df)
  chart_gini_by_income(df)
  chart_budget_gap_by_income(df)
  chart_oop_protection_trend(df)
  chart_financial_hardship_trend(df)
  chart_financing_sources(df)
  chart_uhc_trend(df)
  chart_uhc_by_country(df)
  chart_nmr_trend(df)
  chart_nmr_on_course(df)
  chart_mmr_trend(df)
  chart_mmr_on_course(df)
  chart_spending_uhc_correlation(df)
  chart_threshold_by_subregion(df)
  chart_spending_range(df)
  chart_mmr_uhc_disparity_corrected(df)  # NEW - Highlight 32 corrected
  chart_mmr_uhc_disparity_with_high(df)  # NEW - Highlight 32 with High income

  message("\n" %>% paste(rep("=", 70), collapse = ""))
  message(paste("All 25 charts saved to:", OUTPUT_DIR))
  message("=" %>% rep(70) %>% paste(collapse = ""))
  message("\nNOTE: Chart 04 (Abuja comparison) has been CORRECTED to show")
  message("      % of Government Budget (not % of GDP as stated in highlight)")
  message("
NOTE: Charts 24-25 address Highlight 32 (MMR/UHC disparity):")
  message("      Chart 24: Uses actual data (Low vs Upper-middle income)")
  message("      Chart 25: Includes High income (Seychelles) to match original highlight")

  return(OUTPUT_DIR)
}

# Run if called directly
# CHART 24: MMR vs UHC Disparity by Income Group (CORRECTED - Using Actual Data)
# Highlight 32 (CORRECTED): Uses Low vs Upper-middle from actual data
# =============================================================================
chart_mmr_uhc_disparity_corrected <- function(df) {
  df_2023 <- df %>% filter(year == 2023)

  # Calculate actual values from data
  income_stats <- df_2023 %>%
    group_by(income) %>%
    summarise(
      mmr = mean(`Maternal mortality ratio`, na.rm = TRUE),
      uhc = mean(`Universal health coverage`, na.rm = TRUE),
      n = n()
    ) %>%
    filter(income %in% c("Low", "Lower-middle", "Upper-middle"))

  # Set income order
  income_stats$income <- factor(income_stats$income,
                                 levels = c("Low", "Lower-middle", "Upper-middle"))

  # Calculate disparity ratios
  low_mmr <- income_stats$mmr[income_stats$income == "Low"]
  umic_mmr <- income_stats$mmr[income_stats$income == "Upper-middle"]
  mmr_ratio <- low_mmr / umic_mmr

  low_uhc <- income_stats$uhc[income_stats$income == "Low"]
  umic_uhc <- income_stats$uhc[income_stats$income == "Upper-middle"]
  uhc_ratio <- umic_uhc / low_uhc

  # Create MMR plot
  p1 <- ggplot(income_stats, aes(x = income, y = mmr, fill = income)) +
    geom_bar(stat = "identity", color = "white", linewidth = 0.8) +
    geom_text(aes(label = sprintf("%.1f", mmr)),
              vjust = -0.5, fontface = "bold", size = 4) +
    scale_fill_manual(values = INCOME_COLORS) +
    scale_y_continuous(limits = c(0, max(income_stats$mmr) * 1.15), expand = c(0, 0)) +
    labs(
      title = sprintf("Maternal Mortality Ratio by Income (2023)\n%.1fx difference between Low and Upper-middle income", mmr_ratio),
      x = "Income Group",
      y = "MMR (per 100,000 live births)"
    ) +
    theme_minimal() +
    theme(
      plot.title = element_text(face = "bold", size = 11, hjust = 0.5),
      axis.title = element_text(face = "bold", size = 10),
      legend.position = "none",
      panel.grid.major.x = element_blank()
    )

  # Create UHC plot
  p2 <- ggplot(income_stats, aes(x = income, y = uhc, fill = income)) +
    geom_bar(stat = "identity", color = "white", linewidth = 0.8) +
    geom_text(aes(label = sprintf("%.1f%%", uhc)),
              vjust = -0.5, fontface = "bold", size = 4) +
    scale_fill_manual(values = INCOME_COLORS) +
    scale_y_continuous(limits = c(0, 100), expand = c(0, 0)) +
    labs(
      title = sprintf("Universal Health Coverage by Income (2023)\n%.1fx difference between Upper-middle and Low income", uhc_ratio),
      x = "Income Group",
      y = "UHC Index (%)"
    ) +
    theme_minimal() +
    theme(
      plot.title = element_text(face = "bold", size = 11, hjust = 0.5),
      axis.title = element_text(face = "bold", size = 10),
      legend.position = "none",
      panel.grid.major.x = element_blank()
    )

  # Combine plots
  combined <- p1 + p2 +
    plot_annotation(
      title = sprintf("Disparity in Health Outcomes by Income Group (2023)\nMMR disparity (%.1fx) and UHC disparity (%.1fx)", mmr_ratio, uhc_ratio),
      caption = sprintf("Note: Based on %d African countries. Low income (n=%d), Lower-middle (n=%d), Upper-middle (n=%d)",
                        nrow(df_2023),
                        income_stats$n[income_stats$income == "Low"],
                        income_stats$n[income_stats$income == "Lower-middle"],
                        income_stats$n[income_stats$income == "Upper-middle"]),
      theme = theme(
        plot.title = element_text(face = "bold", size = 14, hjust = 0.5),
        plot.caption = element_text(size = 9, face = "italic", color = "gray50")
      )
    )

  ggsave(file.path(OUTPUT_DIR, "chart24_mmr_uhc_disparity_corrected.png"),
         combined, width = 14, height = 7, dpi = 300, bg = "white")
  message("  Saved: chart24_mmr_uhc_disparity_corrected.png")
}


# =============================================================================
# CHART 25: MMR vs UHC Disparity by Income Group (With High Income - Seychelles)
# Highlight 32 (Original): Low income (388.9/43.5%) vs High income (41.9/80.0%)
# =============================================================================
chart_mmr_uhc_disparity_with_high <- function(df) {
  df_2023 <- df %>% filter(year == 2023) %>%
    mutate(income_for_chart = ifelse(location == "Seychelles", "High", income))

  # Calculate values for all income groups including High
  income_stats <- df_2023 %>%
    group_by(income_for_chart) %>%
    summarise(
      mmr = mean(`Maternal mortality ratio`, na.rm = TRUE),
      uhc = mean(`Universal health coverage`, na.rm = TRUE),
      n = n()
    ) %>%
    filter(income_for_chart %in% c("Low", "Lower-middle", "Upper-middle", "High"))

  # Set income order
  income_stats$income_for_chart <- factor(income_stats$income_for_chart,
                                           levels = c("Low", "Lower-middle", "Upper-middle", "High"))

  # Calculate disparity ratios (Low vs High)
  low_mmr <- income_stats$mmr[income_stats$income_for_chart == "Low"]
  high_mmr <- income_stats$mmr[income_stats$income_for_chart == "High"]
  mmr_ratio <- low_mmr / high_mmr

  low_uhc <- income_stats$uhc[income_stats$income_for_chart == "Low"]
  high_uhc <- income_stats$uhc[income_stats$income_for_chart == "High"]
  uhc_ratio <- high_uhc / low_uhc

  # Colors including High
  income_colors_with_high <- c(
    "Low" = "#C00000",
    "Lower-middle" = "#ED7D31",
    "Upper-middle" = "#70AD47",
    "High" = "#1F4E79"
  )

  # Create MMR plot
  p1 <- ggplot(income_stats, aes(x = income_for_chart, y = mmr, fill = income_for_chart)) +
    geom_bar(stat = "identity", color = "white", linewidth = 0.8) +
    geom_text(aes(label = sprintf("%.1f", mmr)),
              vjust = -0.5, fontface = "bold", size = 4) +
    scale_fill_manual(values = income_colors_with_high) +
    scale_y_continuous(limits = c(0, max(income_stats$mmr) * 1.15), expand = c(0, 0)) +
    labs(
      title = sprintf("Maternal Mortality Ratio by Income (2023)\n~%.0fx difference between Low and High income", mmr_ratio),
      x = "Income Group",
      y = "MMR (per 100,000 live births)"
    ) +
    theme_minimal() +
    theme(
      plot.title = element_text(face = "bold", size = 11, hjust = 0.5),
      axis.title = element_text(face = "bold", size = 10),
      legend.position = "none",
      panel.grid.major.x = element_blank()
    )

  # Create UHC plot
  p2 <- ggplot(income_stats, aes(x = income_for_chart, y = uhc, fill = income_for_chart)) +
    geom_bar(stat = "identity", color = "white", linewidth = 0.8) +
    geom_text(aes(label = sprintf("%.1f%%", uhc)),
              vjust = -0.5, fontface = "bold", size = 4) +
    scale_fill_manual(values = income_colors_with_high) +
    scale_y_continuous(limits = c(0, 100), expand = c(0, 0)) +
    labs(
      title = sprintf("Universal Health Coverage by Income (2023)\n~%.1fx difference between High and Low income", uhc_ratio),
      x = "Income Group",
      y = "UHC Index (%)"
    ) +
    theme_minimal() +
    theme(
      plot.title = element_text(face = "bold", size = 11, hjust = 0.5),
      axis.title = element_text(face = "bold", size = 10),
      legend.position = "none",
      panel.grid.major.x = element_blank()
    )

  # Combine plots
  combined <- p1 + p2 +
    plot_annotation(
      title = sprintf("Disparity in Health Outcomes: Low vs High Income Countries (2023)\nMMR disparity (~%.0fx) and UHC disparity (~%.1fx)", mmr_ratio, uhc_ratio),
      caption = "Note: High income = Seychelles (n=1). MMR: Low=388.9 vs High=41.9; UHC: Low=43.5% vs High=80.0%",
      theme = theme(
        plot.title = element_text(face = "bold", size = 14, hjust = 0.5),
        plot.caption = element_text(size = 9, face = "italic", color = "gray50")
      )
    )

  ggsave(file.path(OUTPUT_DIR, "chart25_mmr_uhc_disparity_with_high.png"),
         combined, width = 14, height = 7, dpi = 300, bg = "white")
  message("  Saved: chart25_mmr_uhc_disparity_with_high.png")
}


if (!interactive()) {
  generate_all_charts()
}

message("\nHealth Financing Highlight Charts V2 Generator (Complete) loaded.")
message("Call generate_all_charts() to create all 25 visualizations.")


# =============================================================================
