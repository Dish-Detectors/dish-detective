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
  Stack,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimePicker24 from "./TimePicker24";
import { IShift, IWorkingDay } from "@/models/Restaurant";

const DAYS = ["NED", "PON", "UTO", "SRI", "ČET", "PET", "SUB"];
const DAY_LABELS = [
  "Nedjelja",
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
];

export interface WorkingHoursData {
  [day: number]: IShift[];
}

interface WorkingHoursEditorProps {
  initialData?: IWorkingDay[];
  onChange: (data: WorkingHoursData) => void;
}

export default function WorkingHoursEditor({
  initialData,
  onChange,
}: WorkingHoursEditorProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday default
  const [workingHours, setWorkingHours] = useState<WorkingHoursData>({});

  useEffect(() => {
    // Initialize data
    const hours: WorkingHoursData = {};
    for (let i = 0; i <= 6; i++) {
      hours[i] = [];
    }
    if (initialData) {
      initialData.forEach((wd) => {
        hours[wd.day] = wd.shifts || [];
      });
    }
    setWorkingHours(hours);
  }, [initialData]);

  // Notify parent of changes
  useEffect(() => {
    onChange(workingHours);
  }, [workingHours, onChange]);

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

  const currentShifts = workingHours[selectedDay] || [];

  return (
    <Box sx={{ width: "100%" }}>
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
          {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => (
            <ToggleButton key={dayIndex} value={dayIndex}>
              {DAYS[dayIndex]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: "white",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
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
              Nema definiranih smjena za ovaj dan. Restoran je zatvoren.
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
                    label="Početak"
                    value={shift.start}
                    onChange={(val) => handleShiftChange(index, "start", val)}
                  />
                  <Typography
                    color="text.secondary"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    do
                  </Typography>
                  <TimePicker24
                    label="Kraj"
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
          Dodaj smjenu
        </Button>
      </Paper>
    </Box>
  );
}
