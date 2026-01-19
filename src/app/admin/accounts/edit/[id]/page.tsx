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
} from "@mui/material";

import AdminNavbar, { navWidth, headerHeight } from "@/components/AdminNavbar";
import { getEmployeeAccount, updateEmployeeAccount } from "../actions";
import { getAllRestaurants } from "../../../restaurants/actions";

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

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    username: "",
    restaurantId: "",
    role: "worker" as "worker" | "manager",
  });

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
        setSuccess("Račun uspješno ažuriran!");
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
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 780,
                  mb: 4,
                  color: "#212222",
                }}
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

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Ime"
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
                  label="Prezime"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
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
                  label="Korisničko ime"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
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
                  select
                  label="Ime restorana"
                  value={formData.restaurantId}
                  onChange={(e) =>
                    setFormData({ ...formData, restaurantId: e.target.value })
                  }
                  required
                  sx={{
                    mb: 3,
                    bgcolor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  {restaurants.length === 0 ? (
                    <MenuItem disabled>Nema dostupnih restorana</MenuItem>
                  ) : (
                    restaurants.map((restaurant) => (
                      <MenuItem key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>

                <TextField
                  fullWidth
                  select
                  label="Odaberite poziciju"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "worker" | "manager",
                    })
                  }
                  required
                  sx={{
                    mb: 3,
                    bgcolor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="worker">Radnik</MenuItem>
                  <MenuItem value="manager">Voditelj</MenuItem>
                </TextField>
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
          <Typography
            variant="h4"
            sx={{
              fontWeight: 780,
              mb: 4,
              textAlign: "center",
              color: "#212222",
            }}
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

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Ime"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
              label="Prezime"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
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
              select
              label="Ime restorana"
              value={formData.restaurantId}
              onChange={(e) =>
                setFormData({ ...formData, restaurantId: e.target.value })
              }
              required
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              {restaurants.length === 0 ? (
                <MenuItem disabled>Nema dostupnih restorana</MenuItem>
              ) : (
                restaurants.map((restaurant) => (
                  <MenuItem key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              fullWidth
              select
              label="Odaberite poziciju"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "worker" | "manager",
                })
              }
              required
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="worker">Radnik</MenuItem>
              <MenuItem value="manager">Voditelj</MenuItem>
            </TextField>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
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
    </>
  );
}
