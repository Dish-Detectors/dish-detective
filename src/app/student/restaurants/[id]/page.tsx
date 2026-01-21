import React from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  Button,
  Paper,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import { getRestaurantOffer } from "@/app/student/action";
import { getUserSubscriptions } from "@/actions/notification";
import StudentDishCard from "@/components/StudentDishCard";
import Restaurant, { IRestaurant, IWorkingDay } from "@/models/Restaurant";
import dbConnect from "@/utils/dbConnect";
import NavigationIcon from "@mui/icons-material/Navigation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const DAYS = [
  "Nedjelja",
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
];

export default async function RestaurantOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();
  // Cast to unknown first to avoid "neither type sufficiently overlaps" error
  const restaurant = (await Restaurant.findById(
    id,
  ).lean()) as unknown as IRestaurant;
  const offer = await getRestaurantOffer(id);
  const subscriptions = await getUserSubscriptions();

  if (!restaurant) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Restoran nije pronađen.</Typography>
      </Box>
    );
  }

  // Coordinates are [longitude, latitude]
  const [lng, lat] = restaurant.location.coordinates;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const sortWorkingHours = (hours: IWorkingDay[]) => {
    // Sort by day index, starting from Monday (1) to Sunday (0)
    // Actually standard compliant is 0-6 (Sun-Sat). Let's display Monday first usually?
    // User locale is Croatia likely, where Monday is first.
    // 1 (Mon), 2, 3, 4, 5, 6, 0 (Sun)
    return [...hours].sort((a, b) => {
      const dayA = a.day === 0 ? 7 : a.day;
      const dayB = b.day === 0 ? 7 : b.day;
      return dayA - dayB;
    });
  };

  const sortedSubHours = sortWorkingHours(restaurant.workingHours);

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 5,
          borderRadius: 4,
          bgcolor: "white",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Grid container spacing={4} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h3" fontWeight="800" gutterBottom>
              {restaurant.name}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 3 }}
            >
              <LocationOnIcon color="action" />
              <Typography variant="h6" color="text.secondary">
                {restaurant.address}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              size="large"
              startIcon={<NavigationIcon />}
              component="a"
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                px: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              Navigiraj
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                bgcolor: "grey.50",
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <AccessTimeIcon color="primary" />
                <Typography variant="h6" fontWeight="700">
                  Radno Vrijeme
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {sortedSubHours.map((wh) => (
                  <Box
                    key={wh.day}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.95rem",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      fontWeight={
                        new Date().getDay() === wh.day ? "bold" : "normal"
                      }
                    >
                      {DAYS[wh.day]}
                    </Typography>
                    <Typography
                      fontWeight={
                        new Date().getDay() === wh.day ? "bold" : "medium"
                      }
                      color={
                        new Date().getDay() === wh.day
                          ? "primary.main"
                          : "text.primary"
                      }
                    >
                      {wh.shifts.map((s) => `${s.start} - ${s.end}`).join(", ")}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Offer Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Trenutna ponuda
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pregledajte dostupna jela i pretplatite se na obavijesti.
        </Typography>
      </Box>

      {offer.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "grey.50",
            borderRadius: 4,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Trenutno nema dostupnih jela u ovom restoranu.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {offer.map((item: any) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={item.id}
              sx={{ display: "flex" }}
            >
              <StudentDishCard
                menuItemId={item.id}
                dishId={item.dishId}
                name={item.name}
                description={item.description}
                imageUrl={item.imageUrl}
                allergens={item.allergens}
                lastServed={item.lastServed}
                rating={item.rating}
                isInitiallySubscribed={subscriptions.includes(item.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
