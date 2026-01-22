"use client";

import { useState, useEffect } from "react";
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
  Chip,
  IconButton,
  InputBase,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import AdminNavbar, { navWidth, headerHeight } from "@/components/AdminNavbar";
import SuccessScreen from "@/components/SuccessScreen";
import { getAllDishes, getAllAllergens } from "../../actions";
import { updateDish } from "../actions";
import { put } from "@vercel/blob";

export default function DishEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  interface Allergen {
    _id: string;
    name: string;
  }

  const [id, setId] = useState<string | null>(null);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    allergens: [] as Allergen[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  // const [allergenInput, setAllergenInput] = useState(""); // Removed manual input state
  const [loading, setLoading] = useState(false);
  const [loadingDish, setLoadingDish] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoadingDish(true);
        const [dishesRes, allergensRes] = await Promise.all([
          getAllDishes(),
          getAllAllergens(),
        ]);

        if (allergensRes.success && allergensRes.data) {
          setAllAllergens(allergensRes.data);
        }

        if (dishesRes.success && dishesRes.data) {
          const dish = dishesRes.data.find((d: any) => d._id === id);

          if (dish) {
            setFormData({
              name: dish.name,
              description: dish.description,
              allergens: dish.allergens || [],
            });
            setCurrentImageUrl(dish.imageUrl);
            setImagePreview(dish.imageUrl);
          } else {
            setError("Jelo nije pronađeno");
          }
        } else {
          setError("Greška pri učitavanju jela");
        }
      } catch (err) {
        setError("Greška pri učitavanju jela");
      } finally {
        setLoadingDish(false);
      }
    };

    loadData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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

  // Handlers removed as Autocomplete manages state directly

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id) return;

    // Require image (either existing or new upload)
    if (!imagePreview && !imageFile) {
      setError("Molimo odaberite sliku jela");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let imageUrl = currentImageUrl;

      // Upload new image if provided
      if (imageFile) {
        const blob = await put(
          `dishes/${Date.now()}-${imageFile.name}`,
          imageFile,
          {
            access: "public",
          },
        );
        imageUrl = blob.url;
      }

      const result = await updateDish(id, {
        name: formData.name,
        description: formData.description,
        imageUrl: imageUrl,
        allergens: formData.allergens.map((a) => a._id),
      });

      if (result.success) {
        setSuccess("Jelo uspješno ažurirano!");
        setShowSuccessScreen(true);
        setTimeout(() => router.push("/admin/dishes"), 2000);
      } else {
        setError(result.message || "Došlo je do greške. Pokušajte ponovo.");
      }
    } catch (err) {
      console.error("Error updating dish:", err);
      setError("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessScreen) {
    return <SuccessScreen message="Jelo uspješno ažurirano!" />;
  }

  if (loadingDish) {
    return (
      <>
        <AdminNavbar isMobile={isMobile} />
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#f5f5f5",
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (isMobile) {
    return (
      <>
        <AdminNavbar isMobile={isMobile} />
        <Box
          sx={{
            height: "100vh",
            bgcolor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 3,
              pb: "180px", // Extra padding for the fixed button and navbar
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 780,
                  mb: 4,
                  color: "#212222",
                }}
              >
                Uredi jelo
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

              <Box component="form" onSubmit={handleSubmit}>
                <Box
                  sx={{
                    mb: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    p: 2,
                    border: "2px dashed",
                    borderColor: imagePreview ? "primary.main" : "grey.300",
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
                          "&:hover": {
                            bgcolor: "error.dark",
                          },
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
                        id="image-upload-mobile"
                        type="file"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="image-upload-mobile">
                        <Button
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          sx={{ textTransform: "none" }}
                        >
                          Odaberi sliku
                        </Button>
                      </label>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, color: "text.secondary" }}
                      >
                        PNG, JPG do 5MB
                      </Typography>
                    </Box>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Naziv jela"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  sx={{
                    mb: 3,
                    bgcolor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Opis"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  multiline
                  rows={3}
                  sx={{
                    mb: 3,
                    bgcolor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />



                <Box sx={{ mb: 3 }}>
                  <Autocomplete
                    multiple
                    options={allAllergens}
                    getOptionLabel={(option) => option.name}
                    value={formData.allergens}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, allergens: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Dodaj alergen"
                        placeholder="Odaberi alergene"
                        sx={{
                          bgcolor: "white",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          sx={{
                            bgcolor: "white",
                            border: "1px solid",
                            borderColor: "primary.main",
                          }}
                        />
                      ))
                    }
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            onClick={loading ? undefined : handleSubmit}
            sx={{
              position: "fixed",
              bottom: "64px",
              left: 0,
              right: 0,
              height: "70px",
              bgcolor: loading ? "grey.400" : "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
              "&:active": {
                bgcolor: loading ? "grey.400" : "primary.dark",
              },
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
                  Ažuriranje...
                </Box>
              ) : (
                "Spremi promjene"
              )}
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  // Desktop Layout
  return (
    <>
      <AdminNavbar isMobile={isMobile} />
      <Box
        sx={{
          height: `calc(100vh - ${headerHeight}px)`,
          bgcolor: "#f5f5f5",
          pt: 2,
          pb: 10,
          pl: `${navWidth}px`,
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: 1000,
            width: "95%",
            bgcolor: "white",
            borderRadius: 4,
            p: 5,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            my: 2,
            mx: "auto",
          }}
        >
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

          <Box component="form" onSubmit={handleSubmit}>
            {/* ROW 1: Name/Category and Image */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", md: "row" },
                gap: 5,
                mb: 3,
                alignItems: "flex-start",
              }}
            >
              {/* Left: Name and Category */}
              <Box sx={{ flex: 1, pt: 1 }}>
                <InputBase
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Naziv jela"
                  fullWidth
                  required
                  sx={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    color: "#212222",
                    mb: 1,
                    lineHeight: 1.2,
                    "& input": { p: 0 },
                  }}
                />


                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Opis
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Unesite opis jela..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{
                    mb: 4,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "grey.50",
                      borderRadius: 3,
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: "grey.300" },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Box>

              {/* Right: Image */}
              <Box sx={{ width: { xs: "100%", md: "350px" }, flexShrink: 0 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "75%", // 4:3 Aspect Ratio
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "2px dashed",
                    borderColor: imagePreview ? "transparent" : "grey.300",
                    bgcolor: "grey.50",
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
                        id="image-upload-desktop"
                        type="file"
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="image-upload-desktop"
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
                          PNG, JPG do 5MB
                        </Typography>
                      </label>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* ROW 3: Allergens */}
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ mt: -2 }}
            >
              Alergeni
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Autocomplete
                multiple
                options={allAllergens}
                getOptionLabel={(option) => option.name}
                value={formData.allergens}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                onChange={(event, newValue) => {
                  setFormData({ ...formData, allergens: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Odaberi alergene"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "grey.50",
                        borderRadius: 3,
                        "& fieldset": { borderColor: "transparent" },
                        "&:hover fieldset": { borderColor: "grey.300" },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      sx={{
                        bgcolor: "primary.50",
                        color: "primary.main",
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                    />
                  ))
                }
              />
            </Box>

            {/* ROW 4: Save Button */}
            <Box sx={{ mt: 4 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  boxShadow: "0 8px 20px rgba(78, 167, 240, 0.3)",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Spremi promjene"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
