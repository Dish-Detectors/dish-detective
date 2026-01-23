"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import RestaurantCard from "@/components/RestaurantCard";
import { getAllRestaurants, deleteRestaurant } from "./actions";
import { useI18n } from "@/components/I18nProvider";

export default function RestaurantsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const response = await getAllRestaurants();
      if (response.success && response.data) {
        setRestaurants(response.data);
      }
    } catch (error) {
      console.error("Failed to load restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    router.push("/admin/restaurants/create");
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/restaurants/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setRestaurantToDelete(id);
    setConfirmationName("");
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!restaurantToDelete) return;
    setDeleting(true);

    try {
      const response = await deleteRestaurant(restaurantToDelete);
      if (response.success) {
        setRestaurants((prev) =>
          prev.filter((r) => r._id !== restaurantToDelete),
        );
        setDeleteDialogOpen(false);
        setRestaurantToDelete(null);
      } else {
        alert(response.message || t("deleteFailed"));
      }
    } catch (err) {
      console.error(err);
      alert(t("deleteFailed"));
    }
    setDeleting(false);
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const query = searchQuery.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.address.toLowerCase().includes(query)
    );
  });

  const restaurantName =
    restaurants.find((r) => r._id === restaurantToDelete)?.name || "";

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
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
        height: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        px: { xs: 3, sm: 5 },
        py: { xs: 3, sm: 5 },
        pt: 0,
        pb: { xs: 12, sm: 10 },
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 780, mb: 4, color: "#212222", flexShrink: 0 }}
      >
        {t("manageRestaurantsTitle")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          maxWidth: { xs: "100%", sm: 600 },
          flexShrink: 0,
        }}
      >
        <TextField
          fullWidth
          placeholder={t("searchRestaurantsPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#999" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            bgcolor: "white",
            borderRadius: 10,
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              "& fieldset": { borderColor: "#e0e0e0" },
            },
          }}
        />
        <IconButton
          onClick={handleAddNew}
          sx={{
            bgcolor: "white",
            border: "1px solid #e0e0e0",
            width: 56,
            height: 56,
            borderRadius: "50%",
            "&:hover": { bgcolor: "#e0e0e0" },
          }}
          aria-label={t("create")}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
        {filteredRestaurants.length === 0 ? (
          <Box
            sx={{
              bgcolor: "white",
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              maxWidth: 600,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {searchQuery ? t("noSearchResults") : t("noRestaurants")}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: 3,
              pt: 1,
              pb: 8,
            }}
          >
            {filteredRestaurants.map((restaurant, index) => (
              <Box
                key={restaurant._id}
                sx={{
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                  "@keyframes fadeInUp": {
                    from: { opacity: 0, transform: "translateY(20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <RestaurantCard
                  name={restaurant.name}
                  address={restaurant.address}
                  managerName={restaurant.manager}
                  imageUrl={restaurant.imageUrl}
                  onEdit={() => handleEdit(restaurant._id)}
                  onDelete={() => handleDelete(restaurant._id)}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("confirmRemovalTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("confirmDeleteRestaurantBody", { name: restaurantName })}
            <br />
            {t("typeRestaurantNameToConfirm", { name: restaurantName })}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t("restaurantNameLabel")}
            fullWidth
            variant="standard"
            value={confirmationName}
            onChange={(e) => setConfirmationName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting || confirmationName !== restaurantName}
          >
            {deleting ? t("deleting") : t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
