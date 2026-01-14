"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Divider,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DishCard from "@/components/DishCard";
import WorkerNavbar, { navWidth } from "@/components/WorkerNavbar";

interface Dish {
  _id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  allergens: string[];
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const dishes = useMemo<Dish[]>(
    () => [
      {
        _id: "placeholder-1",
        name: "Primjer jela 1",
        description: "Opis jela (placeholder) - ovdje će doći stvarni podaci.",
        category: "Kategorija",
        imageUrl: "",
        allergens: ["Gluten", "Jaja"],
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "placeholder-2",
        name: "Primjer jela 2",
        description: "Opis jela (placeholder) - ovdje će doći stvarni podaci.",
        category: "Kategorija",
        imageUrl: "",
        allergens: ["Mlijeko"],
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "placeholder-3",
        name: "Primjer jela 3",
        description: "Opis jela (placeholder) - ovdje će doći stvarni podaci.",
        category: "Kategorija",
        imageUrl: "",
        allergens: ["Gluten"],
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "placeholder-4",
        name: "Primjer jela 4",
        description: "Opis jela (placeholder) - ovdje će doći stvarni podaci.",
        category: "Kategorija",
        imageUrl: "",
        allergens: ["Jaja"],
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "placeholder-5",
        name: "Primjer jela 5",
        description: "Opis jela (placeholder) - ovdje će doći stvarni podaci.",
        category: "Kategorija",
        imageUrl: "",
        allergens: ["Mlijeko"],
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "placeholder-6",
        name: "Primjer jela 6",
        description: "Opis jela (placeholder) - ovdje će doći stvarni podaci.",
        category: "Kategorija",
        imageUrl: "",
        allergens: ["Gluten", "Mlijeko"],
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "placeholder-7",
        name: "Primjer jela 7",
        description: "Opis jela (placeholder) - ovdje će doći stvarni podaci.",
        category: "Kategorija",
        imageUrl: "",
        allergens: [],
        createdAt: "",
        updatedAt: "",
      },
    ],
    [],
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
          pb: isMobile ? 5 : 4,
        }}
      >
        {dishes.length === 0 ? (
          <Box
            sx={{
              bgcolor: "white",
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              maxWidth: { xs: "100%", sm: 600 },
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Nema jela
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
              pb: 2,
            }}
          >
            {/* Dodaj u ponudu */}
            <Paper
              role="button"
              tabIndex={0}
              onClick={() => setAddDialogOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setAddDialogOpen(true);
                }
              }}
              elevation={0}
              sx={{
                cursor: "pointer",
                borderRadius: 3,
                bgcolor: "white",
                border: "2px dashed #d0d0d0",
                transition: "all 0.2s ease-in-out",
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: isMobile ? 96 : 380,
                minHeight: isMobile ? 96 : 380,
                maxHeight: isMobile ? 96 : 380,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: 2,
                },
                "&:focus-visible": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 3px ${theme.palette.primary.light}`,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  px: 2,
                }}
              >
                <AddIcon
                  sx={{
                    fontSize: isMobile ? 50 : 128,
                    color: "grey.500",
                  }}
                />
                {!isMobile && (
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#212222",
                      textAlign: "center",
                    }}
                  >
                    Dodaj u ponudu
                  </Typography>
                )}
              </Box>
            </Paper>

            {dishes.map((dish, index) => (
              <Box
                key={dish._id}
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
                  restaurantName={dish.category}
                  position={dish.description}
                  imageUrl={dish.imageUrl}
                  allergens={dish.allergens}
                  onDelete={() => {
                    
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          aria-labelledby="add-to-offer-dialog-title"
        >
          <DialogTitle id="add-to-offer-dialog-title">
            Dodaj u ponudu
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ovdje će ići odabir jela i dodavanje u dnevnu ponudu.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)} autoFocus>
              Zatvori
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
