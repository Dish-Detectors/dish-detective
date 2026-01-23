"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DishCard from "@/components/DishCard";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { useI18n } from "@/components/I18nProvider";
import {
  getManagerRestaurant,
  getRestaurantAvailableDishes,
  getTodayMenu,
  addDishToMenu,
  removeDishFromMenu,
} from "./actions";

interface Dish {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  allergens: string[];
}

interface MenuItem {
  menuItemId: string;
  dish: Partial<Dish> & { _id: string; name: string; imageUrl: string };
  available: boolean;
}

export default function DailyMenuPage() {
  const { t } = useI18n();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const restaurantRes = await getManagerRestaurant();
      if (restaurantRes.success && restaurantRes.data) {
        setRestaurantId(restaurantRes.data._id);
        const [dishes, menu] = await Promise.all([
          getRestaurantAvailableDishes(restaurantRes.data._id),
          getTodayMenu(restaurantRes.data._id),
        ]);
        setAllDishes(dishes as Dish[]);
        setMenuItems(menu);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDish = async (dish: Dish) => {
    if (!restaurantId) return;
    setActionInProgress(dish._id);
    try {
      const res = await addDishToMenu(restaurantId, dish._id);
      if (res.success) {
        setMenuItems((prev) => [
          ...prev,
          {
            menuItemId: res.menuItemId!,
            dish: {
              _id: dish._id,
              name: dish.name,
              imageUrl: dish.imageUrl,
            },
            available: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to add dish", error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemoveDish = async (menuItemId: string) => {
    setActionInProgress(menuItemId);
    try {
      const res = await removeDishFromMenu(menuItemId);
      if (res.success) {
        setMenuItems((prev) => prev.filter((m) => m.menuItemId !== menuItemId));
      }
    } catch (error) {
      console.error("Failed to remove dish", error);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredAvailableDishes = allDishes
    .filter((dish) => !menuItems.some((m) => m.dish._id === dish._id))
    .filter((dish) =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <PancakeStackLoader />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        px: { xs: 3, sm: 5 },
        py: { xs: 3, sm: 5 },
        pt: 0,
        pb: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
          alignItems: "center",
          columnGap: 3,
          rowGap: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 780,
            color: "#212222",
            flexShrink: 0,
            lineHeight: 1.2,
            justifySelf: "start",
          }}
        >
          {t("createDailyMenuTitle")}
        </Typography>

        <Divider
          sx={{
            display: { xs: "block", sm: "none" },
            mb: 1,
            borderBottomWidth: 2,
          }}
        />

        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchDishesToAddPlaceholder")}
          size="small"
          sx={{
            width: { xs: "100%", sm: 340, md: 440, lg: 520 },
            maxWidth: "100%",
            justifySelf: { xs: "stretch", sm: "center" },
            bgcolor: "white",
            borderRadius: 999,
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              "& fieldset": {
                borderColor: "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#999" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: { xs: "none", sm: "block" } }} />
      </Box>

      <Divider sx={{ display: { xs: "none", sm: "block" }, mb: 4 }} />

      <Box
        sx={{ flex: 1, overflowY: "auto", pr: 1, scrollbarGutter: "stable" }}
      >
        {/* Današnji Meni Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#444" }}>
          {t("todaysMenuWithCount", { count: menuItems.length })}
        </Typography>
        {menuItems.length === 0 ? (
          <Box sx={{ bgcolor: "white", p: 3, borderRadius: 3, mb: 4 }}>
            <Typography color="text.secondary">
              {t("noDishesInTodaysMenu")}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
              mb: 6,
            }}
          >
            {menuItems.map((item) => (
              <DishCard
                key={item.menuItemId}
                name={item.dish.name}
                position=""
                imageUrl={item.dish.imageUrl}
                onDelete={() => handleRemoveDish(item.menuItemId)}
                actionMode="delete"
                actionDisabled={actionInProgress === item.menuItemId}
                extraInfo={
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: item.available ? "success.main" : "error.main",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.available ? t("available") : t("unavailable")}
                  </Typography>
                }
              />
            ))}
          </Box>
        )}

        <Divider sx={{ mb: 4 }} />

        {/* Dostupna Jela Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#444" }}>
          {t("addDishesToMenuTitle")}
        </Typography>

        {filteredAvailableDishes.length === 0 ? (
          <Box sx={{ bgcolor: "white", p: 3, borderRadius: 3 }}>
            <Typography color="text.secondary">
              {searchQuery ? t("noSearchResults") : t("allDishesAlreadyInMenu")}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
              pb: { xs: 6, sm: 8 },
            }}
          >
            {filteredAvailableDishes.map((dish, index) => (
              <Box
                key={dish._id}
                sx={{
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                  "@keyframes fadeInUp": {
                    from: { opacity: 0, transform: "translateY(20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <DishCard
                  name={dish.name}
                  position={dish.description}
                  imageUrl={dish.imageUrl}
                  onDelete={() => handleAddDish(dish)}
                  actionMode="add"
                  actionDisabled={actionInProgress === dish._id}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
