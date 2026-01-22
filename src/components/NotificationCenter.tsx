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

export default function NotificationCenter({
  open,
  anchorEl,
  onClose,
  audience = "student",
  onRead,
}: NotificationCenterProps & { onRead?: () => void }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    } else {
      // When closing, check if there are unread notifications and mark them
      // Using ref to access latest state without adding dependency
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (!anchorEl) return null;

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    const target = event.target as Node | null;
    if (target && anchorEl.contains(target)) {
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

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Fade in={open} timeout={300}>
          <Paper
            elevation={6}
            sx={{
              position: "fixed",
              left: 90,
              bottom: 20,
              width: 380,
              maxHeight: 550,
              borderRadius: 4,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              zIndex: 1300,
              bgcolor: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              border: "1px solid rgba(0,0,0,0.04)",
              transformOrigin: "bottom left",
              "@media (max-width: 600px)": {
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 80,
                width: "92vw",
                transformOrigin: "bottom center",
              },
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "white",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight="700" fontSize="1.1rem">
                Obavijesti
              </Typography>
              <Box>
                {notifications.length > 0 && (
                  <Tooltip title="Obriši sve">
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
                overflowY: "auto",
                flexGrow: 1,
                minHeight: 200,
                maxHeight: 400,
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
                    Nema novih obavijesti.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {notifications.map((notif: any) => (
                    <ListItem
                      key={notif._id}
                      alignItems="flex-start"
                      sx={{
                        borderBottom: "1px solid #f5f5f5",
                        bgcolor: notif.read ? "white" : "#f0f7ff",
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: notif.read ? "#fafafa" : "#e6f2ff",
                        },
                        pr: 10, // Space for buttons
                        position: "relative",
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
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            objectFit: "cover",
                            mr: 2,
                            mt: 0.5,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            cursor: "pointer",
                            "&:hover": { opacity: 0.9 },
                          }}
                        />
                      )}

                      {/* Attachment Rendering */}
                      {notif.attachment && (
                        <Box sx={{ mr: 2, mt: 0.5 }}>
                          {notif.attachment.type.startsWith("image/") ? (
                            <Box
                              component="img"
                              src={notif.attachment.url}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setPreviewImage(notif.attachment?.url || null);
                              }}
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                objectFit: "cover",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                cursor: "pointer",
                                "&:hover": { opacity: 0.9 },
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
                                width: 48,
                                height: 48,
                                bgcolor: "grey.100",
                                borderRadius: 2,
                                "&:hover": { bgcolor: "grey.200" },
                              }}
                            >
                              <DownloadIcon color="action" />
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
                            fontWeight={notif.read ? 600 : 700}
                            color={notif.read ? "text.primary" : "primary.main"}
                          >
                            {notif.title || "Obavijest"}
                          </Typography>
                          {!notif.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                mt: 0.8,
                              }}
                            />
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5, lineHeight: 1.4 }}
                        >
                          {notif.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {new Date(notif.createdAt).toLocaleString("hr-HR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>

                        {notif.pollId && (
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              mt: 1,
                              display: "block",
                              borderRadius: 4,
                              textTransform: "none",
                              fontSize: "0.8rem",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/student/polls/${notif.pollId}`);
                              if (onClose) onClose();
                            }}
                          >
                            Ispuni anketu
                          </Button>
                        )}
                      </Box>

                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          display: "flex",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Obriši">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDelete(notif._id, e)}
                            sx={{
                              color: "text.disabled",
                              "&:hover": {
                                color: "error.main",
                                bgcolor: "error.lighter",
                              },
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
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
          {"Obriši sve obavijesti?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Jeste li sigurni da želite obrisati sve obavijesti? Ova radnja se ne
            može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Odustani</Button>
          <Button onClick={handleDeleteAll} color="error" autoFocus>
            Obriši sve
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
