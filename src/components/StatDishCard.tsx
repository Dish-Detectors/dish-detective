"use client";

import React from "react";
import { Paper, Box, Typography, Avatar } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";

interface StatDishCardProps {
    name: string;
    imageUrl?: string;
    count: number;
}

const StatDishCard = ({ name, imageUrl, count }: StatDishCardProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                p: 1.5,
                bgcolor: "white",
                border: "1px solid #e0e0e0",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderColor: "primary.main",
                    transform: "translateY(-1px)",
                },
            }}
        >
            {/* Image Section */}
            <Avatar
                src={imageUrl}
                variant="rounded"
                sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "grey.100",
                    mr: 2,
                    border: "1px solid #f0f0f0",
                }}
            >
                {!imageUrl && (
                    <Typography variant="caption" color="text.secondary">
                        N/A
                    </Typography>
                )}
            </Avatar>

            {/* Name Section */}
            <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
                <Typography
                    variant="subtitle1"
                    title={name}
                    sx={{
                        fontWeight: 600,
                        color: "#212222",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {name.length > 40 ? `${name.substring(0, 37)}...` : name}
                </Typography>
            </Box>

            {/* Count Section */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: "aliceblue",
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "primary.light",
                    flexShrink: 0,
                }}
            >
                <PeopleIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        lineHeight: 1,
                    }}
                >
                    {count}
                </Typography>
            </Box>
        </Paper>
    );
};

export default StatDishCard;
