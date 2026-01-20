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
import EditIcon from "@mui/icons-material/Edit";
import SuccessScreen from "@/components/SuccessScreen";
import WorkingHoursEditor, {
  WorkingHoursData,
} from "@/components/WorkingHoursEditor";
import MapLocationPicker from "@/components/MapLocationPicker";
import { createRestaurant } from "../actions";
import { uploadAttachment } from "@/app/manager/announcements/uploadAction"; // Reusing generic upload
import { IWorkingDay, IShift } from "@/models/Restaurant";
import StaffAssignment, { StaffMember } from "@/components/StaffAssignment";

export default function CreateRestaurantPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const [workingHoursRaw, setWorkingHoursRaw] = useState<WorkingHoursData>({});
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

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
    if (!location) {
      setError("Molimo označite lokaciju restorana na karti");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Upload Image
      const uploadFormData = new FormData();
      uploadFormData.append("file", imageFile);
      const uploadRes = await uploadAttachment(uploadFormData);
      if (!uploadRes.success || !uploadRes.attachment) {
        throw new Error(uploadRes.error || "Image upload failed");
      }
      const imageUrl = uploadRes.attachment.url;

      // 2. Format Working Hours
      const formattedHours: IWorkingDay[] = [];
      Object.entries(workingHoursRaw).forEach(([dayStr, shifts]) => {
        const dayNum = parseInt(dayStr);
        if (shifts.length > 0) {
          formattedHours.push({
            day: dayNum,
            shifts: shifts.filter((s: IShift) => s.start && s.end), // Filter partials
          });
        }
      });

      // 3. Create Restaurant
      const res = await createRestaurant({
        name: formData.name,
        address: formData.address,
        imageUrl: imageUrl,
        workingHours: formattedHours,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat], // GeoJSON is [lng, lat]
        },
        initialStaff: staff.map((s) => ({ id: s.id, role: s.role })),
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      setSuccess("Restoran uspješno kreiran!");
      setShowSuccessScreen(true);
      setTimeout(() => {
        router.push("/admin/restaurants");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Došlo je do greške. Pokušajte ponovo.");
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

      {/* Staff Management (Local Mode) */}
      <Box sx={{ mb: 3 }}>
        <StaffAssignment value={staff} onChange={setStaff} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Lokacija
        </Typography>
        <MapLocationPicker
          initialAddress={formData.address}
          onLocationChange={(loc, addr) => {
            setLocation(loc);
            setFormData((prev) => ({ ...prev, address: addr }));
          }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Radno vrijeme
        </Typography>
        <WorkingHoursEditor onChange={setWorkingHoursRaw} />
      </Box>
    </Box>
  );

  if (showSuccessScreen) {
    return <SuccessScreen message="Restoran uspješno kreiran!" />;
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <Box
        sx={{
          height: "100vh",
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto", pb: "300px" }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 780, mb: 4, color: "#212222" }}
          >
            Unesite podatke
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

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
          <Typography
            sx={{
              color: "white",
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={24} color="inherit" />
                Spremanje...
              </Box>
            ) : (
              "Spremi"
            )}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Desktop Layout
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: 4, // Reduced from 12
        pb: 4, // Reduced from 15
      }}
    >
      <Box
        sx={{
          maxWidth: 1600, // Increased width to 1600
          width: "100%",
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 2,
          maxHeight: "calc(100vh - 100px)", // Increased visible area
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 4, pb: 0, flexShrink: 0 }}>
          {/* Editable Title Header - No Icon */}
          <Box
            component="input"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Naziv restorana"
            sx={{
              fontSize: "2.125rem", // h4 size
              fontWeight: 780,
              color: "#212222",
              border: "none",
              outline: "none",
              bgcolor: "transparent",
              width: "100%",
              "&::placeholder": {
                color: "text.disabled",
              },
              mb: 1, // Reduced margin
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
        </Box>

        <Box sx={{ px: 4, pb: 4, flexGrow: 1, overflowY: "auto" }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              {/* Left Column: Image, Location */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Osnovne informacije
                </Typography>
                {renderImageUpload()}

                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, mt: 3 }}>
                  Lokacija
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <MapLocationPicker
                    initialAddress={formData.address}
                    onLocationChange={(loc, addr) => {
                      setLocation(loc);
                      setFormData((prev) => ({ ...prev, address: addr }));
                    }}
                  />
                </Box>
              </Box>

              {/* Right Column: Staff, Hours */}
              <Box>
                {/* Staff Assignment Component already has its own header */}
                <Box sx={{ mb: 4, mt: 0 }}>
                  <StaffAssignment value={staff} onChange={setStaff} />
                </Box>

                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Radno vrijeme
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <WorkingHoursEditor onChange={setWorkingHoursRaw} />
                </Box>
              </Box>
            </Box>

            <Button
              type="submit"
              onClick={handleSubmit}
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3, // Reduced from 4
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
              ) : (
                "Spremi"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}