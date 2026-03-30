df1 <- process_raw_data(load_raw_data(RAW_DATA_FILE))


cor_mat <- df1 %>% 
  group_by(location) %>% 
  summarise(correlation = cor(`Gov exp Health per capita`, `Universal health coverage`,
                              use = "complete.obs"),
            .groups = "drop") %>% 
  mutate(correlation = round(correlation,3))

write_xlsx(cor_mat, "Correlation between govt health exp pc & UHC.xlsx")


egpt <- df1 %>% 
  filter(location=="Egypt")

library(ggplot2)
ggplot(egpt, aes(`Gov exp Health per capita`, `Universal health coverage`)) +
  geom_point() + geom_smooth()
