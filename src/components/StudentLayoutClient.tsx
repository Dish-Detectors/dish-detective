"use client";

import { ReactNode, useState, useEffect } from "react";
import StudentNavbar, { navWidth } from "@/components/StudentNavbar";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import PancakeStackLoader from "@/components/PancakeStackLoader";

export default function StudentLayoutClient({
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
          height: "100vh",
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
      }}
    >
      <StudentNavbar isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: isMobile ? 0 : `${navWidth}px`,
          width: isMobile ? "100%" : `calc(100% - ${navWidth}px)`,
          pb: isMobile ? "64px" : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
