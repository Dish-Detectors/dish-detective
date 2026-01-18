"use client";

import { Box, Stack, IconButton } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MapIcon from "@mui/icons-material/Map";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationCenter from "./NotificationCenter";
import React, { useEffect } from "react";
import { Badge } from "@mui/material";
import { getUnreadNotificationCount } from "@/actions/notification";

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
  const [notifAnchor, setNotifAnchor] = React.useState<null | HTMLElement>(
    null,
  );
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchUnreadCount = async () => {
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotif = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(notifAnchor ? null : event.currentTarget);
  };

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
          onClick={handleToggleNotif}
          sx={{
            color: notifAnchor ? "primary.main" : "text.primary",
            bgcolor: notifAnchor ? "grey.100" : "transparent",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Stack>

      <NotificationCenter
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        onRead={() => fetchUnreadCount()}
      />
    </Box>
  );
}
