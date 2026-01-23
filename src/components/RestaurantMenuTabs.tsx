"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, Grid } from "@mui/material";
import StudentDishCard from "@/components/StudentDishCard";

interface DishData {
  id?: string; // menuItemId for offer, potentially undefined for others
  dishId: string;
  name: string;
  description: string;
  imageUrl: string;
  allergens: string[];
  lastServed: string;
  rating?: number;
  ratingCount?: number;
  userRating?: number;
  available?: boolean;
  isSubscribed: boolean;
}

interface RestaurantMenuTabsProps {
  offer: DishData[];
  otherDishes: DishData[];
  isOpen: boolean;
  restaurantId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ display: value === index ? "block" : "none" }}
    >
      <Box sx={{ py: 3 }}>{children}</Box>
    </div>
  );
}

export default function RestaurantMenuTabs({
  offer,
  otherDishes,
  isOpen,
  restaurantId,
}: RestaurantMenuTabsProps) {
  const [value, setValue] = useState(isOpen ? 0 : 1);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const renderDishGrid = (
    dishes: DishData[],
    emptyMessage: string,
    isOffer: boolean,
  ) => {
    if (!isOpen && isOffer) {
      return (
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
          <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
            Van radnog vremena
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Trenutna ponuda nije dostupna jer restoran ne radi.
          </Typography>
        </Box>
      );
    }

    if (dishes.length === 0) {
      return (
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
            {emptyMessage}
          </Typography>
        </Box>
      );
    }
    return (
      <Grid container spacing={3}>
        {dishes.map((item) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={item.id || item.dishId} // Prefer unique menuItemId if available, else dishId
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
              ratingCount={item.ratingCount}
              userRating={item.userRating}
              isInitiallySubscribed={item.isSubscribed}
              isOffer={isOffer}
              restaurantId={restaurantId}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="restaurant menu tabs"
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label="Trenutna ponuda"
            disabled={!isOpen}
            sx={{ textTransform: "none", fontSize: "1.1rem", fontWeight: 600 }}
          />
          <Tab
            label="Sva jela"
            sx={{ textTransform: "none", fontSize: "1.1rem", fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {!isOpen && value === 0 && (
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            bgcolor: "error.light",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            color="error.contrastText"
            sx={{ fontWeight: 600 }}
          >
            RESTOREAN JE TRENUTNO ZATVOREN - Van radnog vremena
          </Typography>
        </Box>
      )}

      <CustomTabPanel value={value} index={0}>
        {renderDishGrid(
          offer,
          "Trenutno nema dostupnih jela u ovom restoranu.",
          true,
        )}
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        {renderDishGrid(otherDishes, "Nema ostalih jela.", false)}
      </CustomTabPanel>
    </Box>
  );
}
