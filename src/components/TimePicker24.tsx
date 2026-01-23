
"use client";

import React from "react";
import { Box, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, Typography } from "@mui/material";

interface TimePicker24Props {
    label?: string;
    value: string; // "HH:mm" or ""
    onChange: (value: string) => void;
    disabled?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0")); // 00, 05, 10 ... 55

export default function TimePicker24({ label, value, onChange, disabled }: TimePicker24Props) {
    const [hour, minute] = value ? value.split(":") : ["", ""];

    const handleHourChange = (event: SelectChangeEvent) => {
        const newHour = event.target.value;
        if (newHour && !minute) {
            onChange(`${newHour}:00`);
        } else {
            onChange(`${newHour}:${minute || "00"}`);
        }
    };

    const handleMinuteChange = (event: SelectChangeEvent) => {
        const newMinute = event.target.value;
        if (newMinute && !hour) {
            // If minute selected but no hour, maybe default to 08? Or wait.
            // Better to check if hour exists. If not, don't trigger full change or default hour.
            // Let's default hour to 00 if missing.
            onChange(`00:${newMinute}`);
        } else {
            onChange(`${hour || "00"}:${newMinute}`);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {label && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {label}
                </Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FormControl size="small" sx={{ minWidth: 70 }}>
                    <Select
                        value={hour}
                        onChange={handleHourChange}
                        displayEmpty
                        disabled={disabled}
                        sx={{
                            bgcolor: "white",
                            borderRadius: 2,
                            "& .MuiSelect-select": { py: 1, px: 1.5, textAlign: "center" }
                        }}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                    >
                        <MenuItem value="" disabled>HH</MenuItem>
                        {HOURS.map((h) => (
                            <MenuItem key={h} value={h}>
                                {h}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography sx={{ fontWeight: "bold", color: "text.secondary" }}>:</Typography>

                <FormControl size="small" sx={{ minWidth: 70 }}>
                    <Select
                        value={minute}
                        onChange={handleMinuteChange}
                        displayEmpty
                        disabled={disabled}
                        sx={{
                            bgcolor: "white",
                            borderRadius: 2,
                            "& .MuiSelect-select": { py: 1, px: 1.5, textAlign: "center" }
                        }}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                    >
                        <MenuItem value="" disabled>MM</MenuItem>
                        {MINUTES.map((m) => (
                            <MenuItem key={m} value={m}>
                                {m}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
}
