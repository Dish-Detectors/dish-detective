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
  CardMedia,
} from "@mui/material";
import { auth } from "@clerk/nextjs/server";
import { getRestaurantOffer } from "@/app/student/action";
import { getUserSubscriptions } from "@/actions/notification";
import StudentDishCard from "@/components/StudentDishCard";
import RestaurantMenuTabs from "@/components/RestaurantMenuTabs";
import Restaurant, { IRestaurant, IWorkingDay } from "@/models/Restaurant";
import Dish from "@/models/Dish";
import Allergen from "@/models/Allergen";
import Menu, { MenuItem } from "@/models/Menu";
import DishRating from "@/models/DishRating";
import dbConnect from "@/utils/dbConnect";
import NavigationIcon from "@mui/icons-material/Navigation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { getServerLang, tServer } from "@/utils/i18nServer";

export default async function RestaurantOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lang = await getServerLang();
  const days = await Promise.all([
    tServer("daySunday"),
    tServer("dayMonday"),
    tServer("dayTuesday"),
    tServer("dayWednesday"),
    tServer("dayThursday"),
    tServer("dayFriday"),
    tServer("daySaturday"),
  ]);
  const neverServedText = await tServer("neverServed");

  await dbConnect();
  // Cast to unknown first to avoid "neither type sufficiently overlaps" error
  const restaurant = (await Restaurant.findById(
    id,
  ).lean()) as unknown as IRestaurant;

  const offer = await getRestaurantOffer(id);
  const subscriptions = await getUserSubscriptions();

  // Fetch history for accurate "Last served"
  const restaurantMenus = await Menu.find({ restaurantId: id })
    .select("items")
    .lean();
  const menuItemIds = restaurantMenus.flatMap((m) => m.items);
  const historyData = await MenuItem.find({ _id: { $in: menuItemIds } }).lean();

  const lastServedMap = new Map<string, Date>();
  historyData.forEach((item) => {
    const dId = item.dishId.toString();
    if (!lastServedMap.has(dId) || item.lastServed > lastServedMap.get(dId)!) {
      lastServedMap.set(dId, item.lastServed);
    }
  });

  // Fetch all ratings for dishes in this restaurant - filtered by context
  const allAvailableDishIds = (restaurant?.availableDishes || []).map(
    (d: any) => d.toString(),
  );
  const ratingsData = await DishRating.aggregate([
    { $match: { dishId: { $in: allAvailableDishIds }, restaurantId: id } },
    {
      $group: {
        _id: "$dishId",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  const ratingsMap = new Map(
    ratingsData.map((r) => [
      r._id.toString(),
      { avg: r.avgRating, count: r.count },
    ]),
  );

  // Fetch current user's ratings
  const { userId } = await auth();
  let userRatingsMap = new Map<string, number>();
  if (userId) {
    const userRatings = await DishRating.find({
      dishId: { $in: allAvailableDishIds },
      restaurantId: id,
      userId,
    }).lean();
    userRatingsMap = new Map(
      userRatings.map((r) => [r.dishId.toString(), r.rating]),
    );
  }

  let otherDishes: any[] = [];
  if (
    restaurant &&
    restaurant.availableDishes &&
    restaurant.availableDishes.length > 0
  ) {
    const dishes = await Dish.find({ _id: { $in: restaurant.availableDishes } })
      .populate("allergens")
      .lean();
    const offerDishIds = new Set(
      offer.map((item: any) => item.dishId.toString()),
    );
    otherDishes = dishes.filter(
      (dish: any) => !offerDishIds.has(dish._id.toString()),
    );
  }

  if (!restaurant) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">{await tServer("restaurantNotFound")}</Typography>
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

  const todaysHours = restaurant.workingHours.find(
    (wh) => wh.day === currentDay,
  );
  let isOpen = false;
  if (todaysHours) {
    isOpen = todaysHours.shifts.some((shift) => {
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
          bgcolor: "background.paper", // Changed from "white"
          border: "1px solid",
          transition: "background-color 0.3s ease, color 0.3s ease",
          padding: 0, // Remove padding from Paper to let image stretch full width
          overflow: "hidden", // Ensure border radius clips image
        }}
      >
        <CardMedia
          component="img"
          image={restaurant.imageUrl || "/placeholder-restaurant.jpg"}
          alt={restaurant.name}
          sx={{
            width: "100%",
            height: { xs: 200, md: 300 },
            objectFit: "cover",
          }}
        />
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={4} alignItems="stretch">
            <Grid size={{ xs: 12, md: 7 }} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box>
                <Box
                  sx={{
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h3" fontWeight="800">
                    {restaurant.name}
                  </Typography>
                  <Chip
                    label={
                      isOpen
                        ? await tServer("openNow")
                        : await tServer("closedOutOfHours")
                    }
                    color={isOpen ? "success" : "error"}
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  mt: 3,
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid",
                  borderColor: "divider",
                  minHeight: 200,
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0, width: "100%", height: "100%" }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    restaurant.name + " " + restaurant.address,
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                ></iframe>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  bgcolor: "background.default", // Changed from "grey.50"
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "background-color 0.3s ease, color 0.3s ease",
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
                    {await tServer("workingHoursTitle")}
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
                        {days[wh.day]}
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
        </Box>
      </Paper>

      <RestaurantMenuTabs
        offer={offer.map((item: any) => ({
          ...item,
          isSubscribed: subscriptions.includes(item.dishId),
        }))}
        otherDishes={otherDishes.map((dish: any) => {
          const ratingInfo = ratingsMap.get(dish._id.toString()) || {
            avg: 0,
            count: 0,
          };
          return {
            dishId: dish._id.toString(),
            name: dish.name,
            description: dish.description,
            imageUrl: dish.imageUrl,
            allergens: dish.allergens?.map((a: any) => a.name) || [],
            lastServed: lastServedMap.has(dish._id.toString())
              ? lastServedMap
                .get(dish._id.toString())!
                .toLocaleDateString(lang === "HR" ? "hr-HR" : "en-GB")
              : neverServedText,
            rating: ratingInfo.avg,
            ratingCount: ratingInfo.count,
            userRating: userRatingsMap.get(dish._id.toString()) || 0,
            isSubscribed: subscriptions.includes(dish._id.toString()),
          };
        })}
        isOpen={isOpen}
        restaurantId={id}
        density="compact"
      />
    </Container >
  );
}
