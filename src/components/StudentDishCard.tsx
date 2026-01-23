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
  Divider,
  Chip,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useI18n } from "@/components/I18nProvider";
import {
  subscribeToDishTopic,
  unsubscribeFromDishTopic,
} from "@/utils/fcmClient";
import { toggleSubscription } from "@/actions/notification";
import { rateDish } from "@/app/student/action";

interface StudentDishCardProps {
  menuItemId?: string;
  dishId: string;
  name: string;
  description: string;
  imageUrl: string;
  allergens: string[];
  lastServed: string;
  rating?: number;
  ratingCount?: number;
  userRating?: number;
  isInitiallySubscribed?: boolean;
  isOffer?: boolean;
  restaurantId: string;
}

export default function StudentDishCard({
  menuItemId,
  dishId,
  name,
  description,
  imageUrl,
  allergens,
  lastServed,
  rating = 0,
  ratingCount = 0,
  userRating = 0,
  isInitiallySubscribed = false,
  isOffer = true,
  restaurantId,
}: StudentDishCardProps) {
  const { t } = useI18n();
  const [personalRating, setPersonalRating] = useState(userRating);
  const [isSubscribed, setIsSubscribed] = useState(isInitiallySubscribed);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSubscribed(isInitiallySubscribed);
  }, [isInitiallySubscribed]);

  useEffect(() => {
    setPersonalRating(userRating);
  }, [userRating]);

  const handleToggleSubscription = async () => {
    setLoading(true);
    let success = false;

    try {
      if (isSubscribed) {
        success = await unsubscribeFromDishTopic(dishId);
        if (success) {
          const res = await toggleSubscription(dishId);
          if (res.success) {
            setIsSubscribed(false);
          }
        }
      } else {
        success = await subscribeToDishTopic(dishId);
        if (success) {
          const res = await toggleSubscription(dishId);
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

  const handleRate = async (
    event: React.SyntheticEvent,
    newValue: number | null,
  ) => {
    if (newValue === null) return;
    const oldRating = personalRating;
    setPersonalRating(newValue);

    try {
      const result = await rateDish({ dishId, restaurantId, rating: newValue });
      if (!result.success) {
        console.error(result.message);
        setPersonalRating(oldRating);
      }
    } catch (error) {
      console.error("Failed to rate dish:", error);
      setPersonalRating(oldRating);
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
        transition:
          "transform 0.2s ease-in-out, background-color 0.3s ease, color 0.3s ease",
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 0.5,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {name}
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
          >
            <Rating value={rating} readOnly size="small" precision={0.1} />
            {ratingCount > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
              >
                {rating.toFixed(1)} ({ratingCount})
              </Typography>
            )}
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.5, minHeight: "3em" }} // Allow some space for description
        >
          {description}
        </Typography>

        {/* Allergens: Styled as Chips */}
        <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 0.8 }}>
          {allergens.length > 0 ? (
            allergens.map((allergen) => (
              <Chip
                key={allergen}
                label={allergen}
                size="small"
                variant="outlined"
                icon={<WarningAmberIcon sx={{ fontSize: "14px !important" }} />}
                sx={{
                  height: "24px",
                  fontSize: "0.7rem",
                  borderColor: "warning.light",
                  color: "warning.dark",
                  bgcolor: "warning.50",
                  "& .MuiChip-icon": { color: "warning.main", ml: 0.5 },
                }}
              />
            ))
          ) : (
            <Typography variant="caption" color="text.disabled">
              {t("noAllergens")}
            </Typography>
          )}
        </Box>

        {/* Availability Info Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.secondary",
            bgcolor: "action.hover", // Changed from grey.100
            py: 0.8,
            px: 1.5,
            borderRadius: 1.5,
            width: "fit-content",
          }}
        >
          <ScheduleIcon sx={{ fontSize: 18, color: "primary.main" }} />
          <Typography variant="caption" fontWeight="700">
            {isOffer
              ? t("availableFromWithDate", { date: lastServed })
              : t("lastAvailableWithDate", { date: lastServed })}
          </Typography>
        </Box>

        {/* Action Box: Streamlined interactive elements */}
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: 3,
            bgcolor: "background.default", // Changed from grey.50 for better theme support
            border: "1px solid",
            borderColor: "divider", // Changed from grey.200
            display: "flex",
            flexDirection: "column",
            gap: 2,
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}
        >
          {isOffer && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Rating
                  value={personalRating}
                  onChange={handleRate}
                  size="large"
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "primary.main",
                    },
                  }}
                />
              </Box>
              <Divider sx={{ opacity: 0.4 }} />
            </>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={handleToggleSubscription}
              disabled={loading}
              fullWidth
              variant={isSubscribed ? "contained" : "outlined"}
              color={isSubscribed ? "error" : "primary"}
              startIcon={
                isSubscribed ? (
                  <NotificationsActiveIcon
                    sx={{ fontSize: "1.5rem !important" }}
                  />
                ) : (
                  <NotificationsNoneIcon
                    sx={{ fontSize: "1.5rem !important" }}
                  />
                )
              }
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                py: 1,
                boxShadow: isSubscribed
                  ? "0 4px 12px rgba(211, 47, 47, 0.15)"
                  : "none",
              }}
            >
              {isSubscribed ? t("unsubscribe") : t("subscribe")}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
