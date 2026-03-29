# =============================================================================
# Generate Excel Report Tables - Complete Statistical Product (R Version)
# =============================================================================
# Health Financing Gap in Africa - All Indicators from Specification
#
# This R script:
# 1. Reads the original raw data from health_data.xlsx
# 2. Processes and calculates all derived indicators
# 3. Generates the complete Excel workbook with all statistical tables
#
# Author: Health Financing Gap Analysis Team
# Date: March 2026
# =============================================================================

# Load required libraries
required_packages <- c("readxl", "readr", "dplyr", "tidyr", "openxlsx", "ineq", "writexl")

for (pkg in required_packages) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cran.r-project.org")
    library(pkg, character.only = TRUE)
  }
}

# =============================================================================
# Configuration
# =============================================================================

# Get the base directory (parent of scripts folder)
get_base_dir <- function() {
  # Try multiple methods to find the base directory
  if (requireNamespace("rstudioapi", quietly = TRUE) && rstudioapi::isAvailable()) {
    script_path <- tryCatch(
      rstudioapi::getSourceEditorContext()$path,
      error = function(e) NULL
    )
    if (!is.null(script_path) && script_path != "") {
      return(dirname(dirname(script_path)))
    }
  }
  # Fallback: assume working directory is the project root or use default path
  if (dir.exists("data-processing")) {
    return(getwd())
  }
  return("C:/Users/peter/OneDrive - Smart Workplace/OneDrive documents/GitHub/AI and Data Commons (Google) Project  (UN-ECA-ACS)/Health Financing Gap/health-financing-platform")
}

BASE_DIR <- get_base_dir()
RAW_DATA_FILE <- file.path(BASE_DIR, "data-processing", "health_data.xlsx")
NMR_DATA_FILE <- file.path(dirname(BASE_DIR), "raw_data", "Indicator_Neonatal_mortality_rate_-_Age2C__20260318191322.xlsx")
OUTPUT_DIR <- file.path(BASE_DIR, "reports")
PROCESSED_DATA_DIR <- file.path(BASE_DIR, "processed_data")

# Create output directories if they don't exist
if (!dir.exists(OUTPUT_DIR)) dir.create(OUTPUT_DIR, recursive = TRUE)
if (!dir.exists(PROCESSED_DATA_DIR)) dir.create(PROCESSED_DATA_DIR, recursive = TRUE)

# =============================================================================
# Thresholds and Constants (from specification)
# =============================================================================

THRESHOLDS <- list(
  gov_exp_health_per_capita = list(
    "Low" = 112,
    "Lower-middle" = 146,
    "Upper-middle" = 477
  ),
  abuja_target = 15,
  oop_benchmark = 20,
  uhc_percentiles = c(50, 75),
  gov_share_dominant = 50,
  nmr_target = 12,
  mmr_target = 70
)

# =============================================================================
# Styling Configuration for Excel
# =============================================================================

create_styles <- function() {
  list(
    header = createStyle(
      fontColour = "#FFFFFF",
      fgFill = "#1F4E79",
      halign = "center",
      textDecoration = "bold",
      border = "TopBottomLeftRight",
      borderColour = "#000000"
    ),
    section = createStyle(
      fgFill = "#D6DCE4",
      textDecoration = "bold",
      border = "TopBottomLeftRight",
      borderColour = "#000000"
    ),
    title = createStyle(
      fontSize = 14,
      fontColour = "#1F4E79",
      textDecoration = "bold"
    ),
    subtitle = createStyle(
      fontSize = 11,
      fontColour = "#2E75B6",
      textDecoration = "bold"
    ),
    note = createStyle(
      fontSize = 10,
      fontColour = "#FF0000",
      textDecoration = "italic"
    ),
    data = createStyle(
      halign = "center",
      border = "TopBottomLeftRight",
      borderColour = "#000000"
    ),
    number_0dp = createStyle(
      halign = "center",
      numFmt = "#,##0"
    ),
    number_1dp = createStyle(
      halign = "center",
      numFmt = "0.0"
    ),
    year = createStyle(
      halign = "center",
      numFmt = "0"
    )
  )
}

# =============================================================================
# PART 1: DATA LOADING AND PROCESSING
# =============================================================================

load_nmr_data <- function(nmr_file = NMR_DATA_FILE) {
  #' Load Neonatal Mortality Rate data from external file
  #'
  #' @param nmr_file Path to NMR Excel file
  #' @return Data frame with NMR data in long format
  
  if (!file.exists(nmr_file)) {
    warning(paste("NMR data file not found:", nmr_file))
    return(NULL)
  }
  
  message(paste("Loading NMR data from:", nmr_file))
  
  # Name mapping from NMR file to master dataset
  name_mapping <- c(
    "CAR" = "Central African Republic",
    "Cote d'Ivoire" = "Côte d'Ivoire",
    "DRC" = "Democratic Republic of the Congo",
    "Gambia, the" = "Gambia",
    "STP" = "Sao Tome and Principe",
    "Tanzania" = "United Republic of Tanzania"
  )
  
  # Read NMR data (wide format)
  nmr_wide <- read_excel(nmr_file)
  
  # Remove unnamed columns
  nmr_wide <- nmr_wide %>% select(-contains("Unnamed"))
  
  # Apply name mapping
  nmr_wide <- nmr_wide %>%
    mutate(`Country English` = ifelse(`Country English` %in% names(name_mapping),
                                       name_mapping[`Country English`],
                                       `Country English`))
  
  # Reshape from wide to long
  year_cols <- names(nmr_wide)[grepl("^[0-9]{4}$", names(nmr_wide))]
  
  nmr_long <- nmr_wide %>%
    pivot_longer(
      cols = all_of(year_cols),
      names_to = "year",
      values_to = "Neonatal mortality rate"
    ) %>%
    mutate(year = as.numeric(year)) %>%
    rename(location = `Country English`) %>%
    select(location, year, `Neonatal mortality rate`)
  
  message(paste("Loaded NMR data for", n_distinct(nmr_long$location), "countries"))
  
  return(nmr_long)
}

load_raw_data <- function(file_path = RAW_DATA_FILE) {
  #' Load raw data and merge with NMR data
  message("=" %>% rep(70) %>% paste(collapse = ""))
  message("LOADING RAW DATA")
  message("=" %>% rep(70) %>% paste(collapse = ""))
  if (!file.exists(file_path)) {
    stop(paste("Raw data file not found:", file_path,
               "\nPlease ensure health_data.xlsx is in the data-processing folder."))
  }
  message(paste("Reading:", file_path))
  df <- read_excel(file_path)
  message(paste("Loaded", nrow(df), "records for", n_distinct(df$location), "countries"))
  message(paste("Year range:", min(df$year, na.rm = TRUE), "-", max(df$year, na.rm = TRUE)))
  # Remove old Infant Mortality Rate column if exists
  if ("Infant Mortality Rate" %in% names(df)) {
    df <- df %>% select(-`Infant Mortality Rate`)
    message("Removed old Infant Mortality Rate column")
  }
  # Load and merge NMR data
  nmr_data <- load_nmr_data()
  if (!is.null(nmr_data)) {
    df <- df %>% left_join(nmr_data, by = c("location", "year"))
    message(paste("Merged NMR data:", sum(!is.na(df$`Neonatal mortality rate`)), "records with NMR values"))
  }
  return(df)
}

process_raw_data <- function(df) {
  #' Process raw data and calculate all derived indicators
  #'
  #' @param df Raw data frame from load_raw_data()
  #' @return Processed data frame with all calculated indicators

  message("\n")
  message("=" %>% rep(70) %>% paste(collapse = ""))
  message("PROCESSING DATA AND CALCULATING INDICATORS")
  message("=" %>% rep(70) %>% paste(collapse = ""))

  # Filter for valid years (2000-2023) and locations
  df <- df %>%
    filter(year >= 2000, year <= 2023, !is.na(location))

  message(paste("\nFiltered to", nrow(df), "records (2000-2023)"))

  # Recode High income to Upper-middle (only 1 country: Seychelles)
  df <- df %>%
    mutate(income = ifelse(income == "High", "Upper-middle", income))
  message("Recoded High income to Upper-middle")

  # =========================================================================
  # 1. Add income-specific thresholds
  # =========================================================================
  message("\n1. Adding income-specific thresholds...")

  df <- df %>%
    mutate(
      income_threshold = case_when(
        income == "Low" ~ 112,
        income == "Lower-middle" ~ 146,
        income == "Upper-middle" ~ 477,
        TRUE ~ NA_real_
      )
    )

  # =========================================================================
  # 2. Calculate public health financing gap
  # =========================================================================
  message("2. Calculating public health financing gap...")

  df <- df %>%
    mutate(
      # Gap: difference between threshold and actual spending (if below threshold)
      public_health_gap = case_when(
        `Gov exp Health per capita` < income_threshold ~
          income_threshold - `Gov exp Health per capita`,
        TRUE ~ 0
      ),
      # Binary: below threshold indicator
      below_threshold = case_when(
        `Gov exp Health per capita More than Threshold` == 1 ~ 0,
        !is.na(`Gov exp Health per capita More than Threshold`) ~ 1,
        TRUE ~ NA_real_
      )
    )

  # =========================================================================
  # 3. Calculate Abuja Declaration indicators
  # =========================================================================
  message("3. Calculating Abuja Declaration indicators...")

  df <- df %>%
    mutate(
      # Gap for budget priority
      budget_priority_gap = case_when(
        `Gov exp Health on budget` < THRESHOLDS$abuja_target ~
          THRESHOLDS$abuja_target - `Gov exp Health on budget`,
        TRUE ~ 0
      ),
      # Binary: below Abuja target
      below_abuja = case_when(
        `Gov exp Health on budget > 15` == 1 ~ 0,
        !is.na(`Gov exp Health on budget > 15`) ~ 1,
        TRUE ~ NA_real_
      )
    )

  # =========================================================================
  # 4. Calculate financial protection indicators
  # =========================================================================
  message("4. Calculating financial protection indicators...")

  df <- df %>%
    mutate(
      # Gap for OOP (excess over 20% benchmark)
      financial_protection_gap = case_when(
        `Out-of-pocket on health exp` > THRESHOLDS$oop_benchmark ~
          `Out-of-pocket on health exp` - THRESHOLDS$oop_benchmark,
        TRUE ~ 0
      ),
      # Binary: OOP below 20% (good protection)
      below_oop_benchmark = `Out-of-pocket on health exp < 20`,
      # Binary: OOP above 20% (poor protection)
      oop_above_20 = case_when(
        `Out-of-pocket on health exp < 20` == 1 ~ 0,
        !is.na(`Out-of-pocket on health exp < 20`) ~ 1,
        TRUE ~ NA_real_
      )
    )

  # =========================================================================
  # 5. Calculate financing structure indicators
  # =========================================================================
  message("5. Calculating financing structure indicators...")

  df <- df %>%
    mutate(
      # Government share > 50% (dominant)
      gov_dominant = case_when(
        `Govern on health exp` > 50 ~ 1,
        !is.na(`Govern on health exp`) ~ 0,
        TRUE ~ NA_real_
      )
    )

  # Identify dominant financing source for each country-year
  financing_cols <- c("Govern on health exp", "Voluntary Prepayments on health exp",
                      "Out-of-pocket on health exp", "Other Private on health exp",
                      "External on health exp")

  df <- df %>%
    rowwise() %>%
    mutate(
      dominant_financing_source = {
        vals <- c(`Govern on health exp`, `Voluntary Prepayments on health exp`,
                  `Out-of-pocket on health exp`, `Other Private on health exp`,
                  `External on health exp`)
        names(vals) <- financing_cols
        if (all(is.na(vals))) NA_character_ else names(vals)[which.max(vals)]
      }
    ) %>%
    ungroup()

  # =========================================================================
  # 6. Calculate UHC indicators
  # =========================================================================
  message("6. Calculating UHC indicators...")

  # UHC below 50%
  df <- df %>%
    mutate(
      uhc_below_50 = case_when(
        `Universal health coverage` < 50 ~ 1,
        !is.na(`Universal health coverage`) ~ 0,
        TRUE ~ NA_real_
      )
    )

  # Calculate UHC below regional average per year
  df <- df %>%
    group_by(year) %>%
    mutate(
      uhc_year_avg = mean(`Universal health coverage`, na.rm = TRUE),
      uhc_below_avg = case_when(
        `Universal health coverage` < uhc_year_avg ~ 1,
        !is.na(`Universal health coverage`) ~ 0,
        TRUE ~ NA_real_
      )
    ) %>%
    ungroup()

  # Combined: below 50% OR below average
  df <- df %>%
    mutate(
      uhc_below_50_or_avg = case_when(
        uhc_below_50 == 1 | uhc_below_avg == 1 ~ 1,
        !is.na(`Universal health coverage`) ~ 0,
        TRUE ~ NA_real_
      )
    )

  # UHC percentiles (50th and 75th) per year
  df <- df %>%
    group_by(year) %>%
    mutate(
      uhc_p50 = quantile(`Universal health coverage`, 0.50, na.rm = TRUE),
      uhc_p75 = quantile(`Universal health coverage`, 0.75, na.rm = TRUE),
      uhc_above_p50 = case_when(
        `Universal health coverage` > uhc_p50 ~ 1,
        !is.na(`Universal health coverage`) ~ 0,
        TRUE ~ NA_real_
      ),
      uhc_above_p75 = case_when(
        `Universal health coverage` > uhc_p75 ~ 1,
        !is.na(`Universal health coverage`) ~ 0,
        TRUE ~ NA_real_
      )
    ) %>%
    ungroup()

  # UHC above 75% category
  df <- df %>%
    mutate(
      uhc_above_50 = case_when(
        `Universal health coverage` > 50 ~ ">50%",
        !is.na(`Universal health coverage`) ~ "<=50%",
        TRUE ~ NA_character_
      )
    )

  # =========================================================================
  # 7. Calculate health outcome indicators (mortality)
  # =========================================================================
  message("7. Calculating health outcome indicators...")

  df <- df %>%
    mutate(
      # On course for NMR/NMR target (<=12 per 1,000)
      nmr_on_course = case_when(
        `Neonatal mortality rate` <= THRESHOLDS$nmr_target ~ 1,
        !is.na(`Neonatal mortality rate`) ~ 0,
        TRUE ~ NA_real_
      ),
      # On course for MMR target (<70 per 100,000)
      mmr_on_course = case_when(
        `Maternal mortality ratio` < THRESHOLDS$mmr_target ~ 1,
        !is.na(`Maternal mortality ratio`) ~ 0,
        TRUE ~ NA_real_
      ),
      # NMR categories
      nmr_category = case_when(
        `Neonatal mortality rate` > 12 ~ ">12",
        !is.na(`Neonatal mortality rate`) ~ "<=12",
        TRUE ~ NA_character_
      ),
      # MMR categories
      mmr_category = case_when(
        `Maternal mortality ratio` > 70 ~ ">70",
        !is.na(`Maternal mortality ratio`) ~ "<=70",
        TRUE ~ NA_character_
      )
    )

  # =========================================================================
  # 8. Calculate threshold categories for cross-tabulations
  # =========================================================================
  message("8. Calculating threshold categories for cross-tabulations...")

  df <- df %>%
    mutate(
      thres50 = income_threshold * 0.5,
      thres75 = income_threshold * 0.749,
      gov_exp_pc_thres = case_when(
        is.na(`Gov exp Health per capita`) | is.na(income_threshold) ~ NA_character_,
        `Gov exp Health per capita` < thres50 ~ "Below 50% of expenditure threshold",
        `Gov exp Health per capita` < thres75 ~ "50-74.9% of expenditure threshold",
        `Gov exp Health per capita` < income_threshold ~ "75-99.9% of expenditure threshold",
        TRUE ~ "Meet expenditure threshold target"
      )
    )

  # =========================================================================
  # 9. Create meeting threshold indicators (inverse of below)
  # =========================================================================
  message("9. Creating meeting threshold indicators...")

  df <- df %>%
    mutate(
      meets_threshold = case_when(
        below_threshold == 0 ~ 1,
        below_threshold == 1 ~ 0,
        TRUE ~ NA_real_
      ),
      meets_abuja = case_when(
        below_abuja == 0 ~ 1,
        below_abuja == 1 ~ 0,
        TRUE ~ NA_real_
      )
    )

  # =========================================================================
  # 10. Create financing source flags
  # =========================================================================
  message("10. Creating financing source flags...")

  df <- df %>%
    mutate(
      gov_highest = gov_dominant,
      vol_highest = as.numeric(dominant_financing_source == "Voluntary Prepayments on health exp"),
      oop_highest = as.numeric(dominant_financing_source == "Out-of-pocket on health exp"),
      other_highest = as.numeric(dominant_financing_source == "Other Private on health exp"),
      ext_highest = as.numeric(dominant_financing_source == "External on health exp")
    )

  # =========================================================================
  # 11. Calculate fiscal space indicators
  # =========================================================================
  message("11. Calculating fiscal space indicators...")

  # Health spending elasticity (YoY growth rate comparison)
  df <- df %>%
    arrange(location, year) %>%
    group_by(location) %>%
    mutate(
      gdp_growth = (`GDP per capita Constant 2023` - lag(`GDP per capita Constant 2023`)) /
        lag(`GDP per capita Constant 2023`) * 100,
      health_exp_growth = (`Gov exp Health per capita` - lag(`Gov exp Health per capita`)) /
        lag(`Gov exp Health per capita`) * 100,
      health_elasticity = health_exp_growth / gdp_growth
    ) %>%
    ungroup()

  # Tax revenue and health expenditure percentiles
  df <- df %>%
    group_by(year) %>%
    mutate(
      health_tax_above_50th = as.numeric(`Tax Revenue per GDP` >= quantile(`Tax Revenue per GDP`, 0.50, na.rm = TRUE)),
      health_tax_above_75th = as.numeric(`Tax Revenue per GDP` >= quantile(`Tax Revenue per GDP`, 0.75, na.rm = TRUE)),
      health_gdp_above_50th = as.numeric(`Exp Health on GDP` >= quantile(`Exp Health on GDP`, 0.50, na.rm = TRUE)),
      health_gdp_above_75th = as.numeric(`Exp Health on GDP` >= quantile(`Exp Health on GDP`, 0.75, na.rm = TRUE))
    ) %>%
    ungroup()

  message("\nData processing complete!")
  message(paste("Final dataset:", nrow(df), "records"))

  return(df)
}

save_processed_data <- function(df, output_dir = PROCESSED_DATA_DIR) {
  #' Save processed data to CSV
  #'
  #' @param df Processed data frame
  #' @param output_dir Output directory path

  message("\nSaving processed data...")

  # Save master dataset
  master_file <- file.path(output_dir, "master_dataset.csv")
  write_csv(df, master_file)
  message(paste("Saved:", master_file))

  return(master_file)
}

# =============================================================================
# PART 2: STATISTICAL FUNCTIONS
# =============================================================================

calculate_gini <- function(x) {
  #' Calculate Gini coefficient for inequality measurement
  #'
  #' @param x Numeric vector
  #' @return Gini coefficient

  x <- x[!is.na(x)]
  if (length(x) < 2 || sum(x) == 0) return(NA_real_)

  # Use ineq package if available, otherwise calculate manually
  if (requireNamespace("ineq", quietly = TRUE)) {
    return(ineq::Gini(x))
  }

  # Manual calculation
  sorted_x <- sort(x)
  n <- length(sorted_x)
  index <- 1:n
  gini <- (2 * sum(index * sorted_x)) / (n * sum(sorted_x)) - (n + 1) / n
  return(gini)
}

aggregate_with_gini <- function(df, indicator, group_by = NULL) {
  #' Calculate aggregates including Gini coefficient
  #'
  #' @param df Data frame

  #' @param indicator Column name for the indicator
  #' @param group_by Optional grouping variable
  #' @return Aggregated data frame

  if (!indicator %in% names(df)) return(NULL)

  if (is.null(group_by)) {
    result <- df %>%
      group_by(year) %>%
      summarise(
        Average = mean(.data[[indicator]], na.rm = TRUE),
        Count = sum(!is.na(.data[[indicator]])),
        Min = min(.data[[indicator]], na.rm = TRUE),
        Max = max(.data[[indicator]], na.rm = TRUE),
        Range = Max - Min,
        Gini = calculate_gini(.data[[indicator]]),
        .groups = "drop"
      ) %>%
      rename(Year = year)
  } else {
    result <- df %>%
      group_by(year, .data[[group_by]]) %>%
      summarise(
        Average = mean(.data[[indicator]], na.rm = TRUE),
        Count = sum(!is.na(.data[[indicator]])),
        Min = min(.data[[indicator]], na.rm = TRUE),
        Max = max(.data[[indicator]], na.rm = TRUE),
        Range = Max - Min,
        Gini = calculate_gini(.data[[indicator]]),
        .groups = "drop"
      )
  }

  return(result)
}

count_by_condition <- function(df, condition_col, group_by = NULL) {
  #' Count countries meeting a condition
  #'
  #' @param df Data frame
  #' @param condition_col Column name for the condition (0/1)
  #' @param group_by Optional grouping variable
  #' @return Aggregated counts

  if (!condition_col %in% names(df)) return(NULL)

  if (is.null(group_by)) {
    result <- df %>%
      filter(!is.na(.data[[condition_col]])) %>%
      group_by(year) %>%
      summarise(
        `Total Countries` = n(),
        `Meeting Condition` = sum(.data[[condition_col]] == 1, na.rm = TRUE),
        `Not Meeting` = `Total Countries` - `Meeting Condition`,
        `Percentage Meeting` = round(`Meeting Condition` / `Total Countries` * 100, 1),
        .groups = "drop"
      ) %>%
      rename(Year = year)
  } else {
    result <- df %>%
      filter(!is.na(.data[[condition_col]])) %>%
      group_by(year, .data[[group_by]]) %>%
      summarise(
        `Total Countries` = n(),
        `Meeting Condition` = sum(.data[[condition_col]] == 1, na.rm = TRUE),
        `Not Meeting` = `Total Countries` - `Meeting Condition`,
        `Percentage Meeting` = round(`Meeting Condition` / `Total Countries` * 100, 1),
        .groups = "drop"
      )
  }

  return(result)
}

cross_tabulation <- function(df, condition1_col, condition2_col, group_by = NULL) {
  #' Cross-tabulate two conditions
  #'
  #' @param df Data frame
  #' @param condition1_col First condition column
  #' @param condition2_col Second condition column
  #' @param group_by Optional grouping variable
  #' @return Cross-tabulation results

  if (!condition1_col %in% names(df) || !condition2_col %in% names(df)) return(NULL)

  if (is.null(group_by)) {
    result <- df %>%
      filter(!is.na(.data[[condition1_col]]), !is.na(.data[[condition2_col]])) %>%
      group_by(year) %>%
      summarise(
        Total = n(),
        `Both Conditions` = sum(.data[[condition1_col]] == 1 & .data[[condition2_col]] == 1),
        `Only First` = sum(.data[[condition1_col]] == 1 & .data[[condition2_col]] == 0),
        `Only Second` = sum(.data[[condition1_col]] == 0 & .data[[condition2_col]] == 1),
        Neither = sum(.data[[condition1_col]] == 0 & .data[[condition2_col]] == 0),
        `Proportion Both (%)` = round(`Both Conditions` / Total * 100, 1),
        .groups = "drop"
      )
  } else {
    result <- df %>%
      filter(!is.na(.data[[condition1_col]]), !is.na(.data[[condition2_col]])) %>%
      group_by(year, .data[[group_by]]) %>%
      summarise(
        Total = n(),
        `Both Conditions` = sum(.data[[condition1_col]] == 1 & .data[[condition2_col]] == 1),
        `Only First` = sum(.data[[condition1_col]] == 1 & .data[[condition2_col]] == 0),
        `Only Second` = sum(.data[[condition1_col]] == 0 & .data[[condition2_col]] == 1),
        Neither = sum(.data[[condition1_col]] == 0 & .data[[condition2_col]] == 0),
        `Proportion Both (%)` = round(`Both Conditions` / Total * 100, 1),
        .groups = "drop"
      )
  }

  return(result)
}

# =============================================================================
# PART 3: THRESHOLD CROSS-TABULATION FUNCTIONS
# =============================================================================

create_threshold_crosstab_by_year <- function(df, outcome_col, outcome_label) {
  #' Create cross-tabulation of threshold categories by year (Africa-wide)
  #'
  #' @param df Data frame
  #' @param outcome_col Outcome column name
  #' @param outcome_label Label for the outcome
  #' @return List with count and average data frames

  threshold_cols <- c("Below 50% of expenditure threshold", "50-74.9% of expenditure threshold",
                      "75-99.9% of expenditure threshold", "Meet expenditure threshold target")

  valid_df <- df %>%
    filter(!is.na(gov_exp_pc_thres), !is.na(.data[[outcome_col]]))

  if (nrow(valid_df) == 0) return(list(count = NULL, avg = NULL))

  # Count pivot
  count_pivot <- valid_df %>%
    group_by(year, .data[[outcome_col]], gov_exp_pc_thres) %>%
    summarise(count = n(), .groups = "drop") %>%
    pivot_wider(names_from = gov_exp_pc_thres, values_from = count, values_fill = 0)

  # Ensure all threshold columns exist
  for (col in threshold_cols) {
    if (!col %in% names(count_pivot)) {
      count_pivot[[col]] <- 0
    }
  }

  # Add total and reorder
  count_pivot <- count_pivot %>%
    mutate(`Number of countries` = rowSums(across(all_of(threshold_cols)))) %>%
    select(year, all_of(outcome_col), `Number of countries`, all_of(threshold_cols)) %>%
    arrange(year, .data[[outcome_col]])

  # Average pivot
  avg_pivot <- valid_df %>%
    group_by(year, .data[[outcome_col]], gov_exp_pc_thres) %>%
    summarise(avg = mean(`Gov exp Health per capita`, na.rm = TRUE), .groups = "drop") %>%
    pivot_wider(names_from = gov_exp_pc_thres, values_from = avg, values_fill = 0)

  for (col in threshold_cols) {
    if (!col %in% names(avg_pivot)) {
      avg_pivot[[col]] <- 0
    }
  }

  # Add total count
  total_by_year <- valid_df %>%
    group_by(year, .data[[outcome_col]]) %>%
    summarise(`Number of countries` = n(), .groups = "drop")

  avg_pivot <- avg_pivot %>%
    left_join(total_by_year, by = c("year", outcome_col)) %>%
    select(year, all_of(outcome_col), `Number of countries`, all_of(threshold_cols)) %>%
    arrange(year, .data[[outcome_col]])

  return(list(count = count_pivot, avg = avg_pivot))
}

create_threshold_crosstab <- function(df, outcome_col, outcome_label, group_by) {
  #' Create cross-tabulation of threshold categories by group
  #'
  #' @param df Data frame
  #' @param outcome_col Outcome column name
  #' @param outcome_label Label for the outcome
  #' @param group_by Grouping variable (income or Subregion)
  #' @return List with count and average data frames

  threshold_cols <- c("Below 50% of expenditure threshold", "50-74.9% of expenditure threshold",
                      "75-99.9% of expenditure threshold", "Meet expenditure threshold target")

  income_order <- c("Low" = 1, "Lower-middle" = 2, "Upper-middle" = 3)
  subregion_order <- c("Central Africa" = 1, "Eastern Africa" = 2, "Central Africa" = 3,
                       "Northern Africa" = 4, "Southern Africa" = 5, "Western Africa" = 6)

  valid_df <- df %>%
    filter(!is.na(gov_exp_pc_thres), !is.na(.data[[outcome_col]]))

  if (nrow(valid_df) == 0) return(list(count = NULL, avg = NULL))

  # Count pivot
  count_pivot <- valid_df %>%
    group_by(year, .data[[group_by]], .data[[outcome_col]], gov_exp_pc_thres) %>%
    summarise(count = n(), .groups = "drop") %>%
    pivot_wider(names_from = gov_exp_pc_thres, values_from = count, values_fill = 0)

  for (col in threshold_cols) {
    if (!col %in% names(count_pivot)) {
      count_pivot[[col]] <- 0
    }
  }

  # Add total and sort
  count_pivot <- count_pivot %>%
    mutate(`Number of countries` = rowSums(across(all_of(threshold_cols)))) %>%
    select(year, all_of(group_by), all_of(outcome_col), `Number of countries`, all_of(threshold_cols))

  if (group_by == "income") {
    count_pivot <- count_pivot %>%
      mutate(.sort = income_order[.data[[group_by]]]) %>%
      arrange(.sort, year, .data[[outcome_col]]) %>%
      select(-.sort)
  } else {
    count_pivot <- count_pivot %>%
      mutate(.sort = subregion_order[.data[[group_by]]]) %>%
      arrange(.sort, year, .data[[outcome_col]]) %>%
      select(-.sort)
  }

  # Average pivot
  avg_pivot <- valid_df %>%
    group_by(year, .data[[group_by]], .data[[outcome_col]], gov_exp_pc_thres) %>%
    summarise(avg = mean(`Gov exp Health per capita`, na.rm = TRUE), .groups = "drop") %>%
    pivot_wider(names_from = gov_exp_pc_thres, values_from = avg, values_fill = 0)

  for (col in threshold_cols) {
    if (!col %in% names(avg_pivot)) {
      avg_pivot[[col]] <- 0
    }
  }

  total_by_group <- valid_df %>%
    group_by(year, .data[[group_by]], .data[[outcome_col]]) %>%
    summarise(`Number of countries` = n(), .groups = "drop")

  avg_pivot <- avg_pivot %>%
    left_join(total_by_group, by = c("year", group_by, outcome_col)) %>%
    select(year, all_of(group_by), all_of(outcome_col), `Number of countries`, all_of(threshold_cols))

  if (group_by == "income") {
    avg_pivot <- avg_pivot %>%
      mutate(.sort = income_order[.data[[group_by]]]) %>%
      arrange(.sort, year, .data[[outcome_col]]) %>%
      select(-.sort)
  } else {
    avg_pivot <- avg_pivot %>%
      mutate(.sort = subregion_order[.data[[group_by]]]) %>%
      arrange(.sort, year, .data[[outcome_col]]) %>%
      select(-.sort)
  }

  return(list(count = count_pivot, avg = avg_pivot))
}

# =============================================================================
# PART 4: EXCEL WRITING FUNCTIONS
# =============================================================================

add_dataframe_to_sheet <- function(wb, sheet, df, start_row, title = NULL, styles, is_count_table = FALSE) {
  #' Add a DataFrame to an Excel worksheet with formatting
  #'
  #' @param wb Workbook object
  #' @param sheet Sheet name
  #' @param df Data frame to add
  #' @param start_row Starting row number
  #' @param title Optional table title
  #' @param styles Style list from create_styles()
  #' @param is_count_table If TRUE, format all numbers as integers
  #' @return Next available row number

  if (is.null(df) || nrow(df) == 0) return(start_row + 1)

  current_row <- start_row

  # Add title if provided
  if (!is.null(title)) {
    writeData(wb, sheet, title, startRow = current_row, startCol = 1)
    addStyle(wb, sheet, styles$section, rows = current_row, cols = 1:ncol(df))
    current_row <- current_row + 1
  }

  # Write headers
  writeData(wb, sheet, as.data.frame(t(names(df))), startRow = current_row, startCol = 1, colNames = FALSE)
  addStyle(wb, sheet, styles$header, rows = current_row, cols = 1:ncol(df), gridExpand = TRUE)
  current_row <- current_row + 1

  # Write data
  writeData(wb, sheet, df, startRow = current_row, startCol = 1, colNames = FALSE)

  # Apply formatting
  data_rows <- current_row:(current_row + nrow(df) - 1)
  addStyle(wb, sheet, styles$data, rows = data_rows, cols = 1:ncol(df), gridExpand = TRUE)

  # Format specific columns
  for (col_idx in 1:ncol(df)) {
    col_name <- names(df)[col_idx]

    if (tolower(col_name) == "year") {
      addStyle(wb, sheet, styles$year, rows = data_rows, cols = col_idx, gridExpand = TRUE, stack = TRUE)
    } else if (grepl("Percentage|Proportion", col_name)) {
      addStyle(wb, sheet, styles$number_1dp, rows = data_rows, cols = col_idx, gridExpand = TRUE, stack = TRUE)
    } else if (is_count_table && is.numeric(df[[col_idx]])) {
      addStyle(wb, sheet, styles$number_0dp, rows = data_rows, cols = col_idx, gridExpand = TRUE, stack = TRUE)
    } else if (grepl("Count|Total Countries|Meeting Condition|Not Meeting|Both|Only|Neither|Number of countries", col_name)) {
      addStyle(wb, sheet, styles$number_0dp, rows = data_rows, cols = col_idx, gridExpand = TRUE, stack = TRUE)
    } else if (is.numeric(df[[col_idx]])) {
      addStyle(wb, sheet, styles$number_1dp, rows = data_rows, cols = col_idx, gridExpand = TRUE, stack = TRUE)
    }
  }

  return(current_row + nrow(df) + 1)
}

# =============================================================================
# PART 5: SECTION CREATION FUNCTIONS
# =============================================================================

create_summary_sheet <- function(wb, df, styles) {
  sheet <- "Summary"
  addWorksheet(wb, sheet, gridLines = FALSE)
  row <- 1

  writeData(wb, sheet, "Health Financing Gap Analysis for Africa", startRow = row, startCol = 1)
  addStyle(wb, sheet, createStyle(fontSize = 18, fontColour = "#1F4E79", textDecoration = "bold"), rows = row, cols = 1)
  row <- row + 1
  writeData(wb, sheet, "Statistical Product - Complete Data Tables (R Version)", startRow = row, startCol = 1)
  addStyle(wb, sheet, createStyle(fontSize = 12, textDecoration = "italic"), rows = row, cols = 1)
  row <- row + 2

  # Data coverage
  writeData(wb, sheet, "DATA COVERAGE", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1
  writeData(wb, sheet, paste("Total Countries:", n_distinct(df$location)), startRow = row, startCol = 1)
  row <- row + 1
  writeData(wb, sheet, paste("Year Range:", min(df$year), "-", max(df$year)), startRow = row, startCol = 1)
  row <- row + 1
  writeData(wb, sheet, paste("Total Records:", format(nrow(df), big.mark = ",")), startRow = row, startCol = 1)
  row <- row + 2

  # Thresholds
  writeData(wb, sheet, "THRESHOLDS APPLIED", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  thresholds <- c(
    "Per Capita Health Expenditure: LICs=$112, LMICs=$146, UMICs=$477",
    "Abuja Declaration: 15% of government budget",
    "Out-of-Pocket: Below 20% benchmark",
    "Government Dominant: >50% of health expenditure",
    "Neonatal Mortality Target: <=12 per 1,000 live births",
    "Maternal Mortality Target: <70 per 100,000 live births",
    "UHC Index: 50% minimum threshold"
  )

  for (t in thresholds) {
    writeData(wb, sheet, paste("  -", t), startRow = row, startCol = 1)
    row <- row + 1
  }
  row <- row + 1

  # Sections
  writeData(wb, sheet, "REPORT SECTIONS", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  sections <- c(
    "3.1 Public Health Financing - Adequacy of public health financing gap",
    "3.2 Abuja Declaration - Budgetary priority assigned to health",
    "3.3 Financial Protection - Out-of-pocket expenditure protection",
    "3.4 Financing Structure - Sources of health financing",
    "3.5 UHC Index - Universal Health Coverage outcomes",
    "3.6 Health Outcomes - Neonatal and Maternal Mortality",
    "3.7 Financing x UHC - Cross-tabulation analysis",
    "3.8 Financing x Outcomes - Cross-tabulation analysis",
    "3.9 Structure x UHC - Financing sources and UHC",
    "3.10 Structure x Outcomes - Financing sources and mortality",
    "3.11 Fiscal Space - Macroeconomic constraints",
    "Threshold x UHC - Threshold categories by UHC >50%",
    "Threshold x NMR - Threshold categories by NMR (>12 vs <=12)",
    "Threshold x MMR - Threshold categories by MMR (>70 vs <=70)"
  )

  for (s in sections) {
    writeData(wb, sheet, paste("  ", s), startRow = row, startCol = 1)
    row <- row + 1
  }
  row <- row + 1

  # Income groups
  writeData(wb, sheet, "COUNTRIES BY INCOME GROUP", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  income_counts <- df %>%
    group_by(income) %>%
    summarise(count = n_distinct(location)) %>%
    arrange(income)

  for (i in 1:nrow(income_counts)) {
    writeData(wb, sheet, paste("  ", income_counts$income[i], ":", income_counts$count[i], "countries"), startRow = row, startCol = 1)
    row <- row + 1
  }
  row <- row + 1

  # Subregions
  writeData(wb, sheet, "COUNTRIES BY SUB-REGION", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  subregion_counts <- df %>%
    group_by(Subregion) %>%
    summarise(count = n_distinct(location)) %>%
    arrange(Subregion)

  for (i in 1:nrow(subregion_counts)) {
    writeData(wb, sheet, paste("  ", subregion_counts$Subregion[i], ":", subregion_counts$count[i], "countries"), startRow = row, startCol = 1)
    row <- row + 1
  }

  setColWidths(wb, sheet, cols = 1, widths = 70)
}

create_section_31 <- function(wb, df, styles) {
  sheet <- "3.1 Public Health Financing"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.1 Adequacy of Public Health Financing Gap", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  # 3.1.1 Number below threshold
  writeData(wb, sheet, "3.1.1 Countries Below Internationally Prescribed Threshold", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1
  writeData(wb, sheet, "Thresholds: LICs=$112, LMICs=$146, UMICs=$477 per capita", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$note, rows = row, cols = 1)
  row <- row + 1

  agg <- count_by_condition(df, "below_threshold")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level - Annual Counts", styles)

  for (group in c("income", "Subregion")) {
    agg <- count_by_condition(df, "below_threshold", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group, "- Annual Counts"), styles)
  }

  # 3.1.2 Average financing gap
  writeData(wb, sheet, "3.1.2 Average Public Health Financing Gap", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Gap for Gov exp Health per capita")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level - Annual Statistics", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Gap for Gov exp Health per capita", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  # 3.1.3 Gini coefficient
  writeData(wb, sheet, "3.1.3 Inequality in Government Health Expenditure Per Capita", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Gov exp Health per capita")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level - Gini & Range", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Gov exp Health per capita", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_32 <- function(wb, df, styles) {
  sheet <- "3.2 Abuja Declaration"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.2 Budgetary Priority Assigned to Health", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.2.1 Countries Below Abuja Declaration Target (< 15%)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- count_by_condition(df, "below_abuja")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- count_by_condition(df, "below_abuja", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.2.2 Average Budget Priority Financing Gap", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Gap Gov exp Health on budget")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Gap Gov exp Health on budget", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.2.3 Inequality in Budget Priority", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Gov exp Health on budget")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level - Gini & Range", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Gov exp Health on budget", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_33 <- function(wb, df, styles) {
  sheet <- "3.3 Financial Protection"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.3 Financial Protection of Households", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.3.1 Countries with OOP Below 20% Benchmark (Good Financial Protection)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- count_by_condition(df, "below_oop_benchmark")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- count_by_condition(df, "below_oop_benchmark", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.3.2 Average Financial Protection Gap (Excess OOP)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Exc Out-of-pocket on health exp")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Exc Out-of-pocket on health exp", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.3.3 Inequality in Out-of-Pocket Expenditure", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Out-of-pocket on health exp")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level - Gini & Range", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Out-of-pocket on health exp", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.3.4 Incidence of Financial Hardship", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "financial hardship")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "financial hardship", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_34 <- function(wb, df, styles) {
  sheet <- "3.4 Financing Structure"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.4 Health Financing Structure (Sources of Health Financing)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.4.1 Countries with Government Share > 50% (Dominant)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- count_by_condition(df, "gov_dominant")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- count_by_condition(df, "gov_dominant", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  financing_indicators <- list(
    c("Govern on health exp", "3.4.2 Average Government Share"),
    c("Voluntary Prepayments on health exp", "3.4.3 Average Voluntary Prepaid Insurance Share"),
    c("Out-of-pocket on health exp", "3.4.4 Average Out-of-Pocket Share"),
    c("Other Private on health exp", "3.4.5 Average Other Private Share"),
    c("External on health exp", "3.4.6 Average Development Partners Share")
  )

  for (item in financing_indicators) {
    col <- item[1]
    label <- item[2]

    writeData(wb, sheet, label, startRow = row, startCol = 1)
    addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
    row <- row + 1

    agg <- aggregate_with_gini(df, col)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

    for (group in c("income", "Subregion")) {
      agg <- aggregate_with_gini(df, col, group)
      row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
    }
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_35 <- function(wb, df, styles) {
  sheet <- "3.5 UHC Index"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.5 Health Outputs - Universal Health Coverage (UHC) Index", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.5.1 Average UHC Index", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Universal health coverage")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Universal health coverage", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.5.2 Countries with UHC Index Below 50% or Below Regional Average", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- count_by_condition(df, "uhc_below_50_or_avg")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- count_by_condition(df, "uhc_below_50_or_avg", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.5.3 Inequality in UHC Index", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Universal health coverage")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level - Gini & Range", styles)

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_36 <- function(wb, df, styles) {
  sheet <- "3.6 Health Outcomes"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.6 Health Outcomes - Neonatal mortality rate (NMR) and Maternal Mortality Ratio (MMR)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 1
  writeData(wb, sheet, "Note: Data uses Neonatal Mortality Rate (NMR) - deaths in the first 28 days of life per 1,000 live births.", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$note, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.6.1 Average Neonatal mortality rate (per 1,000 live births)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Neonatal mortality rate")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Neonatal mortality rate", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.6.2 Average Maternal Mortality Ratio (per 100,000 live births)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Maternal mortality ratio")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Maternal mortality ratio", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.6.3 Countries On Course to Reduce NMR to At Least 12 per 1,000 (NMR <= 12)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- count_by_condition(df, "nmr_on_course")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- count_by_condition(df, "nmr_on_course", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.6.4 Countries On Course to Reduce MMR to Less Than 70 per 100,000 (MMR < 70)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- count_by_condition(df, "mmr_on_course")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- count_by_condition(df, "mmr_on_course", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_37 <- function(wb, df, styles) {
  sheet <- "3.7 Financing x UHC"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.7 Health Financing Dimensions and UHC Index", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.7.1 Countries Meeting Per Capita Threshold AND UHC Above 50th/75th Percentile", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  for (uhc_item in list(c("50th Percentile", "uhc_above_p50"), c("75th Percentile", "uhc_above_p75"))) {
    uhc_level <- uhc_item[1]
    uhc_col <- uhc_item[2]

    writeData(wb, sheet, paste("UHC Above", uhc_level), startRow = row, startCol = 1)
    addStyle(wb, sheet, styles$note, rows = row, cols = 1)
    row <- row + 1

    agg <- cross_tabulation(df, "meets_threshold", uhc_col)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

    for (group in c("income", "Subregion")) {
      agg <- cross_tabulation(df, "meets_threshold", uhc_col, group)
      row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
    }
  }

  writeData(wb, sheet, "3.7.2 Countries Meeting Abuja Target AND UHC Above 50th/75th Percentile", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  for (uhc_item in list(c("50th Percentile", "uhc_above_p50"), c("75th Percentile", "uhc_above_p75"))) {
    uhc_level <- uhc_item[1]
    uhc_col <- uhc_item[2]

    writeData(wb, sheet, paste("UHC Above", uhc_level), startRow = row, startCol = 1)
    addStyle(wb, sheet, styles$note, rows = row, cols = 1)
    row <- row + 1

    agg <- cross_tabulation(df, "meets_abuja", uhc_col)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)
  }

  writeData(wb, sheet, "3.7.3 Countries with OOP Below 20% Benchmark AND UHC Above 50th/75th Percentile", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  for (uhc_item in list(c("50th Percentile", "uhc_above_p50"), c("75th Percentile", "uhc_above_p75"))) {
    uhc_level <- uhc_item[1]
    uhc_col <- uhc_item[2]

    writeData(wb, sheet, paste("UHC Above", uhc_level), startRow = row, startCol = 1)
    addStyle(wb, sheet, styles$note, rows = row, cols = 1)
    row <- row + 1

    agg <- cross_tabulation(df, "below_oop_benchmark", uhc_col)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_38 <- function(wb, df, styles) {
  sheet <- "3.8 Financing x Outcomes"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.8 Health Financing Dimensions and Health Outcomes (NMR and MMR)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.8.1 Countries Meeting Per Capita Threshold AND On Course for NMR Target", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- cross_tabulation(df, "meets_threshold", "nmr_on_course")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- cross_tabulation(df, "meets_threshold", "nmr_on_course", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.8.2 Countries Meeting Abuja Target AND On Course for MMR Target", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- cross_tabulation(df, "meets_abuja", "mmr_on_course")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- cross_tabulation(df, "meets_abuja", "mmr_on_course", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_39 <- function(wb, df, styles) {
  sheet <- "3.9 Structure x UHC"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.9 Health Financing Structure and UHC Index", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  financing_sources <- list(
    c("gov_highest", "3.9.1 Government Share Dominant (> 50%)"),
    c("vol_highest", "3.9.2 Voluntary Prepaid Highest"),
    c("oop_highest", "3.9.3 Out-of-Pocket Highest"),
    c("other_highest", "3.9.4 Other Private Highest"),
    c("ext_highest", "3.9.5 Development Partners Highest")
  )

  for (item in financing_sources) {
    flag_col <- item[1]
    label <- item[2]

    writeData(wb, sheet, paste(label, "AND UHC Above Percentiles"), startRow = row, startCol = 1)
    addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
    row <- row + 1

    for (uhc_item in list(c("50th Percentile", "uhc_above_p50"), c("75th Percentile", "uhc_above_p75"))) {
      uhc_level <- uhc_item[1]
      uhc_col <- uhc_item[2]

      writeData(wb, sheet, paste("UHC Above", uhc_level), startRow = row, startCol = 1)
      addStyle(wb, sheet, styles$note, rows = row, cols = 1)
      row <- row + 1

      agg <- cross_tabulation(df, flag_col, uhc_col)
      row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)
    }
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_310 <- function(wb, df, styles) {
  sheet <- "3.10 Structure x Outcomes"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.10 Health Financing Structure and Health Outcomes", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  financing_sources <- list(
    c("gov_highest", "3.10.1/6 Government Share Dominant (> 50%)"),
    c("vol_highest", "3.10.2/7 Voluntary Prepaid Highest"),
    c("oop_highest", "3.10.3/8 Out-of-Pocket Highest"),
    c("other_highest", "3.10.4/9 Other Private Highest"),
    c("ext_highest", "3.10.5/10 Development Partners Highest")
  )

  outcomes <- list(
    c("nmr_on_course", "NMR <= 12 per 1,000 live births"),
    c("mmr_on_course", "MMR < 70 per 100,000 live births")
  )

  for (fin_item in financing_sources) {
    fin_col <- fin_item[1]
    fin_label <- fin_item[2]

    for (out_item in outcomes) {
      out_col <- out_item[1]
      out_label <- out_item[2]

      writeData(wb, sheet, paste(fin_label, "AND On Course for", out_label), startRow = row, startCol = 1)
      addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
      row <- row + 1

      agg <- cross_tabulation(df, fin_col, out_col)
      row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

      for (group in c("income", "Subregion")) {
        agg <- cross_tabulation(df, fin_col, out_col, group)
        row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
      }
    }
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_311 <- function(wb, df, styles) {
  sheet <- "3.11 Fiscal Space"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "3.11 Fiscal Space and Macroeconomic Constraints", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.11.1 Health Spending Elasticity", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1
  writeData(wb, sheet, "[Data not available in current dataset - requires time-series regression analysis]", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$note, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "3.11.2 Tax Revenue as % of GDP", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Tax Revenue per GDP")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Tax Revenue per GDP", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.11.3 Health Expenditure as % of GDP", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  agg <- aggregate_with_gini(df, "Exp Health on GDP")
  row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)

  for (group in c("income", "Subregion")) {
    agg <- aggregate_with_gini(df, "Exp Health on GDP", group)
    row <- add_dataframe_to_sheet(wb, sheet, agg, row, paste("By", group), styles)
  }

  writeData(wb, sheet, "3.11.5 Gross Fixed Capital Formation", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  gfcf_cols <- list(
    c("Gross fixed capital formation, as % of Gross domestic product (GDP)", "GFCF as % of GDP"),
    c("Gross fixed capital formation, in current US$ per capita", "GFCF Per Capita (Current USD)"),
    c("Gross fixed capital formation, in constant (2023) US$ per capita", "GFCF Per Capita (Constant USD)")
  )

  for (item in gfcf_cols) {
    col <- item[1]
    label <- item[2]

    if (col %in% names(df)) {
      writeData(wb, sheet, label, startRow = row, startCol = 1)
      addStyle(wb, sheet, styles$note, rows = row, cols = 1)
      row <- row + 1

      agg <- aggregate_with_gini(df, col)
      row <- add_dataframe_to_sheet(wb, sheet, agg, row, "Africa Level", styles)
    }
  }

  writeData(wb, sheet, "Missing Indicators:", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  missing <- c(
    "3.11.4 Institutional health investment share - Not in dataset",
    "3.11.6 Foreign direct investment - Not in dataset",
    "3.11.7 Investment returns on health expenditure - Not in dataset"
  )

  for (item in missing) {
    writeData(wb, sheet, item, startRow = row, startCol = 1)
    addStyle(wb, sheet, styles$note, rows = row, cols = 1)
    row <- row + 1
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_threshold_uhc <- function(wb, df, styles) {
  sheet <- "Threshold x UHC"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "Threshold Categories x UHC (>50%)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 1
  writeData(wb, sheet, "Cross-tabulation of government health expenditure threshold categories with UHC", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$note, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "By Year - Number of Countries (Africa-wide)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab_by_year(df, "uhc_above_50", "UHC >50%")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Year - Average Gov Health Expenditure Per Capita (Africa-wide)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  writeData(wb, sheet, "By Income Group - Number of Countries", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab(df, "uhc_above_50", "UHC >50%", "income")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Income Group - Average Gov Health Expenditure Per Capita", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  writeData(wb, sheet, "By Subregion - Number of Countries", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab(df, "uhc_above_50", "UHC >50%", "Subregion")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Subregion - Average Gov Health Expenditure Per Capita", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_threshold_imr <- function(wb, df, styles) {
  sheet <- "Threshold x NMR"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "Threshold Categories x NMR (>12 vs <=12)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 1
  writeData(wb, sheet, "Cross-tabulation of government health expenditure threshold categories with Neonatal mortality rate", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$note, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "By Year - Number of Countries (Africa-wide)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab_by_year(df, "nmr_category", "NMR")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Year - Average Gov Health Expenditure Per Capita (Africa-wide)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  writeData(wb, sheet, "By Income Group - Number of Countries", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab(df, "nmr_category", "NMR", "income")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Income Group - Average Gov Health Expenditure Per Capita", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  writeData(wb, sheet, "By Subregion - Number of Countries", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab(df, "nmr_category", "NMR", "Subregion")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Subregion - Average Gov Health Expenditure Per Capita", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

create_section_threshold_mmr <- function(wb, df, styles) {
  sheet <- "Threshold x MMR"
  addWorksheet(wb, sheet)
  row <- 1

  writeData(wb, sheet, "Threshold Categories x MMR (>70 vs <=70)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$title, rows = row, cols = 1)
  row <- row + 1
  writeData(wb, sheet, "Cross-tabulation of government health expenditure threshold categories with Maternal Mortality Ratio", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$note, rows = row, cols = 1)
  row <- row + 2

  writeData(wb, sheet, "By Year - Number of Countries (Africa-wide)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab_by_year(df, "mmr_category", "MMR")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Year - Average Gov Health Expenditure Per Capita (Africa-wide)", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  writeData(wb, sheet, "By Income Group - Number of Countries", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab(df, "mmr_category", "MMR", "income")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Income Group - Average Gov Health Expenditure Per Capita", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  writeData(wb, sheet, "By Subregion - Number of Countries", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  result <- create_threshold_crosstab(df, "mmr_category", "MMR", "Subregion")
  if (!is.null(result$count)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$count, row, NULL, styles, is_count_table = TRUE)
  }

  writeData(wb, sheet, "By Subregion - Average Gov Health Expenditure Per Capita", startRow = row, startCol = 1)
  addStyle(wb, sheet, styles$subtitle, rows = row, cols = 1)
  row <- row + 1

  if (!is.null(result$avg)) {
    row <- add_dataframe_to_sheet(wb, sheet, result$avg, row, NULL, styles)
  }

  setColWidths(wb, sheet, cols = 1:10, widths = "auto")
}

# =============================================================================
# PART 6: MAIN FUNCTION
# =============================================================================

generate_report <- function(raw_data_file = RAW_DATA_FILE, output_dir = OUTPUT_DIR) {
  #' Main function to generate the complete Excel report
  #'
  #' @param raw_data_file Path to health_data.xlsx
  #' @param output_dir Output directory for the report
  #' @return Path to generated Excel file

  cat("\n")
  cat("======================================================================\n")
  cat("HEALTH FINANCING GAP STATISTICAL PRODUCT GENERATOR (R VERSION)\n")
  cat("======================================================================\n")
  cat("This script processes raw data and generates the complete Excel report.\n")
  cat("======================================================================\n\n")

  # Step 1: Load raw data
  df_raw <- load_raw_data(raw_data_file)

  # Step 2: Process data and calculate indicators
  df <- process_raw_data(df_raw)

  # Step 3: Save processed data
  save_processed_data(df)

  # Step 4: Create workbook
  message("\n")
  message("=" %>% rep(70) %>% paste(collapse = ""))
  message("GENERATING EXCEL REPORT")
  message("=" %>% rep(70) %>% paste(collapse = ""))

  wb <- createWorkbook()
  styles <- create_styles()

  message("\nCreating sheets...")

  message("  - Summary")
  create_summary_sheet(wb, df, styles)

  message("  - 3.1 Public Health Financing")
  create_section_31(wb, df, styles)

  message("  - 3.2 Abuja Declaration")
  create_section_32(wb, df, styles)

  message("  - 3.3 Financial Protection")
  create_section_33(wb, df, styles)

  message("  - 3.4 Financing Structure")
  create_section_34(wb, df, styles)

  message("  - 3.5 UHC Index")
  create_section_35(wb, df, styles)

  message("  - 3.6 Health Outcomes")
  create_section_36(wb, df, styles)

  message("  - 3.7 Financing x UHC")
  create_section_37(wb, df, styles)

  message("  - 3.8 Financing x Outcomes")
  create_section_38(wb, df, styles)

  message("  - 3.9 Structure x UHC")
  create_section_39(wb, df, styles)

  message("  - 3.10 Structure x Outcomes")
  create_section_310(wb, df, styles)

  message("  - 3.11 Fiscal Space")
  create_section_311(wb, df, styles)

  message("  - Threshold x UHC")
  create_section_threshold_uhc(wb, df, styles)

  message("  - Threshold x NMR")
  create_section_threshold_imr(wb, df, styles)

  message("  - Threshold x MMR")
  create_section_threshold_mmr(wb, df, styles)

  # Reorder sheets to put Summary first
  worksheetOrder(wb) <- c(which(names(wb) == "Summary"), which(names(wb) != "Summary"))

  # Save workbook
  output_file <- file.path(output_dir, "Health_Financing_Gap_Statistical_Product_R.xlsx")
  saveWorkbook(wb, output_file, overwrite = TRUE)

  cat("\n")
  cat("======================================================================\n")
  cat(paste("REPORT SAVED:", output_file, "\n"))
  cat("======================================================================\n")
  cat(paste("\nSheets created:", length(names(wb)), "\n"))
  for (sheet in names(wb)) {
    cat(paste("   -", sheet, "\n"))
  }

  return(output_file)
}

# =============================================================================
# RUN IF EXECUTED DIRECTLY
# =============================================================================

if (interactive()) {
  # Run the report generation
  output_file <- generate_report()
} else {
  message("Health Financing Report Generator loaded.")
  message("Call generate_report() to create the Excel workbook.")
}
