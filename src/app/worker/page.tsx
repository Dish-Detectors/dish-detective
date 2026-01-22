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
  removeDishFromTodaysOffer,
} from "./actions";
import PancakeStackLoader from "@/components/PancakeStackLoader";

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
              {/* Dodaj u ponudu */}
              <Paper
                role="button"
                tabIndex={0}
                onClick={() => router.push("/worker/add")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push("/worker/add");
                  }
                }}
                elevation={0}
                sx={{
                  cursor: "pointer",
                  borderRadius: 4,
                  bgcolor: "rgba(25, 118, 210, 0.04)",
                  border: "2px dashed",
                  borderColor: "primary.light",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: isMobile ? 96 : 417,
                  minHeight: isMobile ? 96 : 417,
                  maxHeight: isMobile ? 96 : 420,
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "rgba(25, 118, 210, 0.08)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px -10px rgba(0,0,0,0.15)",
                    "& .add-icon": {
                      transform: "scale(1.1) rotate(90deg)",
                      color: "primary.main",
                    },
                    "& .add-text": {
                      color: "primary.main",
                    }
                  },
                  "&:active": {
                    transform: "translateY(0) scale(0.98)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    px: 3,
                  }}
                >
                  <AddIcon
                    className="add-icon"
                    sx={{
                      fontSize: isMobile ? 32 : 80,
                      color: "primary.light",
                      transition: "all 0.3s ease",
                    }}
                  />
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    className="add-text"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Dodaj u ponudu
                  </Typography>
                </Box>
              </Paper>

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
                    onDelete={() => {
                      if (!menzaId) return;
                      const removedId = dish.id;

                      // Optimistic UI update
                      setDishes((prev) =>
                        prev.filter((d) => d.id !== removedId),
                      );

                      void removeDishFromTodaysOffer({
                        menuItemId: removedId,
                        updateDate: new Date(),
                      }).catch(async (err: any) => {
                        console.error(
                          "Failed to remove dish from today's offer",
                          err,
                        );
                        // Fallback: refresh from server to keep UI consistent
                        const refreshed =
                          await fetchTodaysOfferForMenza(menzaId);
                        setDishes(refreshed);
                      });
                    }}
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
