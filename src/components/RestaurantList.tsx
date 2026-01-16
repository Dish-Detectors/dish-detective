"use client";

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { IRestaurant } from "@/models/Restaurant";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";

interface RestaurantListProps {
  restaurants: IRestaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <Stack
      spacing={2}
      sx={{
        py: 2,
      }}
    >
      {restaurants.map((restaurant) => (
        <Card
          key={restaurant._id as string}
          sx={{
            display: "flex",
            p: 1,
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            },
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: 100,
              height: 100,
              borderRadius: 3,
              objectFit: "cover",
            }}
            image={restaurant.imageUrl}
            alt={restaurant.name}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              ml: 1,
            }}
          >
            <CardContent sx={{ flex: "1 0 auto", p: 1, pb: "0 !important" }}>
              <Typography component="div" variant="subtitle1" fontWeight="bold">
                {restaurant.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
                sx={{ mb: 1 }}
              >
                {restaurant.address}
              </Typography>
              <Button
                component={Link}
                href={`/student/restaurants/${restaurant._id}`}
                size="small"
                endIcon={
                  <ArrowForwardIcon sx={{ fontSize: "1rem !important" }} />
                }
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                  p: 0,
                  minWidth: 0,
                  "&:hover": {
                    bgcolor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                Pregledaj ponudu
              </Button>
            </CardContent>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}
