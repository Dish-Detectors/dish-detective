"use client";

import { ReactNode, useState, useEffect } from "react";
import ManagerNavbar, { navWidth } from "./ManagerNavbar";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import PancakeStackLoader from "@/components/PancakeStackLoader";

export default function ManagerLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box
        sx={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <PancakeStackLoader />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        minHeight: 0,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <ManagerNavbar isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100%",
          minHeight: 0,
          pl: isMobile ? 0 : `${navWidth}px`,
          width: isMobile ? "100%" : `calc(100% - ${navWidth}px)`,
          pb: isMobile ? "64px" : 0,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
