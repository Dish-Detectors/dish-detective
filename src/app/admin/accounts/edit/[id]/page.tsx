"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Badge,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonIcon from "@mui/icons-material/Person";

import AdminNavbar, { navWidth, headerHeight } from "@/components/AdminNavbar";
import { getEmployeeAccount, updateEmployeeAccount } from "../actions";
import { uploadProfileImage } from "../../upload-image";
import { getAllRestaurants } from "../../../restaurants/actions";
import SuccessScreen from "@/components/SuccessScreen";

type Restaurant = {
  _id: string;
  name: string;
};

export default function EditWorkerManagerAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [id, setId] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    username: "",
    restaurantId: "",
    role: "worker" as "worker" | "manager",
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return "Lozinka mora imati minimalno 8 znakova";
    }
    return "";
  };

  const validateConfirmPassword = (confirm: string, pass: string): string => {
    if (confirm !== pass) {
      return "Lozinke se moraju podudarati";
    }
    return "";
  };

  const handlePasswordChange = (password: string) => {
    setPasswords({ ...passwords, newPassword: password });
    if (password) {
      setPasswordError(validatePassword(password));
      if (passwords.confirmPassword) {
        setConfirmPasswordError(
          validateConfirmPassword(passwords.confirmPassword, password),
        );
      }
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (confirm: string) => {
    setPasswords({ ...passwords, confirmPassword: confirm });
    if (confirm) {
      setConfirmPasswordError(
        validateConfirmPassword(confirm, passwords.newPassword),
      );
    } else {
      setConfirmPasswordError("");
    }
  };

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Load restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const result = await getAllRestaurants();

        if (result.success && result.data) {
          setRestaurants(result.data);
        }
      } catch (err) {
        console.error("Error loading restaurants:", err);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    loadRestaurants();
  }, []);

  // Load employee data
  useEffect(() => {
    if (!id) return;

    const loadEmployee = async () => {
      try {
        setLoadingData(true);
        const result = await getEmployeeAccount(id);

        if (result.success && result.user) {
          setFormData({
            name: result.user.name,
            lastName: result.user.lastName,
            username: result.user.username,
            restaurantId: result.user.restaurantId,
            role: result.user.role as "worker" | "manager",
          });
          if ((result.user as any).imageUrl) {
            setImagePreview((result.user as any).imageUrl);
          }
        } else {
          setError(result.error || "Greška pri učitavanju podataka");
        }
      } catch (err) {
        setError("Greška pri učitavanju podataka");
      } finally {
        setLoadingData(false);
      }
    };

    loadEmployee();
  }, [id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id) return;

    if (!formData.name.trim() || !formData.lastName.trim()) {
      setError("Ime i prezime su obavezni");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateEmployeeAccount({
        userId: id,
        name: formData.name,
        lastName: formData.lastName,
        username: formData.username,
        restaurantId: formData.restaurantId,
        role: formData.role,
      });

      if (result.success) {
        // Upload image if selected
        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);
          formData.append("userId", id);

          await uploadProfileImage(formData);
        }

        setSuccess("Račun uspješno ažuriran!");
        setShowSuccessScreen(true);
        setTimeout(() => router.push("/admin/accounts"), 2000);
      } else {
        setError(
          result.error || "Došlo je do greške prilikom ažuriranja računa",
        );
      }
    } catch (err) {
      console.error("Error updating account:", err);
      setError("Došlo je do greške prilikom ažuriranja računa");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!id) return;

    if (
      passwordError ||
      confirmPasswordError ||
      !passwords.newPassword ||
      passwords.newPassword !== passwords.confirmPassword
    ) {
      return; // Validation should be handled by UI state, but double check
    }

    setLoading(true); // Reuse loading state or create specific one
    try {
      const result = await updateEmployeeAccount({
        userId: id,
        password: passwords.newPassword,
      });

      if (result.success) {
        setSuccess("Lozinka uspješno promijenjena!");
        setOpenPasswordDialog(false);
        setPasswords({ newPassword: "", confirmPassword: "" });
      } else {
        setError(result.error || "Greška pri promjeni lozinke");
      }
    } catch (err) {
      setError("Greška pri promjeni lozinke");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessScreen) {
    return <SuccessScreen message="Račun uspješno ažuriran!" />;
  }

  if (loadingData || loadingRestaurants) {
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
              pb: "150px", // Extra padding for the fixed button and navbar
            }}
          >
            <Box>
              {/* Image Upload (Mobile) */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <Box
                      component="label"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        border: "2px solid white",
                      }}
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Box>
                  }
                >
                  {imagePreview ? (
                    <Avatar
                      src={imagePreview}
                      sx={{
                        width: 100,
                        height: 100,
                        border: "4px solid white",
                        boxShadow: 1,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        bgcolor:
                          formData.role === "manager" ? "#64b5f6" : "#ba68c8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "4px solid white",
                        boxShadow: 1,
                      }}
                    >
                      {formData.role === "manager" ? (
                        <AssignmentIndIcon
                          sx={{ fontSize: 60, color: "white" }}
                        />
                      ) : (
                        <PersonIcon sx={{ fontSize: 60, color: "white" }} />
                      )}
                    </Box>
                  )}
                </Badge>
              </Box>

              {/* Editable Header for Name & Last Name (Mobile) */}
              <Box
                sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 0 }}
              >
                <InputBase
                  placeholder="Ime"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#212222",
                    borderBottom: "2px solid transparent",
                    "&:hover": { borderBottom: "2px solid #e0e0e0" },
                    "&.Mui-focused": { borderBottom: "2px solid #1976d2" },
                  }}
                />
                <InputBase
                  placeholder="Prezime"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#212222",
                    borderBottom: "2px solid transparent",
                    "&:hover": { borderBottom: "2px solid #e0e0e0" },
                    "&.Mui-focused": { borderBottom: "2px solid #1976d2" },
                  }}
                />
              </Box>

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
                <TextField
                  fullWidth
                  label="Korisničko ime"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  sx={{
                    mb: 4,
                    bgcolor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Read-only info: Restaurant and Position */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 4,
                  }}
                >
                  <Box
                    component={formData.restaurantId ? "a" : "div"}
                    href={
                      formData.restaurantId
                        ? `/admin/restaurants/edit/${formData.restaurantId}`
                        : undefined
                    }
                    sx={{
                      p: 2,
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      textDecoration: "none",
                      textAlign: "center",
                      cursor: formData.restaurantId ? "pointer" : "default",
                      transition: "all 0.2s",
                      "&:hover": formData.restaurantId
                        ? {
                            bgcolor: "rgba(0, 0, 0, 0.05)",
                            borderColor: "primary.main",
                          }
                        : {},
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      RESTORAN
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={500}
                      sx={{
                        mt: 0.5,
                        color: formData.restaurantId
                          ? "primary.main"
                          : "text.primary",
                      }}
                    >
                      {restaurants.find((r) => r._id === formData.restaurantId)
                        ?.name || "Nije dodijeljen"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      POZICIJA
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={500}
                      sx={{ mt: 0.5 }}
                    >
                      {formData.role === "manager"
                        ? "Voditelj"
                        : formData.role === "worker"
                          ? "Radnik"
                          : "Nije dodijeljeno"}
                    </Typography>
                  </Box>
                </Box>

                {/* Password Change Button (Mobile) */}
                <Box sx={{ mb: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setOpenPasswordDialog(true)}
                    sx={{
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      bgcolor: "white",
                    }}
                  >
                    Promijeni lozinku
                  </Button>
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
              bgcolor:
                loading ||
                !formData.name.trim() ||
                !formData.lastName.trim() ||
                !formData.username.trim() ||
                formData.username.length < 4
                  ? "grey.400"
                  : "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor:
                loading ||
                !formData.name.trim() ||
                !formData.lastName.trim() ||
                !formData.username.trim() ||
                formData.username.length < 4
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.2s ease-in-out",
              "&:active": {
                bgcolor:
                  loading ||
                  !formData.name.trim() ||
                  !formData.lastName.trim() ||
                  !formData.username.trim() ||
                  formData.username.length < 4
                    ? "grey.400"
                    : "primary.dark",
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

  return (
    <>
      <AdminNavbar isMobile={isMobile} />
      <Box
        sx={{
          height: `calc(100vh - ${headerHeight}px)`,
          bgcolor: "#f5f5f5",
          pt: 4,
          pb: 4,
          pl: `${navWidth}px`,
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: 500,
            width: "100%",
            bgcolor: "white",
            borderRadius: 3,
            p: 4,
            boxShadow: 2,
            my: 2,
            mx: "auto",
          }}
        >
          {/* Image Upload (Desktop) */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Box
                  component="label"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "2px solid white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Box>
              }
            >
              {imagePreview ? (
                <Avatar
                  src={imagePreview}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid white",
                    boxShadow: 1,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    bgcolor:
                      formData.role === "manager" ? "#64b5f6" : "#ba68c8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "4px solid white",
                    boxShadow: 1,
                  }}
                >
                  {formData.role === "manager" ? (
                    <AssignmentIndIcon sx={{ fontSize: 70, color: "white" }} />
                  ) : (
                    <PersonIcon sx={{ fontSize: 70, color: "white" }} />
                  )}
                </Box>
              )}
            </Badge>
          </Box>

          {/* Editable Header for Name & Last Name */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              flexDirection: "column",
              gap: 0,
              alignItems: "center",
            }}
          >
            <InputBase
              placeholder="Ime"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              sx={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#212222",
                maxWidth: "fit-content",
                borderBottom: "2px solid transparent",
                "&:hover": {
                  borderBottom: "2px solid #e0e0e0",
                },
                "&.Mui-focused": {
                  borderBottom: "2px solid #1976d2",
                },
                "& input": {
                  p: 0,
                  textAlign: "center",
                  "&::placeholder": {
                    color: "#bdbdbd",
                    opacity: 1,
                  },
                },
              }}
            />
            <InputBase
              placeholder="Prezime"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
              sx={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#212222",
                maxWidth: "fit-content",
                borderBottom: "2px solid transparent",
                "&:hover": {
                  borderBottom: "2px solid #e0e0e0",
                },
                "&.Mui-focused": {
                  borderBottom: "2px solid #1976d2",
                },
                "& input": {
                  p: 0,
                  textAlign: "center",
                  "&::placeholder": {
                    color: "#bdbdbd",
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

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
            <TextField
              fullWidth
              label="Korisničko ime"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {/* Read-only info: Restaurant and Position */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 4,
              }}
            >
              <Box
                component={formData.restaurantId ? "a" : "div"}
                href={
                  formData.restaurantId
                    ? `/admin/restaurants/edit/${formData.restaurantId}`
                    : undefined
                }
                sx={{
                  p: 2,
                  bgcolor: "rgba(0, 0, 0, 0.02)",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  textDecoration: "none",
                  textAlign: "center",
                  cursor: formData.restaurantId ? "pointer" : "default",
                  transition: "all 0.2s",
                  "&:hover": formData.restaurantId
                    ? {
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                        borderColor: "primary.main",
                      }
                    : {},
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  RESTORAN
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{
                    mt: 0.5,
                    color: formData.restaurantId
                      ? "primary.main"
                      : "text.primary",
                  }}
                >
                  {restaurants.find((r) => r._id === formData.restaurantId)
                    ?.name || "Nije dodijeljen"}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(0, 0, 0, 0.02)",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  POZICIJA
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                  {formData.role === "manager"
                    ? "Voditelj"
                    : formData.role === "worker"
                      ? "Radnik"
                      : "Nije dodijeljeno"}
                </Typography>
              </Box>
            </Box>

            {/* Password Change Button (Desktop) */}
            <Box sx={{ mb: 4 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenPasswordDialog(true)}
                sx={{
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Promijeni lozinku
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={
                loading ||
                !formData.name.trim() ||
                !formData.lastName.trim() ||
                !formData.username.trim() ||
                formData.username.length < 4
              }
              sx={{
                py: 1.5,
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Ažuriranje...
                </>
              ) : (
                "Spremi promjene"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
      {/* Password Change Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3, width: "100%", maxWidth: 400 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Promjena lozinke</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nova lozinka"
            type="password"
            fullWidth
            variant="outlined"
            value={passwords.newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            error={!!passwordError && passwords.newPassword.length > 0}
            helperText={passwordError}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Potvrdi novu lozinku"
            type="password"
            fullWidth
            variant="outlined"
            value={passwords.confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            error={
              !!confirmPasswordError && passwords.confirmPassword.length > 0
            }
            helperText={confirmPasswordError}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenPasswordDialog(false)}
            sx={{ textTransform: "none", color: "text.secondary" }}
          >
            Odustani
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            disabled={
              loading ||
              !passwords.newPassword ||
              passwords.newPassword.length < 8 ||
              passwords.newPassword !== passwords.confirmPassword
            }
            sx={{ textTransform: "none", boxShadow: 0, borderRadius: 2 }}
          >
            Promijeni
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
