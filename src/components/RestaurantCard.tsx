"use client";

import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";

interface RestaurantCardProps {
  name: string;
  address: string;
  managerName?: string;
  imageUrl: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RestaurantCard({
  name,
  address,
  managerName,
  imageUrl,
  onEdit,
  onDelete,
}: RestaurantCardProps) {
  const buttonStyle = {
    flex: 1,
    borderRadius: 2.5,
    boxShadow: "none",
    minWidth: "auto",
    py: 1,
    "&:hover": { boxShadow: "none" },
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "none",
        border: "1px solid #eee",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={imageUrl || "/placeholder-restaurant.jpg"}
          alt={name}
          sx={{ bgcolor: "#f0f0f0", objectFit: "cover" }}
        />
      </Box>

      <CardContent
        sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
          {name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
          <PlaceIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {address}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            Voditelj: {managerName || "Nije dodijeljen"}
          </Typography>
        </Box>



        <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{
              ...buttonStyle,
              bgcolor: "#4EA7F0", // Custom blue color
              "&:hover": { bgcolor: "#3B8ED0" },
            }}
          >
            <EditIcon sx={{ color: "white" }} />
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              ...buttonStyle,
              bgcolor: "#D33939",
              "&:hover": { bgcolor: "#B72B2B" },
            }}
          >
            <DeleteIcon sx={{ color: "white" }} />
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
