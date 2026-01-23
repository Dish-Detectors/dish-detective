"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import TimePicker24 from "@/components/TimePicker24";
import { getManagerRestaurant, saveWorkingHours } from "./actions";
import { IWorkingDay, IShift } from "@/models/Restaurant";
import { useI18n } from "@/components/I18nProvider";

interface WorkingHoursData {
  [day: number]: IShift[];
}

export default function WorkingHoursPage() {
  const { t } = useI18n();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday default
  const [workingHours, setWorkingHours] = useState<WorkingHoursData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    loadData();
  }, []);

  const DAYS = [
    t("daySunShort"),
    t("dayMonShort"),
    t("dayTueShort"),
    t("dayWedShort"),
    t("dayThuShort"),
    t("dayFriShort"),
    t("daySatShort"),
  ];
  const DAY_LABELS = [
    t("daySunday"),
    t("dayMonday"),
    t("dayTuesday"),
    t("dayWednesday"),
    t("dayThursday"),
    t("dayFriday"),
    t("daySaturday"),
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getManagerRestaurant();
      if (res.success && res.data) {
        setRestaurantId(res.data._id);
        // Convert existing working hours to our format
        const hours: WorkingHoursData = {};
        for (let i = 0; i <= 6; i++) {
          hours[i] = [];
        }
        if (res.data.workingHours) {
          res.data.workingHours.forEach((wd: IWorkingDay) => {
            hours[wd.day] = wd.shifts || [];
          });
        }
        setWorkingHours(hours);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (
    _: React.MouseEvent<HTMLElement>,
    newDay: number | null,
  ) => {
    if (newDay !== null) {
      setSelectedDay(newDay);
    }
  };

  const handleAddShift = () => {
    setWorkingHours((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), { start: "", end: "" }],
    }));
  };

  const handleRemoveShift = (index: number) => {
    setWorkingHours((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== index),
    }));
  };

  const handleShiftChange = (
    index: number,
    field: "start" | "end",
    value: string,
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map((shift, i) =>
        i === index ? { ...shift, [field]: value } : shift,
      ),
    }));
  };

  const handleSave = async () => {
    if (!restaurantId) return;

    // Validation: Check if start time is before end time for all shifts
    for (const day in workingHours) {
      const shifts = workingHours[day];
      for (const shift of shifts) {
        if (shift.start && shift.end && shift.start >= shift.end) {
          setSnackbar({
            open: true,
            message: t("invalidTimeForDay", {
              day: DAY_LABELS[parseInt(day)],
            }),
            severity: "error",
          });
          return;
        }
      }
    }

    setSaving(true);
    try {
      const res = await saveWorkingHours(restaurantId, workingHours);
      if (res.success) {
        setSnackbar({
          open: true,
          message: t("workingHoursSaved"),
          severity: "success",
        });
      } else {
        const message =
          ("errorKey" in res && res.errorKey && t(res.errorKey)) ||
          ("error" in res && res.error) ||
          t("workingHoursSaveError");
        throw new Error(message);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || t("workingHoursSaveError"),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
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

  const currentShifts = workingHours[selectedDay] || [];

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
        pb: { xs: "100px", sm: 6 },
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 780,
          mb: 2,
          color: "#212222",
          flexShrink: 0,
        }}
      >
        {t("workingHours")}
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 800 }}>
          {/* Day Selector */}
          <Box sx={{ mb: 4, overflowX: "auto", pb: 1 }}>
            <ToggleButtonGroup
              value={selectedDay}
              exclusive
              onChange={handleDayChange}
              sx={{
                display: "flex",
                gap: 1,
                "& .MuiToggleButtonGroup-grouped": {
                  border: "1px solid #e0e0e0 !important",
                  borderRadius: "20px !important",
                  px: 3,
                  bgcolor: "white",
                  transition: "all 0.2s",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                },
              }}
            >
              {DAYS.map((day, index) => (
                <ToggleButton key={day} value={index}>
                  {day}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <AccessTimeIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                {DAY_LABELS[selectedDay]}
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Stack spacing={2} sx={{ mb: 4 }}>
              {currentShifts.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  {t("noShiftsDefined")}
                </Typography>
              ) : (
                currentShifts.map((shift, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      gap: 2,
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "#fafafa",
                      border: "1px solid #efefef",
                      animation: "fadeInUp 0.4s ease-out forwards",
                      "@keyframes fadeInUp": {
                        from: { opacity: 0, transform: "translateY(10px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        gap: 2,
                        minWidth: 0,
                      }}
                    >
                      <TimePicker24
                        label={t("shiftStart")}
                        value={shift.start}
                        onChange={(val) =>
                          handleShiftChange(index, "start", val)
                        }
                      />
                      <Typography
                        color="text.secondary"
                        sx={{ display: { xs: "none", sm: "block" } }}
                      >
                        {t("timeTo")}
                      </Typography>
                      <TimePicker24
                        label={t("shiftEnd")}
                        value={shift.end}
                        onChange={(val) => handleShiftChange(index, "end", val)}
                      />
                    </Box>
                    <IconButton
                      onClick={() => handleRemoveShift(index)}
                      sx={{
                        alignSelf: { xs: "flex-end", sm: "auto" },
                        color: "error.main",
                        bgcolor: "rgba(211, 47, 47, 0.05)",
                        "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                ))
              )}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddShift}
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {t("addShift")}
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
                }}
              >
                {saving ? <PancakeStackLoader /> : t("saveChanges")}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ borderRadius: 3, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
