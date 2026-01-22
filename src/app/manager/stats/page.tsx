"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Divider,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import DishCard from "@/components/DishCard";
import StatDishCard from "@/components/StatDishCard";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { getAllDishes, getManagerRestaurant } from "@/app/manager/menu/actions";
import { getSubscriptionCountsForMenuItems } from "@/app/manager/stats/actions";
import { BarChart } from "@mui/x-charts/BarChart";

type SortMode = "alpha" | "subcount";

type ManagerDish = {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  allergens: string[];
};

export default function ManagerStatsPage() {
  const [menzaId, setMenzaId] = useState<string | null>(null);
  const [dishes, setDishes] = useState<ManagerDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [subCounts, setSubCounts] = useState<Record<string, number>>({});

  const sortMenuOpen = Boolean(sortAnchorEl);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const restaurantRes = await getManagerRestaurant();
      const id = restaurantRes?.success
        ? (restaurantRes.data?._id as string)
        : "";
      const result = id ? ((await getAllDishes()) as ManagerDish[]) : [];

      // Fetch subscription counts (server placeholder for now)
      let counts: Record<string, number> = {};
      if (result.length > 0) {
        try {
          counts = await getSubscriptionCountsForMenuItems(
            result.map((d) => d._id),
          );
        } catch (err) {
          console.error("Failed to load subscription counts", err);
        }
      }

      if (cancelled) return;
      setMenzaId(id || null);
      setDishes(result);
      setSubCounts(counts);
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
      ? dishes.filter((d) => d.name.toLowerCase().includes(q))
      : dishes;

    const getSubCount = (dishId: string) => subCounts[dishId] ?? 0;

    const next = [...filtered];
    if (sortMode === "subcount") {
      next.sort((a, b) => {
        const diff = getSubCount(b._id) - getSubCount(a._id);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      });
      return next;
    }

    next.sort((a, b) => a.name.localeCompare(b.name));
    return next;
  }, [dishes, searchQuery, sortMode, subCounts]);

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        px: { xs: 3, sm: 5 },
        py: { xs: 3, sm: 5 },
        pt: 0,
        pb: { xs: "140px", sm: 8 },
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            justifySelf: "stretch",
            width: "100%",
            gap: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 780,
              color: "#212222",
              flexShrink: 0,
              lineHeight: 1.2,
            }}
          >
            Statistika
          </Typography>

          <IconButton
            aria-label="Sortiraj"
            aria-controls={sortMenuOpen ? "stats-sort-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={sortMenuOpen ? "true" : undefined}
            onClick={(e) => setSortAnchorEl(e.currentTarget)}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <SortIcon />
          </IconButton>
        </Box>

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
          placeholder="Pretraži jela..."
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

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "flex-end", sm: "flex-end" },
            justifySelf: { xs: "end", sm: "end" },
          }}
        >
          <IconButton
            aria-label="Sortiraj"
            aria-controls={sortMenuOpen ? "stats-sort-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={sortMenuOpen ? "true" : undefined}
            onClick={(e) => setSortAnchorEl(e.currentTarget)}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
            }}
          >
            <SortIcon />
          </IconButton>

          <Menu
            id="stats-sort-menu"
            anchorEl={sortAnchorEl}
            open={sortMenuOpen}
            onClose={() => setSortAnchorEl(null)}
            slotProps={{
              paper: {
                sx: { mt: 1, borderRadius: 2, minWidth: 220 },
              },
            }}
          >
            <MenuItem
              selected={sortMode === "alpha"}
              onClick={() => {
                setSortMode("alpha");
                setSortAnchorEl(null);
              }}
            >
              Abecedno
            </MenuItem>
            <MenuItem
              selected={sortMode === "subcount"}
              onClick={() => {
                setSortMode("subcount");
                setSortAnchorEl(null);
              }}
            >
              Po zainteresiranosti
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Divider sx={{ display: { xs: "none", sm: "block" }, mb: 4 }} />

      {loading
        ? null
        : menzaId &&
        dishes.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #e0e0e0",
              height: 350,
              width: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Zainteresiranost po jelima
            </Typography>
            <Box sx={{ width: "100%", height: 280 }}>
              <BarChart
                loading={loading}
                dataset={dishes
                  .map((d) => ({
                    name:
                      d.name.length > 20
                        ? `${d.name.substring(0, 17)}...`
                        : d.name,
                    count: subCounts[d._id] ?? 0,
                  }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10)}
                xAxis={[{ scaleType: "band", dataKey: "name" }]}
                series={[
                  {
                    dataKey: "count",
                    label: "Broj zainteresiranih",
                    color: "#1976d2",
                  },
                ]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                slotProps={{
                  legend: { hidden: true } as any,
                }}
              />
            </Box>
          </Paper>
        )}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pr: 1,
          pb: { xs: 0, sm: 4 },
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
              width: "100%",
              overflowX: "hidden",
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
                lg: "repeat(2, 1fr)",
                xl: "repeat(3, 1fr)",
              },
              gap: 2,
              pb: 2,
            }}
          >
            {sortedDishes.map((dish, index) => (
              <Box
                key={dish._id}
                sx={{
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.04}s forwards`,
                  "@keyframes fadeInUp": {
                    from: { opacity: 0, transform: "translateY(10px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <StatDishCard
                  name={dish.name}
                  imageUrl={dish.imageUrl}
                  count={subCounts[dish._id] ?? 0}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
