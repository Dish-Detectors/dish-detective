"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Divider,
  Typography,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DishCard from "@/components/DishCard";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { getManagerRestaurant } from "@/app/manager/menu/actions";
import { fetchAllDishesForMenza, WorkerMenuItem } from "@/app/worker/actions";

export default function ManagerStatsPage() {
  const [menzaId, setMenzaId] = useState<string | null>(null);
  const [dishes, setDishes] = useState<WorkerMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const restaurantRes = await getManagerRestaurant();
      const id = restaurantRes?.success ? (restaurantRes.data?._id as string) : "";
      const result = id ? await fetchAllDishesForMenza(id) : [];

      if (cancelled) return;
      setMenzaId(id || null);
      setDishes(result);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedDishes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? dishes.filter((d) =>
          `${d.name} ${d.category}`.toLowerCase().includes(q),
        )
      : dishes;

    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [dishes, searchQuery]);

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
        px: { xs: 3, sm: 5 },
        py: { xs: 3, sm: 5 },
        pt: 0,
        pb: { xs: "100px", sm: 6 },
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
          Statistika
        </Typography>

        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pretraži jela..."
          size="small"
          sx={{
            width: { xs: "100%", sm: 360, md: 520, lg: 640 },
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

        {/* right-side spacer to keep the search truly centered */}
        <Box sx={{ display: { xs: "none", sm: "block" } }} />
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: 1,
          pb: 4,
          scrollbarGutter: "stable",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <PancakeStackLoader />
          </Box>
        ) : !menzaId ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography color="text.secondary">
              Nije pronađena menza za ovog korisnika.
            </Typography>
          </Paper>
        ) : sortedDishes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography color="text.secondary">
              Trenutno nema jela u jelovniku.
            </Typography>
          </Paper>
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
              pb: 2,
            }}
          >
            {sortedDishes.map((dish, index) => (
              <Box
                key={dish.id}
                sx={{
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.06}s forwards`,
                  "@keyframes fadeInUp": {
                    from: { opacity: 0, transform: "translateY(20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <DishCard
                  name={dish.name}
                  restaurantName={dish.category}
                  position={dish.description}
                  imageUrl={dish.imageUrl}
                  allergens={dish.allergens}
                  showActions={false}
                  extraInfo={`Broj zainteresiranih: 0`}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
