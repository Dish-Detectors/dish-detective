"use client";

import React, { useEffect, useState } from "react";
import { Snackbar, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  checkNotificationPermission,
  requestNotificationPermission,
} from "@/utils/fcmClient";
import {
  getUserSubscriptions,
  syncDeviceSubscriptions,
} from "@/actions/notification";

export default function NotificationSync() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAndSync = async () => {
      // 1. Check if browser already has permission
      const permission = checkNotificationPermission();
      const lastSync = localStorage.getItem("lastNotifSyncVer");
      const currentSyncVer = "2"; // Personal topic sync version

      if (permission === "granted") {
        if (lastSync !== currentSyncVer) {
          const token = await requestNotificationPermission();
          if (token) {
            await syncDeviceSubscriptions(token);
            localStorage.setItem("lastNotifSyncVer", currentSyncVer);
          }
        }
      } else if (permission !== "denied") {
        // Only prompt if not already denied
        setOpen(true);
      }
    };

    checkAndSync();
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        await syncDeviceSubscriptions(token);
        localStorage.setItem("lastNotifSyncVer", "2");
        setOpen(false);
      }
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Snackbar
      open={open}
      message="Želite li primati obavijesti o novostima i jelima?"
      action={
        <React.Fragment>
          <Button
            color="secondary"
            size="small"
            onClick={handleSync}
            disabled={loading}
          >
            OMOGUĆI
          </Button>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      }
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ bottom: { xs: 90, sm: 20 } }} // Avoid overlap with mobile navbar
    />
  );
}
