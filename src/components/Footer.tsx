"use client";

import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";

export const footerHeight = 28;

export default function Footer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const showFooterBar = pathname !== "/" && !isMobile;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: showFooterBar ? `${footerHeight}px` : 0,
      }}
    >
      {children}
      {showFooterBar && (
        <Box
          component="footer"
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${footerHeight}px`,
            bgcolor: "#56aaf4",
            zIndex: (theme) => theme.zIndex.drawer + 2,
          }}
        />
      )}
    </Box>
  );
}
