"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Divider,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DishCard from "@/components/DishCard";
import WorkerNavbar, { navWidth } from "@/components/WorkerNavbar";
import {
  WorkerMenuItem,
  getWorkerMenzaId,
  fetchTodaysOfferForMenza,
  toggleDishAvailability,
} from "./actions";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { FormControlLabel, Switch } from "@mui/material";

export default function Page() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const [menzaId, setMenzaId] = useState<string | null>(null);
  const [dishes, setDishes] = useState<WorkerMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const id = await getWorkerMenzaId();
      const result = await fetchTodaysOfferForMenza(id);
      if (cancelled) return;
      setMenzaId(id);
      setDishes(result);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedDishes = useMemo(
    () => [...dishes].sort((a, b) => a.name.localeCompare(b.name)),
    [dishes],
  );

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
          Ponuda dana
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            pt: 1,
            pb: isMobile ? 5 : 4,
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
                    animation: `fadeInUp 0.6s ease-out ${(index + 1) * 0.06}s forwards`,
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
                    allergens={dish.allergens}
                    showActions={false}
                    extraInfo={
                      <FormControlLabel
                        control={
                          <Switch
                            checked={dish.available}
                            onChange={async (e) => {
                              const newAvailable = e.target.checked;
                              // Optimistic UI update
                              setDishes((prev) =>
                                prev.map((d) =>
                                  d.id === dish.id
                                    ? { ...d, available: newAvailable }
                                    : d,
                                ),
                              );

                              try {
                                await toggleDishAvailability({
                                  menuItemId: dish.id,
                                  available: newAvailable,
                                  updateDate: new Date(),
                                });
                              } catch (err) {
                                console.error("Toggle failed", err);
                                if (menzaId) {
                                  const result =
                                    await fetchTodaysOfferForMenza(menzaId);
                                  setDishes(result);
                                }
                              }
                            }}
                            color="primary"
                          />
                        }
                        label={dish.available ? "Dostupno" : "Nedostupno"}
                        sx={{
                          m: 0,
                          "& .MuiTypography-root": {
                            fontWeight: 700,
                            color: dish.available
                              ? "success.main"
                              : "text.secondary",
                          },
                        }}
                      />
                    }
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
