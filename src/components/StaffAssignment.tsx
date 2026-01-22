"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Autocomplete,
  Chip,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import {
  getRestaurantStaff,
  searchAvailableUsers,
  assignEmployee,
  removeEmployee,
} from "@/app/admin/restaurants/actions";

interface StaffMember {
  id: string;
  name: string;
  role: "manager" | "worker";
  email?: string;
  username?: string;
}

interface StaffAssignmentProps {
  restaurantId?: string;
  value?: StaffMember[];
  onChange?: (staff: StaffMember[]) => void;
}

export type { StaffMember };

export default function StaffAssignment({
  restaurantId,
  value,
  onChange,
}: StaffAssignmentProps) {
  // If restaurantId is present, we ignore value/onChange and manage state internally via server fetch
  // If restaurantId is missing (create mode), we use value/onChange (controlled) or internal state (uncontrolled)
  const [internalStaff, setInternalStaff] = useState<StaffMember[]>([]);
  const staff = restaurantId ? internalStaff : value || internalStaff;

  const [loading, setLoading] = useState(!!restaurantId);
  const [error, setError] = useState<string | null>(null);

  const [availableUsers, setAvailableUsers] = useState<any[]>([]); // Store all available
  const [openAddDialog, setOpenAddDialog] = useState(false);
  // Remove search query state for server fetch, use it for local filter if needed,
  // but Autocomplete handles local filter automatically if we pass options and don't override filterOptions.
  // However, we want to control the input value to clear it on add.
  const [inputValue, setInputValue] = useState("");
  const [searching, setSearching] = useState(false); // Used for initial fetch loading
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState<"manager" | "worker">(
    "worker",
  );
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStaff = async () => {
    if (!restaurantId) return;
    setLoading(true);
    const res = await getRestaurantStaff(restaurantId);
    if (res.success && res.data) {
      setInternalStaff(res.data);
    } else {
      console.error("Failed to fetch staff");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (restaurantId) {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [restaurantId]);

  // Fetch available users when dialog opens
  useEffect(() => {
    if (openAddDialog) {
      const loadUsers = async () => {
        setSearching(true);
        // We use searchAvailableUsers which is now getAvailableUsers (all)
        // Or import getAvailableUsers directly if exported (it is)
        // Let's assume searchAvailableUsers was redirected or we import getAvailableUsers
        // ideally we utilize the updated import.
        // Since I didn't update imports in this file yet, I should check or rely on searchAvailableUsers wrapper I made.
        // But better to update imports. For now rely on wrapper I created in actions.ts.
        const res = await searchAvailableUsers("");
        if (res.success && res.data) {
          setAvailableUsers(res.data);
        }
        setSearching(false);
      };
      loadUsers();
    }
  }, [openAddDialog]);

  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!selectedUser) return;

    if (restaurantId) {
      // Server Mode
      setActionLoading(true);
      const res = await assignEmployee(
        selectedUser.id,
        restaurantId,
        selectedRole,
      );
      if (res.success) {
        setOpenAddDialog(false);
        setSelectedUser(null);
        setInputValue("");
        fetchStaff(); // Refresh list
      } else {
        setError(res.error || "Failed to assign user");
      }
      setActionLoading(false);
    } else {
      // Local Mode
      const newMember: StaffMember = {
        id: selectedUser.id,
        name: selectedUser.name,
        role: selectedRole,
        email: selectedUser.email,
        username: selectedUser.username,
      };

      // Check for duplicates
      if (staff.some((s) => s.id === newMember.id)) {
        setError("Korisnik je već dodan.");
        return;
      }

      const newStaffList = [...staff, newMember];
      if (onChange) {
        onChange(newStaffList);
      } else {
        setInternalStaff(newStaffList);
      }
      setOpenAddDialog(false);
      setSelectedUser(null);
      setInputValue("");
    }
  };

  const handleRemove = (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmRemove = async () => {
    if (!userToDelete) return;
    const userId = userToDelete;

    if (restaurantId) {
      // Server Mode
      const res = await removeEmployee(userId, restaurantId);
      if (res.success) {
        fetchStaff();
      } else {
        setError(res.error || "Failed to remove user");
      }
    } else {
      // Local Mode
      const newStaffList = staff.filter((s) => s.id !== userId);
      if (onChange) {
        onChange(newStaffList);
      } else {
        setInternalStaff(newStaffList);
      }
    }
    setUserToDelete(null);
  };

  const managers = staff.filter((s) => s.role === "manager");
  const workers = staff.filter((s) => s.role === "worker");

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Zaposlenici
        </Typography>
        <Button
          startIcon={<PersonAddIcon />}
          variant="outlined"
          size="small"
          onClick={() => setOpenAddDialog(true)}
        >
          Dodaj
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : staff.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Nema dodijeljenih zaposlenika.
        </Typography>
      ) : (
        <List dense sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
          {/* Managers Group */}
          {managers.length > 0 && (
            <>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ px: 2, pt: 1 }}
              >
                Voditelji
              </Typography>
              {managers.map((member) => (
                <ListItem
                  key={member.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemove(member.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.light" }}>
                      <BadgeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.email}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              ))}
            </>
          )}

          {/* Workers Group */}
          {workers.length > 0 && (
            <>
              <Typography
                variant="subtitle2"
                color="secondary"
                sx={{ px: 2, pt: managers.length > 0 ? 2 : 1 }}
              >
                Radnici
              </Typography>
              {workers.map((member) => (
                <ListItem
                  key={member.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemove(member.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "secondary.light" }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.email}
                  />
                </ListItem>
              ))}
            </>
          )}
        </List>
      )}

      {/* Add Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Dodaj zaposlenika</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <Autocomplete
              options={availableUsers}
              getOptionLabel={(option) => option.name}
              loading={searching}
              inputValue={inputValue}
              onInputChange={(_, newVal) => setInputValue(newVal)}
              onChange={(_, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pretraži korisnike"
                  placeholder="Ime, prezime ili username..."
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searching ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText={
                searching ? "Učitavanje..." : "Nema dostupnih korisnika"
              }
            />

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, ml: 1 }}
              >
                Pozicija
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={selectedRole}
                exclusive
                onChange={(e, newRole) => {
                  if (newRole) setSelectedRole(newRole);
                }}
                fullWidth
                sx={{ bgcolor: "white" }}
              >
                <ToggleButton value="worker">Radnik</ToggleButton>
                <ToggleButton value="manager">Voditelj</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Odustani</Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={!selectedUser || actionLoading}
          >
            {actionLoading ? "Dodavanje..." : "Dodaj"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
      >
        <DialogTitle>Potvrda brisanja</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Jeste li sigurni da želite ukloniti ovog zaposlenika?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserToDelete(null)}>Odustani</Button>
          <Button
            onClick={confirmRemove}
            color="error"
            variant="contained"
            autoFocus
          >
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
