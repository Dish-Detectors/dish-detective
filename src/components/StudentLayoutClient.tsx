"use client";

import { ReactNode, useState, useEffect } from "react";
import StudentNavbar, {
  navWidth,
  headerHeight,
} from "@/components/StudentNavbar";
import NotificationSync from "@/components/NotificationSync";
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
    <Box>
      <StudentNavbar isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          height: `calc(100vh - ${headerHeight}px)`,
          overflowY: "auto",
          ml: isMobile ? 0 : `${navWidth}px`,
          pb: isMobile ? "96px" : 4,
          bgcolor: "#f5f5f5", // Added background for consistency with Admin
        }}
      >
        {children}
        <NotificationSync />
      </Box>
    </Box>
  );
}
