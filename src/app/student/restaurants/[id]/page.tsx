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
import RestaurantMenuTabs from "@/components/RestaurantMenuTabs";
import Restaurant, { IRestaurant, IWorkingDay } from "@/models/Restaurant";
import Dish from "@/models/Dish";
import Menu, { MenuItem } from "@/models/Menu";
import DishRating from "@/models/DishRating";
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

  // Fetch history for accurate "Last served"
  const restaurantMenus = await Menu.find({ restaurantId: id }).select("items").lean();
  const menuItemIds = restaurantMenus.flatMap(m => m.items);
  const historyData = await MenuItem.find({ _id: { $in: menuItemIds } }).lean();

  const lastServedMap = new Map<string, Date>();
  historyData.forEach(item => {
    const dId = item.dishId.toString();
    if (!lastServedMap.has(dId) || item.lastServed > lastServedMap.get(dId)!) {
      lastServedMap.set(dId, item.lastServed);
    }
  });

  // Fetch all ratings for dishes in this restaurant
  const allAvailableDishIds = (restaurant?.availableDishes || []).map((d: any) => d.toString());
  const ratingsData = await DishRating.aggregate([
    { $match: { dishId: { $in: allAvailableDishIds } } },
    {
      $group: {
        _id: "$dishId",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  const ratingsMap = new Map(ratingsData.map(r => [r._id.toString(), r.avgRating]));

  let otherDishes: any[] = [];
  if (restaurant && restaurant.availableDishes && restaurant.availableDishes.length > 0) {
    const dishes = await Dish.find({ _id: { $in: restaurant.availableDishes } })
      .populate("allergens")
      .lean();
    const offerDishIds = new Set(offer.map((item: any) => item.dishId.toString()));
    otherDishes = dishes.filter((dish: any) => !offerDishIds.has(dish._id.toString()));
  }

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

  // Check if restaurant is currently open
  const now = new Date();
  const currentDay = now.getDay(); // 0-6
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todaysHours = restaurant.workingHours.find(wh => wh.day === currentDay);
  let isOpen = false;
  if (todaysHours) {
    isOpen = todaysHours.shifts.some(shift => {
      const [startH, startM] = shift.start.split(":").map(Number);
      const [endH, endM] = shift.end.split(":").map(Number);
      const startTime = startH * 60 + startM;
      const endTime = endH * 60 + endM;
      return currentTime >= startTime && currentTime <= endTime;
    });
  }

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
            <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Typography variant="h3" fontWeight="800">
                {restaurant.name}
              </Typography>
              <Chip
                label={isOpen ? "OTVORENO" : "ZATVORENO - Van radnog vremena"}
                color={isOpen ? "success" : "error"}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            </Box>
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

      <RestaurantMenuTabs
        offer={offer.map((item: any) => ({
          ...item,
          rating: ratingsMap.get(item.dishId) || 0,
          isSubscribed: subscriptions.includes(item.dishId),
        }))}
        otherDishes={otherDishes.map((dish: any) => ({
          dishId: dish._id.toString(),
          name: dish.name,
          description: dish.description,
          imageUrl: dish.imageUrl,
          allergens: dish.allergens?.map((a: any) => a.name) || [],
          lastServed: lastServedMap.has(dish._id.toString())
            ? lastServedMap.get(dish._id.toString())!.toLocaleDateString("hr-HR")
            : "Nikada do sada",
          rating: ratingsMap.get(dish._id.toString()) || 0,
          isSubscribed: subscriptions.includes(dish._id.toString()),
        }))}
        isOpen={isOpen}
      />
    </Container>
  );
}
