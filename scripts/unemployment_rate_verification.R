# ============================================================
# 1. Load required packages
# ============================================================
if (!requireNamespace("WDI", quietly = TRUE)) install.packages("WDI")
if (!requireNamespace("dplyr", quietly = TRUE)) install.packages("dplyr")

library(WDI)
library(dplyr)

# ============================================================
# 2. Download WDI data (global)
# ============================================================
df <- WDI(
  country = "all",
  indicator = c(
    unemployment_rate = "SL.UEM.TOTL.ZS"
  ),
  start = 2000,
  end = 2025,
  extra = TRUE   # adds region, income, etc.
)

# ============================================================
# 3. Clean dataset (remove aggregates)
# ============================================================
df_clean <- df %>%
  filter(!is.na(iso3c)) %>%   # removes "World", "OECD", etc.
  rename(
    country = country,
    iso3 = iso3c,
    iso2 = iso2c,
    year = year,
    region = region,
    income_group = income
  )

# ============================================================
# 4. Add GLOBAL subregion classification (UN-style approximation)
# ============================================================
df_clean <- df_clean %>%
  mutate(
    subregion = case_when(
      
      # AFRICA
      iso3 %in% c("DZA","EGY","LBY","MAR","SDN","TUN") ~ "North Africa",
      iso3 %in% c("BEN","BFA","CPV","CIV","GMB","GHA","GIN","GNB","LBR","MLI","NER","NGA","SEN","SLE","TGO") ~ "West Africa",
      iso3 %in% c("CMR","CAF","TCD","COG","COD","GNQ","GAB","STP") ~ "Central Africa",
      iso3 %in% c("BDI","COM","DJI","ERI","ETH","KEN","MDG","MWI","MUS","RWA","SOM","SSD","TZA","UGA","ZMB","ZWE","SYC") ~ "East Africa",
      iso3 %in% c("AGO","BWA","LSO","NAM","ZAF","SWZ","MOZ") ~ "Southern Africa",
      
      # EUROPE
      region == "Europe & Central Asia" & iso3 %in% c("FRA","DEU","ITA","ESP","PRT","BEL","NLD","LUX","AUT","CHE","IRL") ~ "Western Europe",
      region == "Europe & Central Asia" & iso3 %in% c("POL","CZE","SVK","HUN","SVN","HRV") ~ "Central Europe",
      region == "Europe & Central Asia" & iso3 %in% c("ROU","BGR","UKR","BLR","MDA") ~ "Eastern Europe",
      
      # ASIA
      region == "East Asia & Pacific" & iso3 %in% c("CHN","JPN","KOR","MNG") ~ "East Asia",
      region == "South Asia" ~ "South Asia",
      region == "East Asia & Pacific" & iso3 %in% c("THA","VNM","IDN","PHL","MYS","KHM","LAO","MMR","SGP") ~ "Southeast Asia",
      region == "Middle East & North Africa" & !(iso3 %in% c("DZA","EGY","LBY","MAR","SDN","TUN")) ~ "Middle East",
      
      # AMERICAS
      region == "Latin America & Caribbean" & iso3 %in% c("MEX","GTM","HND","SLV","NIC","CRI","PAN") ~ "Central America",
      region == "Latin America & Caribbean" & iso3 %in% c("BRA","ARG","CHL","PER","COL","VEN","ECU","BOL","PRY","URY") ~ "South America",
      region == "Latin America & Caribbean" ~ "Caribbean",
      region == "North America" ~ "North America",
      
      # OCEANIA
      region == "East Asia & Pacific" & iso3 %in% c("AUS","NZL") ~ "Australia & New Zealand",
      region == "East Asia & Pacific" ~ "Pacific Islands",
      
      TRUE ~ "Other"
    )
  )

# ============================================================
# 5. Basic checks
# ============================================================
summary_stats <- df_clean %>%
  summarise(
    countries = n_distinct(iso3),
    years = paste(min(year, na.rm = TRUE), "-", max(year, na.rm = TRUE)),
    observations = n()
  )

print(summary_stats)

# ============================================================
# 6. Optional: save output
# ============================================================
# write.csv(df_clean, "wdi_unemployment_global.csv", row.names = FALSE)