"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Divider,
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
import { useI18n } from "@/components/I18nProvider";

type EmployeeData = {
  id: string;
  firstName: string;
  lastName: string;
  restaurantName: string;
  role: "manager" | "worker" | null;
  imageUrl?: string;
  restaurantImage?: string;
};

export default function WorkerManagerAccountsPage() {
  const { t } = useI18n();
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
          emp.role?.toLowerCase().includes(query),
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
        const errorKey = (result as { errorKey?: unknown }).errorKey;
        const message =
          (typeof errorKey === "string" ? t(errorKey) : "") ||
          result.error ||
          t("deleteFailed");
        alert(message);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(t("deleteFailed"));
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
          {t("manageAccountsTitle")}
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
            aria-label={t("addEmployeeAria")}
          >
            <AddIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: { xs: "none", sm: "block" } }} />
      </Box>

      <Divider sx={{ display: { xs: "none", sm: "block" }, mb: 4 }} />

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
              {searchQuery ? t("noSearchResults") : t("noEmployees")}
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
                  imageUrl={employee.imageUrl}
                  restaurantImage={employee.restaurantImage}
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
        <DialogTitle id="delete-dialog-title">
          {t("confirmRemovalTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{t("confirmDeleteAccountBody")}</DialogContentText>
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
    </Box>
  );
}
