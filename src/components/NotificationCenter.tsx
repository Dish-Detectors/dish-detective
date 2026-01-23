"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Fade,
  ClickAwayListener,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DownloadIcon from "@mui/icons-material/Download";
import { useI18n } from "@/components/I18nProvider";
import {
  getAllStudentNotifications,
  getAllWorkerNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteAllNotifications,
} from "@/actions/notification";
import { INotification } from "@/models/Notification";
import PancakeStackLoader from "@/components/PancakeStackLoader";

interface NotificationCenterProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  audience?: "student" | "worker";
}

const SwipeableNotificationItem = ({
  notif,
  onDelete,
  onClick,
  setPreviewImage,
}: any) => {
  const { lang, t } = useI18n();
  const [startX, setStartX] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(x);
    setIsSwiping(true);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX === null) return;
    e.stopPropagation();

    // Prevent scrolling during swipe
    if ("touches" in e && Math.abs(offsetX) > 10) {
      if (e.cancelable) e.preventDefault();
    }

    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const diff = x - startX;

    // Prevent accidental clicks with a threshold
    if (Math.abs(diff) > 5) {
      setOffsetX(diff);
    }
  };

  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX === null) return;
    e.stopPropagation();

    const threshold = 150;
    if (Math.abs(offsetX) > threshold) {
      setIsClosing(true);
      // Let the height animation play before removing from DOM
      setTimeout(() => {
        setIsDeleted(true);
        onDelete(notif._id);
      }, 300);
    } else {
      setOffsetX(0);
    }

    setStartX(null);
    setIsSwiping(false);
  };

  if (isDeleted) return null;

  const titleText = notif.titleKey
    ? t(notif.titleKey, notif.titleParams)
    : notif.title === "Obavijest"
      ? t("notificationDefaultTitle")
      : notif.title || t("notificationDefaultTitle");

  const descriptionText = notif.descriptionKey
    ? t(notif.descriptionKey, notif.descriptionParams)
    : notif.description;

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        p: 0, // Remove padding from ListItem, move to content
        borderBottom: isClosing ? "0px solid transparent" : "1px solid", // Use divider color logic via theme usually, but keeping simple for now
        borderColor: "divider",
        maxHeight: isClosing ? 0 : 500,
        transition:
          "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s",
        opacity: isClosing ? 0 : 1, // Opacity fade on close
        position: "relative",
        overflow: "hidden", // Ensure background doesn't spill
      }}
    >
      {/* Background Layer (Red Delete Area) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0, // Full width background
          bgcolor: "error.main",
          display: "flex",
          alignItems: "center",
          justifyContent: offsetX > 0 ? "flex-start" : "flex-end", // Icon follows swipe direction
          px: 3,
          zIndex: 0,
        }}
      >
        <DeleteOutlineIcon sx={{ color: "white", fontSize: 28 }} />
      </Box>

      {/* Foreground Layer (Content) */}
      <Box
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onClick={(e) => {
          if (Math.abs(offsetX) < 10) {
            onClick();
          }
        }}
        sx={{
          width: "100%",
          bgcolor: "background.paper", // Solid background to cover red layer
          p: 2,
          pr: 4,
          cursor: "pointer",
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping
            ? "none"
            : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          zIndex: 1,
          borderLeft: notif.read
            ? "4px solid transparent"
            : "4px solid #56aaf5", // Keep read indicator
          display: "flex",
          alignItems: "flex-start",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "action.hover",
            opacity: 0,
            transition: "opacity 0.2s",
            pointerEvents: "none",
            zIndex: 0, // Behind content text but above background
          },
          "&:hover::after": {
            opacity: 1,
          },
        }}
      >
        {notif.imageUrl && (
          <Box
            component="img"
            src={notif.imageUrl}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setPreviewImage(notif.imageUrl || null);
            }}
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              objectFit: "cover",
              mr: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              cursor: "pointer",
              "&:hover": { transform: "scale(1.05)" },
              transition: "transform 0.2s",
            }}
          />
        )}

        {/* Attachment Rendering */}
        {notif.attachment && (
          <Box sx={{ mr: 2 }}>
            {notif.attachment.type.startsWith("image/") ? (
              <Box
                component="img"
                src={notif.attachment.url}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setPreviewImage(notif.attachment?.url || null);
                }}
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: 3,
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  "&:hover": { transform: "scale(1.05)" },
                  transition: "transform 0.2s",
                }}
              />
            ) : (
              <IconButton
                component="a"
                href={notif.attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: "action.hover", // Changed from grey.50
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider", // Changed from rgba(0,0,0,0.05)
                  "&:hover": { bgcolor: "action.selected" }, // Changed from grey.100
                }}
              >
                <DownloadIcon color="primary" />
              </IconButton>
            )}
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{
                color: notif.read ? "text.primary" : "primary.main",
                fontSize: "0.95rem",
                lineHeight: 1.2,
              }}
            >
              {titleText}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              lineHeight: 1.4,
              fontSize: "0.85rem",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {descriptionText}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", fontWeight: 500 }}
            >
              {new Date(notif.createdAt).toLocaleString(
                lang === "HR" ? "hr-HR" : "en-GB",
                {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ListItem>
  );
};

export default function NotificationCenter({
  open,
  anchorEl,
  onClose,
  audience = "student",
  onRead,
}: NotificationCenterProps & { onRead?: () => void }) {
  const router = useRouter();
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const notificationsRef = useRef(notifications);
  const [lastPos, setLastPos] = useState({ top: 0, left: 90 });
  const [shouldRender, setShouldRender] = useState(open);
  const [dynamicHeight, setDynamicHeight] = useState<number | string>(300);
  const contentRef = useRef<HTMLDivElement>(null);

  // Adjust height when loading completes
  useEffect(() => {
    if (!loading && contentRef.current) {
      const height = contentRef.current.offsetHeight;
      setDynamicHeight(height);
    } else if (loading) {
      setDynamicHeight(300); // Fixed skeleton height
    }
  }, [loading, notifications]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setLoading(true);
      setNotifications([]);
      setDynamicHeight(300);
      loadNotifications();
    } else {
      if (notificationsRef.current.some((n) => !n.read)) {
        handleMarkAllRead();
      }
    }
  }, [open]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data =
        audience === "worker"
          ? await getAllWorkerNotifications()
          : await getAllStudentNotifications();
      setNotifications(data as any);

      // If there are unread notifications, mark them as read after a delay or user interaction
      // For now, we'll auto-mark as read when opening the center, but ideally we'd want explicit action
      // Or we can add a "Mark all as read" button. Let's add the button.
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state to reflect read status
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }) as any),
      );
      if (onRead) onRead();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleMarkOneRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n) as any),
      );
      if (onRead) onRead();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => (n as any)._id !== id));
        if (onRead) onRead();
      }
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await deleteAllNotifications();
      if (res.success) {
        setNotifications([]);
        setConfirmDeleteOpen(false);
        if (onRead) onRead();
      }
    } catch (error) {
      console.error("Failed to delete all notifications", error);
    }
  };

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    const target = event.target as Node | null;
    if (anchorEl && target && anchorEl.contains(target)) {
      return;
    }
    // Only close if dialog is not open
    if (!confirmDeleteOpen && !previewImage) {
      if (hasUnread) {
        handleMarkAllRead();
      }
      onClose();
    }
  };

  const handleNotificationClick = async (notif: any) => {
    // Determine routing first
    let targetUrl = "";
    if (notif.pollId) {
      targetUrl = `/student/polls/${notif.pollId}`;
    } else if (notif.restaurantId) {
      targetUrl = `/student/restaurants/${notif.restaurantId}`;
    }

    // Mark as read if unread OR delete if it's a "consumable" notification like restaurant offer
    if (notif.restaurantId) {
      // Auto-delete restaurant notifications as they are one-time "alerts"
      try {
        await deleteNotification(notif._id);
        setNotifications((prev) =>
          prev.filter((n) => (n as any)._id !== notif._id),
        );
        if (onRead) onRead();
      } catch (error) {
        console.error(
          "Failed to delete restaurant notification on click",
          error,
        );
      }
    } else if (!notif.read) {
      try {
        await markNotificationAsRead(notif._id);
        setNotifications((prev) =>
          prev.map(
            (n) => (n._id === notif._id ? { ...n, read: true } : n) as any,
          ),
        );
        if (onRead) onRead();
      } catch (error) {
        console.error("Failed to mark notification as read on click", error);
      }
    }

    // Navigate if target exists
    if (targetUrl) {
      router.push(targetUrl);
      onClose();
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  const getPosition = () => {
    // If we have an anchor, calculate fresh position
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate ideal top position to center it vertically with the button
      let top = rect.top + rect.height / 2 - 275;

      // Constrain to viewport
      top = Math.max(80, Math.min(top, viewportHeight - 570));

      const newPos = {
        top: top,
        left: 90,
      };

      // Update last known position if it changed significantly
      if (Math.abs(newPos.top - lastPos.top) > 1) {
        setLastPos(newPos);
      }
      return newPos;
    }

    // Return the last known position while animating out
    return lastPos;
  };

  const pos = getPosition();

  // Return null ONLY if we are not supposed to render anymore (after animation)
  if (!shouldRender) return null;

  return (
    <>
      <ClickAwayListener
        onClickAway={handleClickAway}
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
      >
        <Fade in={open} timeout={400} onExited={() => setShouldRender(false)}>
          <Paper
            elevation={0}
            sx={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: 400,
              maxHeight: 600,
              borderRadius: 5,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              zIndex: 1300,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(30, 41, 59, 0.9)"
                  : "rgba(255, 255, 255, 0.9)", // Theme aware background
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
              border: "1px solid",
              borderColor: "divider", // Changed from rgba(255,255,255,0.4)
              transition: "top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "@media (max-width: 600px)": {
                left: "4vw",
                right: "4vw",
                width: "auto",
                bottom: 80,
                top: "auto",
                maxHeight: "70vh",
                transformOrigin: "bottom center",
              },
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "background.paper", // Changed from white
                borderBottom: "1px solid",
                borderColor: "divider", // Changed from #f0f0f0
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight="700" fontSize="1.1rem">
                {t("notificationsTitle")}
              </Typography>
              <Box>
                {notifications.length > 0 && (
                  <Tooltip title={t("deleteAllNotificationsTooltip")}>
                    <IconButton
                      size="small"
                      onClick={() => setConfirmDeleteOpen(true)}
                      color="error"
                    >
                      <DeleteSweepIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                overflow: "hidden",
                height: dynamicHeight,
                transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                flexGrow: 1,
              }}
            >
              <Box
                ref={contentRef}
                sx={{
                  overflowY: "auto",
                  maxHeight: 500,
                  minHeight: 200,
                }}
              >
                {loading ? (
                  <Stack spacing={2} sx={{ p: 2 }}>
                    {[1, 2, 3].map((i) => (
                      <Box key={i} sx={{ display: "flex", width: "100%" }}>
                        <Skeleton
                          variant="rectangular"
                          width={48}
                          height={48}
                          sx={{ mr: 2, borderRadius: 2 }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Skeleton
                            variant="text"
                            width="60%"
                            height={24}
                            sx={{ mb: 0.5 }}
                          />
                          <Skeleton variant="text" width="90%" height={20} />
                          <Skeleton variant="text" width="40%" height={16} />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : notifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center", opacity: 0.6 }}>
                    <NotificationsNoneIcon
                      sx={{ fontSize: 48, mb: 1, color: "text.disabled" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {t("noNewNotifications")}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {notifications.map((notif: any) => (
                      <SwipeableNotificationItem
                        key={notif._id}
                        notif={notif}
                        onDelete={(id: string) => handleDelete(id, null as any)}
                        onClick={() => handleNotificationClick(notif)}
                        setPreviewImage={setPreviewImage}
                      />
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </Paper>
        </Fade>
      </ClickAwayListener>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t("deleteAllNotificationsConfirmTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("deleteAllNotificationsConfirmBody")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleDeleteAll} color="error" autoFocus>
            {t("deleteAll")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => {
          // Delay closing to prevent ClickAwayListener from firing immediately
          // and closing the entire notification center because previewImage became null too fast.
          setTimeout(() => setPreviewImage(null), 0);
        }}
        maxWidth="md"
        fullWidth
        onClick={() => setTimeout(() => setPreviewImage(null), 0)}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
          },
        }}
      >
        <Box
          component="img"
          src={previewImage || undefined}
          sx={{
            width: "100%",
            height: "auto",
            maxHeight: "90vh",
            objectFit: "contain",
            cursor: "pointer",
          }}
        />
      </Dialog>
    </>
  );
}
