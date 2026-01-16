"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SuccessScreen from "@/components/SuccessScreen"; 


const DAYS = ["PON", "UTO", "SRI", "ČET", "PET", "SUB", "NED"];

type WorkingHours = {
  start: string;
  end: string;
};

type Schedule = {
  [key: string]: WorkingHours;
};

export default function CreateRestaurantPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    name: "",
    manager: "",
    address: "",
  });

  const [schedule, setSchedule] = useState<Schedule>(
    DAYS.reduce((acc, day) => ({ ...acc, [day]: { start: "", end: "" } }), {})
  );
  
  const [selectedDay, setSelectedDay] = useState("PON");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleTimeChange = (field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!imageFile) {
      setImageError("Slika je obavezna");
      setError("Molimo odaberite sliku restorana");
      return;
    }
    if (!formData.name || !formData.address) {
      setError("Naziv i adresa su obavezni");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Replace with actual Server Action
      // const formDataToSend = new FormData();
      // formDataToSend.append("name", formData.name);
      // ... append other fields ...

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess("Restoran uspješno kreiran!");
      setShowSuccessScreen(true);
      setTimeout(() => {
        router.push("/admin/restaurants");
      }, 2000);
      
    } catch (err) {
      setError("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const renderImageUpload = () => (
    <Box
      sx={{
        mb: 3,
        bgcolor: "white",
        borderRadius: 2,
        p: 2,
        border: "2px dashed",
        borderColor: imageError
          ? "error.main"
          : imagePreview
          ? "primary.main"
          : "grey.300",
        textAlign: "center",
        position: "relative",
      }}
    >
      {imagePreview ? (
        <Box sx={{ position: "relative" }}>
          <Box
            component="img"
            src={imagePreview}
            alt="Preview"
            sx={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
          <IconButton
            onClick={handleRemoveImage}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "error.main",
              color: "white",
              "&:hover": { bgcolor: "error.dark" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Box>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="restaurant-image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="restaurant-image-upload">
            <Button
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ textTransform: "none" }}
            >
              Odaberi sliku *
            </Button>
          </label>
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 1, color: imageError ? "error.main" : "text.secondary" }}
          >
            {imageError || "PNG, JPG do 5MB"}
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Reusable Form Content
  const renderFormContent = () => (
    <Box component="form" onSubmit={handleSubmit}>
      {renderImageUpload()}

      <TextField
        fullWidth
        label="Naziv restorana"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        sx={{
          mb: 3,
          bgcolor: "white",
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
        }}
      />

      <TextField
        fullWidth
        label="Voditelj"
        value={formData.manager}
        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
        sx={{
          mb: 3,
          bgcolor: "white",
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
        }}
      />

      <TextField
        fullWidth
        label="Adresa"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        required
        sx={{
          mb: 3,
          bgcolor: "white",
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
        }}
      />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Radno vrijeme
        </Typography>
        
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            const hasHours = schedule[day].start !== "" || schedule[day].end !== "";
            
            return (
              <Button
                key={day}
                onClick={() => setSelectedDay(day)}
                variant={isSelected ? "contained" : "outlined"}
                size="small"
                sx={{
                  minWidth: "auto",
                  borderRadius: 4,
                  borderColor: isSelected ? "primary.main" : "grey.300",
                  color: isSelected ? "white" : (hasHours ? "primary.main" : "text.secondary"),
                  bgcolor: isSelected ? "primary.main" : "white",
                  boxShadow: "none",
                  "&:hover": {
                     bgcolor: isSelected ? "primary.dark" : "grey.50",
                     borderColor: isSelected ? "primary.dark" : "grey.400",
                  }
                }}
              >
                {day}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ 
            bgcolor: "white", 
            p: 2, 
            borderRadius: 2, 
            border: "1px solid", 
            borderColor: "grey.200",
            display: "flex", 
            alignItems: "center", 
            gap: 2 
        }}>
           <AccessTimeIcon color="action" fontSize="small" />
           
           <TextField
             placeholder="08:00"
             value={schedule[selectedDay].start}
             onChange={(e) => handleTimeChange("start", e.target.value)}
             size="small"
             sx={{ width: 100 }}
             inputProps={{ style: { textAlign: 'center' } }}
           />
           
           <Typography variant="body2" color="text.secondary">do</Typography>
           
           <TextField
             placeholder="22:00"
             value={schedule[selectedDay].end}
             onChange={(e) => handleTimeChange("end", e.target.value)}
             size="small"
             sx={{ width: 100 }}
             inputProps={{ style: { textAlign: 'center' } }}
           />
        </Box>
      </Box>
    </Box>
  );

  if (showSuccessScreen) {
    return <SuccessScreen message="Restoran uspješno kreiran!" />;
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <Box sx={{ height: "100vh", bgcolor: "#f5f5f5", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto", pb: "200px" }}>
          <Typography variant="h4" sx={{ fontWeight: 780, mb: 4, color: "#212222" }}>
            Unesite podatke
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          {renderFormContent()}
        </Box>

        {/* Fixed Bottom Button */}
        <Box
          onClick={loading ? undefined : handleSubmit}
          sx={{
            position: "fixed",
            bottom: "64px",
            left: 0,
            right: 0,
            height: "70px",
            bgcolor: loading ? "grey.400" : "#57aaf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-in-out",
            zIndex: 1000,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
            "&:active": { bgcolor: loading ? "grey.400" : "#3d8fd9" },
          }}
        >
          <Typography sx={{ color: "white", fontSize: "1.1rem", fontWeight: 600, textTransform: "none" }}>
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={24} color="inherit" />
                Spremanje...
              </Box>
            ) : "Spremi"}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Desktop Layout
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", py: 5 }}>
      <Box sx={{ maxWidth: 500, width: "100%", bgcolor: "white", borderRadius: 3, boxShadow: 2, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        <Box sx={{ p: 4, pb: 2, flexShrink: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 780, mb: 4, textAlign: "center", color: "#212222" }}>
            Unesite podatke
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        </Box>

        <Box sx={{ px: 4, pb: 4, flexGrow: 1, overflowY: "auto" }}>
          {renderFormContent()}

          <Button
            type="submit"
            onClick={handleSubmit}
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              textTransform: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 2,
              bgcolor: "#57aaf4",
              "&:hover": { bgcolor: "#3d8fd9", boxShadow: 4 },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Spremanje...
              </>
            ) : "Spremi"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}