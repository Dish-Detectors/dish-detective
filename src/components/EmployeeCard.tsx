"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"; // Manager Icon
import PersonIcon from "@mui/icons-material/Person"; // Worker Icon
import RestaurantIcon from "@mui/icons-material/Restaurant";

interface EmployeeCardProps {
  id: string;
  firstName: string;
  lastName: string;
  restaurantName: string;
  role: "manager" | "worker" | null;
  imageUrl?: string;
  restaurantImage?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function EmployeeCard({
  id,
  firstName,
  lastName,
  restaurantName,
  role,
  imageUrl,
  restaurantImage,
  onEdit,
  onDelete,
}: EmployeeCardProps) {
  let displayRole = "Nije pridodijeljen";
  if (role === "manager") displayRole = "Voditelj";
  if (role === "worker") displayRole = "Radnik";

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
          "& .employee-avatar": {
            transform: "scale(1.15)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 160,
          overflow: "hidden",
          bgcolor: "#f5f5f5",
        }}
      >
        {restaurantImage && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${restaurantImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <Avatar
            className="employee-avatar"
            src={imageUrl}
            sx={{
              width: 90,
              height: 90,
              border: "4px solid white",
              boxShadow: 2,
              bgcolor: role === "manager" ? "#64b5f6" : "#ba68c8",
              transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {!imageUrl &&
              (role === "manager" ? (
                <AssignmentIndIcon sx={{ fontSize: 50, color: "white" }} />
              ) : (
                <PersonIcon sx={{ fontSize: 50, color: "white" }} />
              ))}
          </Avatar>
        </Box>
      </Box>

      <CardContent
        sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
          {firstName} {lastName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
          <RestaurantIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {restaurantName || "Nije dodijeljen"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {displayRole}
          </Typography>
        </Box>

        <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
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
              onDelete(id);
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
