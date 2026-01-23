"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import StudentNavbar, {
  navWidth,
  headerHeight,
} from "@/components/StudentNavbar";
import NotificationSync from "@/components/NotificationSync";
import { Box, useMediaQuery, useTheme } from "@mui/material";
// import PancakeStackLoader from "@/components/PancakeStackLoader"; // No longer used
import RestaurantSkeletonGrid from "@/components/RestaurantSkeletonGrid";

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
          display: "flex",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Navbar Skeleton */}
        <Box
          sx={{
            width: { xs: "100%", sm: navWidth },
            height: { xs: 64, sm: "100vh" },
            position: "fixed",
            [isMobile ? "bottom" : "top"]: 0,
            left: 0,
            bgcolor: "background.paper",
            borderRight: isMobile ? 0 : 1,
            borderTop: isMobile ? 1 : 0,
            borderColor: "divider",
            zIndex: 1200,
          }}
        />

        {/* Main Content Skeleton */}
        <Box
          sx={{
            flexGrow: 1,
            ml: { xs: 0, sm: `${navWidth}px` },
            mb: { xs: 8, sm: 0 },
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <RestaurantSkeletonGrid />
        </Box>
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
