"use client";

import React from "react";
import { Typography } from "@mui/material";
import { useI18n } from "@/components/I18nProvider";

export default function StudentRestaurantsTitle() {
  const { t } = useI18n();

  return (
    <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
      {t("restaurantOverviewTitle")}
    </Typography>
  );
}
