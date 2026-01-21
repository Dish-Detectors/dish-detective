"use client";

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  CardActionArea,
  Chip,
} from "@mui/material";
import { IRestaurant } from "@/models/Restaurant";
import Link from "next/link";
import { getRestaurantStatus, getWorkingHoursString } from "@/utils/time";

interface RestaurantListProps {
  restaurants: IRestaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr", // On small tablets 1 column might be safer for "wide" preference
          md: "repeat(2, 1fr)", // 2 columns on medium screens
          lg: "repeat(3, 1fr)", // 3 columns on large screens (1200px / 3 = ~400px)
        },
        gap: 3,
        py: 2,
      }}
    >
      {restaurants.map((restaurant) => {
        const { status, message, isToday } = getRestaurantStatus(
          restaurant.workingHours || [],
        );
        const workingHoursString = getWorkingHoursString(
          restaurant.workingHours || [],
        );

        let statusColor: "success" | "error" | "warning" | "default" =
          "default";
        if (status === "open") statusColor = "success";
        if (status === "closed") statusColor = "error";
        if (status === "closing_soon" || status === "opening_soon")
          statusColor = "warning";

        return (
          <Card
            key={restaurant._id as string}
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "visible",
              bgcolor: "transparent",
              height: "100%",
            }}
          >
            <CardActionArea
              component={Link}
              href={`/student/restaurants/${restaurant._id}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
                overflow: "hidden",
                height: "100%",
              }}
            >
              {/* Row 1: Image and Info */}
              <Box sx={{ display: "flex", p: 2, pb: 0 }}>
                {/* Image Section */}
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 3,
                    overflow: "hidden",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    image={restaurant.imageUrl}
                    alt={restaurant.name}
                  />
                </Box>

                {/* Info Section */}
                <Box
                  sx={{
                    ml: 2,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="800"
                    sx={{ lineHeight: 1.2, mb: 0.5 }}
                  >
                    {restaurant.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.3 }}
                  >
                    {restaurant.address}
                  </Typography>
                </Box>
              </Box>

              {/* Row 2: Status and Hours */}
              <CardContent sx={{ pt: 2, pb: "16px !important", px: 2 }}>
                <Box
                  sx={{
                    pt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip
                      label={
                        status === "open"
                          ? "Otvoreno"
                          : status === "closed"
                            ? "Zatvoreno"
                            : status === "closing_soon"
                              ? "Zatvara se uskoro"
                              : "Otvara se uskoro"
                      }
                      color={statusColor}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        height: 24,
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color={
                        statusColor === "default"
                          ? "text.primary"
                          : `${statusColor}.main`
                      }
                    >
                      {message}
                    </Typography>
                  </Box>

                  {isToday && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      Danas: {workingHoursString}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}
