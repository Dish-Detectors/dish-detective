"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import DishCard from "@/components/DishCard";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import AllergenManagementDialog from "@/components/AllergenManagementDialog";
import { useI18n } from "@/components/I18nProvider";

import { deleteDish, getAllDishes } from "./actions";

type Dish = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  allergens: (string | { name: string })[];
};

export default function Page() {
  const { t } = useI18n();
  const router = useRouter();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [allergenDialogOpen, setAllergenDialogOpen] = useState(false);

  useEffect(() => {
    void loadDishes();
  }, []);

  const loadDishes = async () => {
    setLoading(true);
    const response = await getAllDishes();

    if (response.success && response.data) {
      setDishes(response.data);
    } else {
      console.error("Failed to load dishes:", response.message);
    }
    setLoading(false);
  };

  const handleAddNew = () => router.push("/admin/dishes/create");
  const handleEdit = (id: string) => router.push(`/admin/dishes/edit/${id}`);

  const handleDelete = (id: string) => {
    setDishToDelete(id);
    setDeleteDialogOpen(true);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDishToDelete(null);
  };

  const confirmDelete = async () => {
    if (!dishToDelete) return;
    setDeleting(true);

    const response = await deleteDish(dishToDelete);

    if (response.success) {
      setDishes((prev) => prev.filter((dish) => dish._id !== dishToDelete));
      cancelDelete();
    } else {
      console.error("Failed to delete dish:", response.message);
      alert(t("deleteFailed"));
    }

    setDeleting(false);
  };

  const filteredDishes = dishes.filter((dish) => {
    const query = searchQuery.toLowerCase();
    return (
      dish.name.toLowerCase().includes(query) ||
      dish.description.toLowerCase().includes(query) ||
      dish.allergens.some((allergen) => {
        const label = typeof allergen === "string" ? allergen : allergen.name;
        return label.toLowerCase().includes(query);
      })
    );
  });

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
          flexShrink: 0,
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
          {t("manageDishesTitle")}
        </Typography>

        <Divider
          sx={{
            display: { xs: "block", sm: "none" },
            mb: 1,
            borderBottomWidth: 2,
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", sm: "auto" },
            justifySelf: { xs: "stretch", sm: "center" },
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search")}
            size="small"
            sx={{
              width: { xs: "100%", sm: 340, md: 440 },
              maxWidth: "100%",
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

          <IconButton
            onClick={handleAddNew}
            sx={{
              bgcolor: "white",
              border: "1px solid #e0e0e0",
              width: 40,
              height: 40,
              borderRadius: "50%",
              flexShrink: 0,
              "&:hover": {
                bgcolor: "#e0e0e0",
              },
            }}
            aria-label={t("create")}
          >
            <AddIcon />
          </IconButton>

          <Button
            variant="outlined"
            size="small"
            onClick={() => setAllergenDialogOpen(true)}
            sx={{
              flexShrink: 0,
              textTransform: "none",
              borderRadius: 999,
              border: "1px solid #e0e0e0",
              color: "text.secondary",
              fontWeight: 600,
              px: 2,
              height: 40,
              bgcolor: "white",
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: "grey.100",
                border: "1px solid #bdbdbd",
              },
            }}
          >
            {t("manageAllergensButton")}
          </Button>
        </Box>

        <Box sx={{ display: { xs: "none", sm: "block" } }} />
      </Box>

      <Divider sx={{ display: { xs: "none", sm: "block" }, mb: 4 }} />

      <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
        {filteredDishes.length === 0 ? (
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
              {searchQuery ? t("noSearchResults") : t("noDishes")}
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
              pt: 1,
              pb: 8,
            }}
          >
            {filteredDishes.map((dish, index) => (
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
                  allergens={dish.allergens}
                  onEdit={() => handleEdit(dish._id)}
                  onDelete={() => handleDelete(dish._id)}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>{t("confirmRemovalTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("confirmDeleteDishBody")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} disabled={deleting}>
            {t("cancel")}
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? t("deleting") : t("delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <AllergenManagementDialog
        open={allergenDialogOpen}
        onClose={() => setAllergenDialogOpen(false)}
      />
    </Box>
  );
}
