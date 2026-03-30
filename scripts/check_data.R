library(readxl)
library(dplyr)

df <- read_excel('../../raw_data/Health_Financing Data.xlsx')

# Check data by year
year_summary <- df %>%
  group_by(year) %>%
  summarise(
    n_countries = n(),
    n_with_per_capita = sum(!is.na(`Gov exp Health per capita`)),
    n_with_gdp = sum(!is.na(`Gov exp Health on GDP`)),
    n_with_budget = sum(!is.na(`Gov exp Health on budget`)),
    n_with_oop = sum(!is.na(`Out-of-pocket on health exp`))
  )

print(year_summary, n = Inf)

cat("\n\nMost recent year with complete data:\n")
complete_year <- year_summary %>%
  filter(n_with_per_capita > 40) %>%
  tail(1)
print(complete_year)

# Check 2023 data
cat("\n\nSample 2023 data:\n")
df_2023 <- df %>%
  filter(year == 2023) %>%
  select(location, income,
         `Gov exp Health per capita`,
         `Gov exp Health on GDP`,
         `Gov exp Health on budget`,
         `Out-of-pocket on health exp`) %>%
  filter(!is.na(`Gov exp Health per capita`))

print(head(df_2023, 10))
