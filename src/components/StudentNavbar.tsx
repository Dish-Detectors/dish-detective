"use client";

import { Box, Stack, IconButton } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MapIcon from "@mui/icons-material/Map";
import NotificationsIcon from "@mui/icons-material/Notifications";

export const navWidth = 80;
export const headerHeight = 64;

interface StudentNavbarProps {
  isMobile?: boolean;
}

export default function StudentNavbar({
  isMobile = false,
}: StudentNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/student") {
      return pathname === "/student";
    }
    return pathname.startsWith(path);
  };

  const getIconButtonStyle = (path: string) => ({
    bgcolor: isActive(path) ? "primary.main" : "transparent",
    color: isActive(path) ? "white" : "text.primary",
    "&:hover": {
      bgcolor: isActive(path) ? "primary.dark" : "grey.100",
    },
  });

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        ...(isMobile
          ? {
              top: "auto",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              height: "64px",
              boxShadow: "0 -2px 8px rgba(0,0,0,0.12)",
            }
          : {
              top: `${headerHeight}px`,
              left: 0,
              bottom: 0,
              width: `${navWidth}px`,
              boxShadow: "2px 0 8px rgba(0,0,0,0.12)",
            }),
        bgcolor: "common.white",
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        justifyContent: isMobile ? "space-around" : "center",
        alignItems: "center",
        p: isMobile ? 1 : 2,
        zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure navbar is above content
      }}
    >
      <Stack
        spacing={isMobile ? 0 : 2}
        direction={isMobile ? "row" : "column"}
        sx={{
          width: isMobile ? "100%" : "auto",
          justifyContent: isMobile ? "space-around" : "center",
        }}
      >
        <IconButton
          onClick={() => router.push("/student")}
          sx={getIconButtonStyle("/student")}
        >
          <HomeFilledIcon />
        </IconButton>
        <IconButton
          onClick={() => router.push("/student/restaurants")}
          sx={getIconButtonStyle("/student/restaurants")}
        >
          <RestaurantIcon />
        </IconButton>
        <IconButton
          onClick={() => router.push("/student/map")}
          sx={getIconButtonStyle("/student/map")}
        >
          <MapIcon />
        </IconButton>
        <IconButton
          sx={{
            color: "text.primary",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <NotificationsIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}
