# =============================================================================
# Extract All Tables from Health Financing Gap Statistical Product Excel
# =============================================================================
# This script reads the Excel workbook and extracts all tables from each sheet
# into a structured list for easy access and analysis in R.
# =============================================================================

# Load required libraries
if (!require("readxl")) install.packages("readxl")
if (!require("openxlsx")) install.packages("openxlsx")
if (!require("dplyr")) install.packages("dplyr")
if (!require("tidyr")) install.packages("tidyr")

library(readxl)
library(openxlsx)
library(dplyr)
library(tidyr)

# =============================================================================
# Configuration
# =============================================================================

# Path to the Excel file
EXCEL_FILE <- file.path(
  dirname(dirname(rstudioapi::getSourceEditorContext()$path)),
  "reports",
  "Health_Financing_Gap_Statistical_Product_FINAL.xlsx"
)

# Alternative: Set path manually if not using RStudio
# EXCEL_FILE <- "C:/path/to/Health_Financing_Gap_Statistical_Product_FINAL.xlsx"

# =============================================================================
# Function: Extract tables from a single sheet
# =============================================================================

extract_tables_from_sheet <- function(file_path, sheet_name) {

"""
  Extract all tables from a single Excel sheet.
  Tables are identified by looking for header rows followed by data.
"""

  # Read raw data without headers
  raw_data <- tryCatch({
    read_excel(file_path, sheet = sheet_name, col_names = FALSE, .name_repair = "minimal")
  }, error = function(e) {
    message(paste("Error reading sheet:", sheet_name, "-", e$message))
    return(NULL)
  })

  if (is.null(raw_data) || nrow(raw_data) == 0) {
    return(list())
  }

  tables <- list()
  table_count <- 0
  current_title <- ""

  i <- 1
  while (i <= nrow(raw_data)) {
    row <- raw_data[i, ]
    first_cell <- as.character(row[[1]])

    # Skip empty rows
    if (is.na(first_cell) || first_cell == "") {
      i <- i + 1
      next
    }

    # Check if this is a section title (text in first column, rest mostly empty)
    non_empty_cells <- sum(!is.na(row) & row != "")

    # Potential table title - single cell with text
    if (non_empty_cells == 1 && !grepl("^\\d+\\.\\d+", first_cell)) {
      # This might be a table title or section header
      if (!grepl("^(Year|year|income|Subregion)", first_cell)) {
        current_title <- first_cell
        i <- i + 1
        next
      }
    }

    # Check if this row looks like a header row (multiple non-empty cells)
    if (non_empty_cells >= 2) {
      # Try to extract a table starting from this row
      table_start <- i
      table_end <- i

      # Find the end of the table (look for empty row or new section)
      j <- i + 1
      while (j <= nrow(raw_data)) {
        next_row <- raw_data[j, ]
        next_first_cell <- as.character(next_row[[1]])
        next_non_empty <- sum(!is.na(next_row) & next_row != "")

        # Empty row or new section title signals end of table
        if (is.na(next_first_cell) || next_first_cell == "" ||
            (next_non_empty == 1 && !grepl("^\\d", next_first_cell))) {
          break
        }

        table_end <- j
        j <- j + 1
      }

      # Extract the table if it has at least a header and one data row
      if (table_end > table_start) {
        table_data <- raw_data[table_start:table_end, ]

        # Use first row as column names
        col_names <- as.character(table_data[1, ])
        col_names[is.na(col_names) | col_names == ""] <- paste0("V", which(is.na(col_names) | col_names == ""))

        # Make column names unique
        col_names <- make.unique(col_names)

        # Extract data rows
        if (nrow(table_data) > 1) {
          data_rows <- table_data[-1, ]
          colnames(data_rows) <- col_names

          # Convert to proper data frame and clean up
          df <- as.data.frame(data_rows)

          # Convert numeric columns
          for (col in names(df)) {
            if (col != "year" && col != "income" && col != "Subregion") {
              numeric_vals <- suppressWarnings(as.numeric(df[[col]]))
              if (sum(!is.na(numeric_vals)) > sum(!is.na(df[[col]])) * 0.5) {
                df[[col]] <- numeric_vals
              }
            }
          }

          table_count <- table_count + 1
          table_name <- if (current_title != "") {
            paste0("Table_", table_count, "_", gsub("[^[:alnum:]]", "_", substr(current_title, 1, 50)))
          } else {
            paste0("Table_", table_count)
          }

          tables[[table_name]] <- list(
            title = current_title,
            data = df,
            start_row = table_start,
            end_row = table_end
          )
        }
      }

      i <- table_end + 1
      current_title <- ""
    } else {
      i <- i + 1
    }
  }

  return(tables)
}

# =============================================================================
# Function: Extract all tables from workbook
# =============================================================================

extract_all_tables <- function(file_path) {
"""
  Extract all tables from all sheets in the Excel workbook.
  Returns a nested list: sheets -> tables -> data
"""

  # Check if file exists
  if (!file.exists(file_path)) {
    stop(paste("Excel file not found:", file_path))
  }

  # Get all sheet names
  sheet_names <- excel_sheets(file_path)
  message(paste("Found", length(sheet_names), "sheets in workbook"))

  # Extract tables from each sheet
  all_tables <- list()

  for (sheet in sheet_names) {
    message(paste("Processing sheet:", sheet))
    tables <- extract_tables_from_sheet(file_path, sheet)

    if (length(tables) > 0) {
      all_tables[[sheet]] <- tables
      message(paste("  - Extracted", length(tables), "tables"))
    } else {
      message("  - No tables found")
    }
  }

  return(all_tables)
}

# =============================================================================
# Function: List all tables
# =============================================================================

list_all_tables <- function(tables_list) {
"""
  Print a summary of all extracted tables.
"""

  cat("\n========================================\n")
  cat("SUMMARY OF EXTRACTED TABLES\n")
  cat("========================================\n\n")

  total_tables <- 0

  for (sheet_name in names(tables_list)) {
    sheet_tables <- tables_list[[sheet_name]]
    cat(paste0("Sheet: ", sheet_name, "\n"))
    cat(paste0(rep("-", nchar(sheet_name) + 7), collapse = ""), "\n")

    for (table_name in names(sheet_tables)) {
      table_info <- sheet_tables[[table_name]]
      cat(paste0("  ", table_name, "\n"))
      cat(paste0("    Title: ", table_info$title, "\n"))
      cat(paste0("    Dimensions: ", nrow(table_info$data), " rows x ", ncol(table_info$data), " cols\n"))
      total_tables <- total_tables + 1
    }
    cat("\n")
  }

  cat(paste0("Total tables extracted: ", total_tables, "\n"))
  cat("========================================\n")
}

# =============================================================================
# Function: Get a specific table
# =============================================================================

get_table <- function(tables_list, sheet_name, table_index = 1) {
"""
  Get a specific table by sheet name and table index.
"""

  if (!sheet_name %in% names(tables_list)) {
    stop(paste("Sheet not found:", sheet_name))
  }

  sheet_tables <- tables_list[[sheet_name]]

  if (table_index > length(sheet_tables)) {
    stop(paste("Table index", table_index, "out of range. Sheet has", length(sheet_tables), "tables."))
  }

  return(sheet_tables[[table_index]]$data)
}

# =============================================================================
# Function: Export all tables to CSV
# =============================================================================

export_tables_to_csv <- function(tables_list, output_dir) {
"""
  Export all tables to individual CSV files.
"""

  # Create output directory if it doesn't exist
  if (!dir.exists(output_dir)) {
    dir.create(output_dir, recursive = TRUE)
  }

  file_count <- 0

  for (sheet_name in names(tables_list)) {
    sheet_tables <- tables_list[[sheet_name]]

    # Clean sheet name for file naming
    clean_sheet_name <- gsub("[^[:alnum:]]", "_", sheet_name)

    for (i in seq_along(sheet_tables)) {
      table_info <- sheet_tables[[i]]

      # Create filename
      filename <- paste0(clean_sheet_name, "_Table_", i, ".csv")
      filepath <- file.path(output_dir, filename)

      # Write CSV
      write.csv(table_info$data, filepath, row.names = FALSE)
      file_count <- file_count + 1
    }
  }

  message(paste("Exported", file_count, "tables to", output_dir))
}

# =============================================================================
# Function: Create a combined data frame with all tables
# =============================================================================

combine_tables_to_df <- function(tables_list) {
"""
  Create a data frame listing all tables with their metadata.
"""

  result <- data.frame(
    sheet = character(),
    table_index = integer(),
    table_name = character(),
    title = character(),
    rows = integer(),
    cols = integer(),
    stringsAsFactors = FALSE
  )

  for (sheet_name in names(tables_list)) {
    sheet_tables <- tables_list[[sheet_name]]

    for (i in seq_along(sheet_tables)) {
      table_info <- sheet_tables[[i]]

      result <- rbind(result, data.frame(
        sheet = sheet_name,
        table_index = i,
        table_name = names(sheet_tables)[i],
        title = table_info$title,
        rows = nrow(table_info$data),
        cols = ncol(table_info$data),
        stringsAsFactors = FALSE
      ))
    }
  }

  return(result)
}

# =============================================================================
# Main Execution
# =============================================================================

# Check if running interactively
if (interactive()) {

  cat("\n")
  cat("=================================================================\n")
  cat("HEALTH FINANCING GAP - EXCEL TABLE EXTRACTOR\n")
  cat("=================================================================\n\n")

  # Try to find the Excel file
  if (!exists("EXCEL_FILE") || !file.exists(EXCEL_FILE)) {
    # Try alternative paths
    possible_paths <- c(
      "reports/Health_Financing_Gap_Statistical_Product_FINAL.xlsx",
      "../reports/Health_Financing_Gap_Statistical_Product_FINAL.xlsx",
      "Health_Financing_Gap_Statistical_Product_FINAL.xlsx"
    )

    for (path in possible_paths) {
      if (file.exists(path)) {
        EXCEL_FILE <- path
        break
      }
    }
  }

  if (file.exists(EXCEL_FILE)) {
    cat(paste("Excel file found:", EXCEL_FILE, "\n\n"))

    # Extract all tables
    cat("Extracting tables...\n")
    all_tables <- extract_all_tables(EXCEL_FILE)

    # List all tables
    list_all_tables(all_tables)

    # Create summary data frame
    tables_summary <- combine_tables_to_df(all_tables)

    cat("\n")
    cat("=================================================================\n")
    cat("USAGE EXAMPLES\n")
    cat("=================================================================\n")
    cat("\n")
    cat("# View summary of all tables:\n")
    cat("View(tables_summary)\n\n")
    cat("# Get a specific table (e.g., first table from '3.1 Public Health Financing'):\n")
    cat("table_31_1 <- get_table(all_tables, '3.1 Public Health Financing', 1)\n\n")
    cat("# Access tables directly:\n")
    cat("all_tables[['3.1 Public Health Financing']][[1]]$data\n\n")
    cat("# Export all tables to CSV:\n")
    cat("export_tables_to_csv(all_tables, 'output/tables')\n\n")
    cat("# List sheets:\n")
    cat("names(all_tables)\n\n")
    cat("# List tables in a sheet:\n")
    cat("names(all_tables[['3.1 Public Health Financing']])\n")
    cat("=================================================================\n")

  } else {
    cat("ERROR: Excel file not found!\n")
    cat("Please set the EXCEL_FILE variable to the correct path.\n")
    cat("Example:\n")
    cat("EXCEL_FILE <- 'C:/path/to/Health_Financing_Gap_Statistical_Product_FINAL.xlsx'\n")
  }

} else {
  # When sourced from another script
  message("Health Financing Excel Table Extractor loaded.")
  message("Call extract_all_tables(file_path) to extract tables.")
}
