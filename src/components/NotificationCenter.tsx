"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { getAllStudentNotifications, deleteNotification } from "@/actions/notification";
import { INotification } from "@/models/Notification";

interface NotificationCenterProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export default function NotificationCenter({
    open,
    anchorEl,
    onClose,
}: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadNotifications();
        }
    }, [open]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await getAllStudentNotifications();
            // Ensure we treat the returning data as INotification[]
            setNotifications(data as any);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteNotification(id);
            if (res.success) {
                setNotifications((prev) => prev.filter((n) => (n as any)._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    if (!open || !anchorEl) return null;

    return (
        <ClickAwayListener onClickAway={onClose}>
            <Fade in={open}>
                <Paper
                    elevation={4}
                    sx={{
                        position: "fixed",
                        left: 90, // Positioned next to the desktop navbar
                        bottom: 20,
                        width: 350,
                        maxHeight: 500,
                        borderRadius: 3,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 1300,
                        // Handle mobile positioning
                        "@media (max-width: 600px)": {
                            left: "50%",
                            transform: "translateX(-50%)",
                            bottom: 80,
                            width: "90vw",
                        }
                    }}
                >
                    <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
                        <Typography variant="h6" fontWeight="bold">
                            Obavijesti
                        </Typography>
                    </Box>

                    <Box sx={{ overflowY: "auto", flexGrow: 1, p: 1, minHeight: 100 }}>
                        {loading ? (
                            <Box sx={{ p: 2, textAlign: "center" }}>
                                <Typography variant="body2" color="text.secondary">Učitavanje...</Typography>
                            </Box>
                        ) : notifications.length === 0 ? (
                            <Box sx={{ p: 2, textAlign: "center" }}>
                                <Typography variant="body2" color="text.secondary">Nema novih obavijesti.</Typography>
                            </Box>
                        ) : (
                            <List sx={{ pt: 0 }}>
                                {notifications.map((notif: any) => (
                                    <ListItem
                                        key={notif._id}
                                        sx={{
                                            mb: 1,
                                            borderRadius: 2,
                                            border: "1px solid #eee",
                                            "&:hover": { bgcolor: "#fafafa" },
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 1,
                                            p: 1.5
                                        }}
                                    >
                                        {notif.imageUrl && (
                                            <Box
                                                component="img"
                                                src={notif.imageUrl}
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 1,
                                                    objectFit: "cover",
                                                    mt: 0.5
                                                }}
                                            />
                                        )}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {notif.title || "Obavijest"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {notif.description}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                                                {new Date(notif.createdAt).toLocaleString("hr-HR", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(notif._id)}
                                            sx={{ mt: -0.5, mr: -0.5, color: "text.secondary" }}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Paper>
            </Fade>
        </ClickAwayListener>
    );
}
