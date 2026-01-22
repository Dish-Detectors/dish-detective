"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Card,
  CardActionArea,
  CircularProgress,
  Stack,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { getAllDishes } from "@/app/admin/restaurants/edit/actions";

interface Dish {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
}

interface RestaurantDishSelectorProps {
  initialSelectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export default function RestaurantDishSelector({
  initialSelectedIds,
  onChange,
}: RestaurantDishSelectorProps) {
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds),
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDishes();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set(initialSelectedIds));
  }, [initialSelectedIds]);

  const loadDishes = async () => {
    setLoading(true);
    const res = await getAllDishes();
    if (res.success && res.data) {
      setAllDishes(res.data);
    }
    setLoading(false);
  };

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    onChange(Array.from(newSelected));
  };

  const filteredDishes = allDishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Pretraži jela prema nazivu..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr" }, // 1 col on md to fit in sidebar? Check layout
          gap: 2,
          maxHeight: 400,
          overflowY: "auto",
          pr: 1,
        }}
      >
        {filteredDishes.map((dish) => {
          const isSelected = selectedIds.has(dish._id);
          return (
            <Card
              key={dish._id}
              variant="outlined"
              sx={{
                borderColor: isSelected ? "primary.main" : "divider",
                bgcolor: isSelected ? "primary.50" : "white",
                transition: "all 0.2s",
              }}
            >
              <CardActionArea
                onClick={() => handleToggle(dish._id)}
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Avatar
                  src={dish.imageUrl}
                  sx={{ width: 48, height: 48, borderRadius: 2, mr: 2 }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap fontWeight="bold">
                    {dish.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    display="block"
                  >
                    {dish.description}
                  </Typography>
                </Box>
                {isSelected ? (
                  <CheckIcon color="primary" />
                ) : (
                  <AddIcon color="disabled" />
                )}
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Odabrano: {selectedIds.size} jela
      </Typography>
    </Box>
  );
}
