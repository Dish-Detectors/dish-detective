"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import WorkerNavbar, { navWidth } from "@/components/WorkerNavbar";
import DishCard from "@/components/DishCard";
import {
  MenuItem,
  getWorkerMenzaId,
  fetchAllDishesForMenza,
  fetchTodaysOfferDishIdsForMenza,
  addDishToTodaysOffer,
} from "../actions";
import PancakeStackLoader from "@/components/PancakeStackLoader";

export default function Page() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [menzaId, setMenzaId] = useState<string | null>(null);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [todaysOfferDishIds, setTodaysOfferDishIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const todaysOfferDishIdSet = useMemo(
    () => new Set(todaysOfferDishIds),
    [todaysOfferDishIds]
  );

  const sortedDishes = useMemo(() => {
    return [...dishes].sort((a, b) => {
      const aInOffer = todaysOfferDishIdSet.has(a.id) ? 1 : 0;
      const bInOffer = todaysOfferDishIdSet.has(b.id) ? 1 : 0;

      if (aInOffer !== bInOffer) return aInOffer - bInOffer;
      return a.name.localeCompare(b.name);
    });
  }, [dishes, todaysOfferDishIdSet]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const id = await getWorkerMenzaId();
      const [allDishes, offerIds] = await Promise.all([
        fetchAllDishesForMenza(id),
        fetchTodaysOfferDishIdsForMenza(id),
      ]);

      if (cancelled) return;
      setMenzaId(id);
      setDishes(allDishes);
      setTodaysOfferDishIds(offerIds);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <WorkerNavbar isMobile={isMobile} />
      <Box
        sx={{
          height: "100vh",
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          px: { xs: 3, sm: 5 },
          py: { xs: 3, sm: 5 },
          pt: 0,
          pb: { xs: "100px", sm: 6 },
          ml: isMobile ? 0 : `${navWidth}px`,
          width: isMobile ? "100%" : `calc(100% - ${navWidth}px)`,
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 780,
            mb: 2,
            color: "#212222",
            flexShrink: 0,
          }}
        >
          Dodaj u ponudu
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            pb: isMobile ? 6 : 4,
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
          ) : sortedDishes.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
                Nema dostupnih jela za ovu menzu.
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
              {sortedDishes.map((dish, index) => {
                const isAlreadyInOffer = todaysOfferDishIdSet.has(dish.id);

                return (
                  <Box
                    key={dish.id}
                    sx={{
                      opacity: 0,
                      animation: `fadeInUp 0.6s ease-out ${(index + 1) * 0.06}s forwards`,
                      "@keyframes fadeInUp": {
                        from: { opacity: 0, transform: "translateY(20px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        opacity: isAlreadyInOffer ? 0.55 : 1,
                        filter: isAlreadyInOffer ? "grayscale(1)" : "none",
                        transition: "opacity 0.15s ease, filter 0.15s ease",
                      }}
                    >
                      <DishCard
                        name={dish.name}
                        restaurantName={dish.category}
                        position={dish.description ?? "Opis jela (placeholder)"}
                        imageUrl={dish.imageUrl}
                        allergens={dish.allergens ?? []}
                        actionMode="add"
                        actionDisabled={isAlreadyInOffer}
                        onDelete={() => {
                          if (isAlreadyInOffer) return;
                          if (!menzaId) return;

                          const addedId = dish.id;

                          // Optimistic UI update: immediately grey out / disable the card
                          setTodaysOfferDishIds((prev) =>
                            prev.includes(addedId) ? prev : [...prev, addedId]
                          );

                          void addDishToTodaysOffer({
                            menuItemId: addedId,
                            updateDate: new Date(),
                          }).catch(async (err: any) => {
                            console.error(
                              "Failed to add dish to today's offer",
                              err
                            );
                            // Fallback: refresh from server to keep UI consistent
                            const refreshed =
                              await fetchTodaysOfferDishIdsForMenza(menzaId);
                            setTodaysOfferDishIds(refreshed);
                          });
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
