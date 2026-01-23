"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isMapPage = pathname === "/student/map";
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
          bgcolor: "background.default",
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
          overflowY: isMapPage ? "hidden" : "auto",
          ml: isMobile ? 0 : `${navWidth}px`,
          pb: isMapPage ? 0 : isMobile ? "96px" : 4,
          bgcolor: "background.default", // Use theme background
          transition: "background-color 0.3s ease",
        }}
      >
        {children}
        <NotificationSync />
      </Box>
    </Box>
  );
}
