"use client";

import { Box, Stack, IconButton } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationCenter from "./NotificationCenter";
import React from "react";

export const navWidth = 80;
export const headerHeight = 64;

interface WorkerNavbarProps {
  isMobile?: boolean;
}

export default function WorkerNavbar({ isMobile = false }: WorkerNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifAnchor, setNotifAnchor] = React.useState<null | HTMLElement>(
    null,
  );

  const handleToggleNotif = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(notifAnchor ? null : event.currentTarget);
  };

  const isActive = (path: string) => {
    if (path === "/worker") {
      return pathname === "/worker";
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
        zIndex: (theme) => theme.zIndex.drawer + 1,
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
          onClick={() => router.push("/worker")}
          sx={getIconButtonStyle("/worker")}
          aria-label="Home"
        >
          <HomeFilledIcon />
        </IconButton>
        <IconButton
          onClick={handleToggleNotif}
          sx={{
            bgcolor: "transparent",
            "&:hover": { bgcolor: "transparent" },
            "&.Mui-focusVisible": { bgcolor: "transparent" },
            "& .MuiSvgIcon-root": {
              color: notifAnchor ? "primary.main" : "text.primary",
              transition: "color 180ms ease",
            },
            "&:active .MuiSvgIcon-root": {
              color: "primary.main",
            },
            "@media (hover: hover) and (pointer: fine)": {
              "&:hover .MuiSvgIcon-root": {
                color: "primary.main",
              },
            },
          }}
          aria-label="Notifications"
          disableRipple
        >
          <NotificationsIcon />
        </IconButton>
      </Stack>

      <NotificationCenter
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        audience="worker"
      />
    </Box>
  );
}
