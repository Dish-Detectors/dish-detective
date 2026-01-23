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
  Avatar,
  Badge,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonIcon from "@mui/icons-material/Person";
import { getAllRestaurants } from "../../restaurants/actions";
import { createEmployeeAccount } from "./actions";
import { uploadProfileImage } from "../upload-image";

import AdminNavbar, { navWidth, headerHeight } from "@/components/AdminNavbar";


type Restaurant = {
  _id: string;
  name: string;
};

export default function EmployeeCreatePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  // ...existing code...
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

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
    password: "",
    confirmPassword: "",
    role: undefined as "worker" | "manager" | undefined,
  });
  // ...
  // ...



  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value });
    if (value.length > 0 && value.length < 8) {
      setPasswordError("Minimalno 8 znakova");
    } else {
      setPasswordError("");
    }

    if (formData.confirmPassword && value !== formData.confirmPassword) {
      setConfirmPasswordError("Lozinke se moraju podudarati");
    } else if (formData.confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData({ ...formData, confirmPassword: value });
    if (value !== formData.password) {
      setConfirmPasswordError("Lozinke se moraju podudarati");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.lastName || !formData.username || !formData.password) {
      setError("Molimo ispunite sva polja");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Lozinke se moraju podudarati");
      setLoading(false);
      return;
    }

    try {
      const result = await createEmployeeAccount({
        name: formData.name,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
        role: formData.role,
      });

      if (result.success) {
        setSuccess("Zaposlenik uspješno kreiran");
        setFormData({
          name: "",
          lastName: "",
          username: "",
          password: "",
          confirmPassword: "",
          role: undefined,
        });
        setImageFile(null);
        setImagePreview(null);
      } else {
        setError(result.error || "Došlo je do greške");
      }
    } catch (err) {
      setError("Došlo je do greške prilikom kreiranja računa.");
    } finally {
      setLoading(false);
    }
  };



  // Desktop Layout
  return (
    <>
      <AdminNavbar isMobile={isMobile} />
      <Box
        sx={{
          height: `calc(100vh - ${headerHeight}px)`,
          bgcolor: "#f5f5f5",
          pt: `${headerHeight}px`,
          pb: 3,
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
              <Avatar
                src={imagePreview || "/placeholder-user.jpg"}
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid white",
                  boxShadow: 1,
                }}
              />
            </Badge>
          </Box>

          {/* Editable Header for Name & Last Name */}
          <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 0 }}>
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
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Lozinka"
              type="password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              error={!!passwordError && formData.password.length > 0}
              helperText={
                passwordError && formData.password.length > 0
                  ? passwordError
                  : "Minimalno 8 znakova"
              }
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Potvrdi lozinku"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              required
              error={
                !!confirmPasswordError && formData.confirmPassword.length > 0
              }
              helperText={
                confirmPasswordError && formData.confirmPassword.length > 0
                  ? confirmPasswordError
                  : "Lozinke se moraju podudarati"
              }
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={
                loading ||
                !formData.name ||
                !formData.lastName ||
                !!passwordError ||
                !!confirmPasswordError
              }
              sx={{
                py: 1.5,
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 2,
                bgcolor: "#57aaf4",
                "&:hover": {
                  bgcolor: "#3d8fd9",
                  boxShadow: 4,
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Kreiranje...
                </>
              ) : (
                "Kreiraj račun"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
