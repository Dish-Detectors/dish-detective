"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    IconButton,
    Rating,
    Button,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { subscribeToDishTopic, unsubscribeFromDishTopic } from "@/utils/fcmClient";
import { toggleSubscription } from "@/actions/notification";

interface StudentDishCardProps {
    menuItemId: string;
    name: string;
    description: string;
    imageUrl: string;
    allergens: string[];
    lastServed: string;
    rating?: number;
    isInitiallySubscribed?: boolean;
}

export default function StudentDishCard({
    menuItemId,
    name,
    description,
    imageUrl,
    allergens,
    lastServed,
    rating = 0,
    isInitiallySubscribed = false,
}: StudentDishCardProps) {
    const [isSubscribed, setIsSubscribed] = useState(isInitiallySubscribed);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsSubscribed(isInitiallySubscribed);
    }, [isInitiallySubscribed]);

    const handleToggleSubscription = async () => {
        setLoading(true);
        let success = false;

        try {
            if (isSubscribed) {
                success = await unsubscribeFromDishTopic(menuItemId);
                if (success) {
                    const res = await toggleSubscription(menuItemId);
                    if (res.success) {
                        setIsSubscribed(false);
                    }
                }
            } else {
                success = await subscribeToDishTopic(menuItemId);
                if (success) {
                    const res = await toggleSubscription(menuItemId);
                    if (res.success) {
                        setIsSubscribed(true);
                    }
                }
            }
        } catch (error) {
            console.error("Subscription toggle failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            sx={{
                width: "100%",
                maxWidth: { xs: "none", sm: 400 },
                borderRadius: 4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                overflow: "hidden",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                },
            }}
        >
            <CardMedia
                component="img"
                height="200"
                image={imageUrl || "/placeholder-dish.jpg"}
                alt={name}
            />
            <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {name}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                    Sastojci: {description}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                    Allergeni: {allergens.join(", ") || "Nema"}
                </Typography>

                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Promjena statusa: {lastServed}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 2,
                    }}
                >
                    <Rating value={rating} readOnly size="small" />

                    <Button
                        onClick={handleToggleSubscription}
                        disabled={loading}
                        startIcon={
                            isSubscribed ? (
                                <NotificationsActiveIcon />
                            ) : (
                                <NotificationsNoneIcon />
                            )
                        }
                        sx={{
                            textTransform: "none",
                            color: isSubscribed ? "success.main" : "text.secondary",
                            "&:hover": {
                                bgcolor: "transparent",
                                color: isSubscribed ? "success.dark" : "primary.main",
                            },
                        }}
                    >
                        {isSubscribed ? "Ukloni" : "Pretplati se"}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
