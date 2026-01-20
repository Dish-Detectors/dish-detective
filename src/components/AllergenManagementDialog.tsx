"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  getAllAllergens,
  createAllergen,
  deleteAllergen,
} from "@/app/admin/dishes/actions";

interface Allergen {
  _id: string;
  name: string;
}

interface AllergenManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AllergenManagementDialog({
  open,
  onClose,
}: AllergenManagementDialogProps) {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [newAllergen, setNewAllergen] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllergens = async () => {
    setLoading(true);
    const res = await getAllAllergens();
    if (res.success && res.data) {
      setAllergens(res.data);
    } else {
      setError("Failed to load allergens");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchAllergens();
      setError(null);
      setNewAllergen("");
    }
  }, [open]);

  const handleAdd = async () => {
    if (!newAllergen.trim()) return;
    setError(null);
    const res = await createAllergen(newAllergen.trim());
    if (res.success) {
      setNewAllergen("");
      fetchAllergens();
    } else {
      setError(res.message || "Unknown error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovaj alergen?")) return;
    const res = await deleteAllergen(id);
    if (res.success) {
      fetchAllergens();
    } else {
      setError(res.message || "Unknown error occurred");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Upravljanje alergenima
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 1, mb: 3, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Novi alergen"
            value={newAllergen}
            onChange={(e) => setNewAllergen(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <IconButton
            onClick={handleAdd}
            color="primary"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 1,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
            {allergens.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ py: 2 }}
              >
                Nema definiranih alergena.
              </Typography>
            ) : (
              allergens.map((allergen) => (
                <ListItem
                  key={allergen._id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(allergen._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: "grey.50",
                    mb: 1,
                    borderRadius: 2,
                  }}
                >
                  <ListItemText primary={allergen.name} />
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          Zatvori
        </Button>
      </DialogActions>
    </Dialog>
  );
}
