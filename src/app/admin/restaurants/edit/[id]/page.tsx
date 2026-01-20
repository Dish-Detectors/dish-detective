"use client";

import { useState, useEffect, use } from "react";
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
import { getRestaurant, updateRestaurant } from "../../actions";
import { uploadAttachment } from "@/app/manager/announcements/uploadAction";
import { IWorkingDay, IShift } from "@/models/Restaurant";
import StaffAssignment from "@/components/StaffAssignment";

export default function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [fetchingData, setFetchingData] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const [workingHoursRaw, setWorkingHoursRaw] = useState<WorkingHoursData>({});
  const [initialHours, setInitialHours] = useState<IWorkingDay[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // --- FETCHING DATA ---
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setFetchingData(true);
        const res = await getRestaurant(id);

        if (res.success && res.data) {
          const rest = res.data;
          setFormData({
            name: rest.name,
            address: rest.address,
          });

          if (rest.imageUrl) {
            setImagePreview(rest.imageUrl);
          }

          if (rest.location && rest.location.coordinates) {
            setLocation({
              lng: rest.location.coordinates[0],
              lat: rest.location.coordinates[1],
            });
          }

          if (rest.workingHours) {
            setInitialHours(rest.workingHours);
          }
        } else {
          setError("Restoran nije pronađen.");
        }
      } catch (e) {
        setError("Neuspješno učitavanje podataka.");
      } finally {
        setFetchingData(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

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

    if (!imagePreview) {
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

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let imageUrl = imagePreview; // Default to existing URL
      // If file changed, upload new one
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        const uploadRes = await uploadAttachment(uploadFormData);
        if (!uploadRes.success || !uploadRes.attachment) {
          throw new Error(uploadRes.error || "Image upload failed");
        }
        imageUrl = uploadRes.attachment.url;
      }

      // Format Working Hours
      const formattedHours: IWorkingDay[] = [];
      Object.entries(workingHoursRaw).forEach(([dayStr, shifts]) => {
        const dayNum = parseInt(dayStr);
        if (shifts.length > 0) {
          formattedHours.push({
            day: dayNum,
            shifts: shifts.filter((s: IShift) => s.start && s.end),
          });
        }
      });

      const res = await updateRestaurant(id, {
        name: formData.name,
        address: formData.address,
        imageUrl: imageUrl,
        workingHours: formattedHours,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      setSuccess("Podaci uspješno ažurirani!");
      setShowSuccessScreen(true);
      setTimeout(() => {
        router.push("/admin/restaurants");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setSaving(false);
    }
  };

  const renderImageUpload = () => (
    <Box
      sx={{
        mb: 3,
        position: "relative",
        width: "100%",
        paddingTop: "56.25%", // 16:9 Aspect Ratio
        borderRadius: 4,
        overflow: "hidden",
        border: "2px dashed",
        borderColor: imageError
          ? "error.main"
          : imagePreview
            ? "transparent"
            : "grey.300",
        bgcolor: "grey.50",
        textAlign: "center",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: imagePreview
            ? "transparent"
            : "primary.main",
          bgcolor: "grey.100",
        },
      }}
    >
      {imagePreview ? (
        <>
          <Box
            component="img"
            src={imagePreview}
            alt="Preview"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0,0,0,0)",
              transition: "0.2s",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.3)",
                "& .remove-btn": { opacity: 1 },
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton
              className="remove-btn"
              onClick={handleRemoveImage}
              sx={{
                opacity: 0,
                bgcolor: "white",
                color: "error.main",
                "&:hover": { bgcolor: "white" },
                transform: "scale(1.2)",
                transition: "0.2s",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="restaurant-image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label
            htmlFor="restaurant-image-upload"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <CloudUploadIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              Odaberi sliku
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {imageError || "PNG, JPG do 5MB"}
            </Typography>
          </label>
        </Box>
      )}
    </Box>
  );

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

      {/* Staff Management - Mobile/Shared View */}
      <Box sx={{ mb: 3 }}>
        <StaffAssignment restaurantId={id} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Lokacija
        </Typography>
        <MapLocationPicker
          initialLocation={location || undefined}
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
        <WorkingHoursEditor
          initialData={initialHours}
          onChange={setWorkingHoursRaw}
        />
      </Box>
    </Box>
  );

  if (showSuccessScreen) {
    return <SuccessScreen message="Podaci uspješno ažurirani!" />;
  }

  if (fetchingData) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress />
      </Box>
    );
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
            Uredi podatke
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

        <Box
          onClick={saving ? undefined : handleSubmit}
          sx={{
            position: "fixed",
            bottom: "64px",
            left: 0,
            right: 0,
            height: "70px",
            bgcolor: saving ? "grey.400" : "#57aaf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: saving ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-in-out",
            zIndex: 1000,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
            "&:active": { bgcolor: saving ? "grey.400" : "#3d8fd9" },
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
            {saving ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={24} color="inherit" />
                Spremanje...
              </Box>
            ) : (
              "Spremi promjene"
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
          maxHeight: "calc(100vh - 100px)",
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
              mb: 1,
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
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, alignItems: "start" }}>
              {/* Top Left: Basic Info & Image */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Osnovne informacije
                </Typography>
                {renderImageUpload()}
              </Box>

              {/* Top Right: Staff */}
              <Box>
                <StaffAssignment restaurantId={id} />
              </Box>

              {/* Bottom Left: Location */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Lokacija
                </Typography>
                <MapLocationPicker
                  initialLocation={location || undefined}
                  initialAddress={formData.address}
                  onLocationChange={(loc, addr) => {
                    setLocation(loc);
                    setFormData((prev) => ({ ...prev, address: addr }));
                  }}
                />
              </Box>

              {/* Bottom Right: Working Hours */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Radno vrijeme
                </Typography>
                <WorkingHoursEditor
                  initialData={initialHours}
                  onChange={setWorkingHoursRaw}
                />
              </Box>
            </Box>

            <Button
              type="submit"
              onClick={handleSubmit}
              fullWidth
              variant="contained"
              size="large"
              disabled={saving}
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
              {saving ? (
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