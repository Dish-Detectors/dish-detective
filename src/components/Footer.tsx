"use client";

import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";
import { useColorMode } from "@/components/ThemeRegistry";

export const footerHeight = 28;

export default function Footer() {
  const pathname = usePathname();
  const theme = useTheme();
  const { mode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const showFooterBar = pathname !== "/" && !isMobile;

  if (!showFooterBar) return null;

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: `${footerHeight}px`,
        bgcolor: mode === "dark" ? "background.paper" : "#56aaf4",
        zIndex: (theme) => theme.zIndex.drawer + 2,
        transition: "background-color 0.3s ease",
      }}
    />
  );
}
