"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EmployeeCard from "@/components/EmployeeCard";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { navWidth } from "@/components/AdminNavbar";
import { getAllEmployees, deleteEmployee } from "./actions";

type EmployeeData = {
  id: string;
  firstName: string;
  lastName: string;
  restaurantName: string;
  role: "manager" | "worker";
};

export default function WorkerManagerAccountsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const result = await getAllEmployees();
        if (result.success && result.data) {
          setEmployees(result.data);
          setFilteredEmployees(result.data);
        }
      } catch (error) {
        console.error("Error loading employees:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, []);

  // Filter employees when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(query) ||
          emp.lastName.toLowerCase().includes(query) ||
          emp.restaurantName.toLowerCase().includes(query) ||
          emp.role.toLowerCase().includes(query),
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const handleEdit = (id: string) => {
    router.push(`/admin/accounts/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      const result = await deleteEmployee(employeeToDelete);
      if (result.success) {
        // Remove employee from local state
        setEmployees(employees.filter((emp) => emp.id !== employeeToDelete));
        setFilteredEmployees(
          filteredEmployees.filter((emp) => emp.id !== employeeToDelete),
        );
      } else {
        alert(result.error || "Greška prilikom brisanja");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Greška prilikom brisanja");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleAddNew = () => {
    router.push("/admin/accounts/create");
  };

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
        pb: { xs: "130px", sm: 6 }, // Extra padding for mobile navbar and desktop spacing
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 780,
          mb: 4,
          color: "#212222",
          flexShrink: 0,
        }}
      >
        Upravljaj računima
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
          placeholder="Search"
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
              "& fieldset": {
                borderColor: "#e0e0e0",
              },
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
            "&:hover": {
              bgcolor: "#e0e0e0",
            },
          }}
          aria-label="add employee"
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: 1,
        }}
      >
        {filteredEmployees.length === 0 ? (
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
              {searchQuery ? "Nema rezultata pretrage" : "Nema zaposlenika"}
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
              pb: 2,
            }}
          >
            {filteredEmployees.map((employee, index) => (
              <Box
                key={employee.id}
                sx={{
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                  "@keyframes fadeInUp": {
                    from: { opacity: 0, transform: "translateY(20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <EmployeeCard
                  id={employee.id}
                  firstName={employee.firstName}
                  lastName={employee.lastName}
                  restaurantName={employee.restaurantName}
                  role={employee.role}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Potvrda brisanja</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Jeste li sigurni da želite obrisati ovaj račun? Ova radnja se ne
            može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} disabled={deleting}>
            Odustani
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Brisanje..." : "Obriši"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
