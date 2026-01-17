"use client";

import type { ReactNode } from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

interface DishCardProps {
  name: string;
  restaurantName: string;
  position: string;
  imageUrl?: string;
  allergens?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  actionMode?: "delete" | "add";
  actionDisabled?: boolean;
  showActions?: boolean;
  extraInfo?: ReactNode;
}

const DishCard = ({
  name,
  restaurantName,
  position,
  imageUrl,
  allergens = [],
  onEdit,
  onDelete,
  actionMode = "delete",
  actionDisabled = false,
  showActions = true,
  extraInfo,
}: DishCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const actionIcon =
    actionMode === "add" ? (
      <AddIcon sx={{ fontSize: 18 }} />
    ) : (
      <DeleteIcon sx={{ fontSize: 18 }} />
    );
  const actionBg = actionMode === "add" ? "success.main" : "error.main";
  const actionHoverBg = actionMode === "add" ? "success.dark" : "error.dark";

  // Mobile Layout - Horizontal card with image on left
  if (isMobile) {
    return (
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          height: 120,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: 4,
          },
        }}
      >
        {/* Image Section - Left side */}
        <Box
          sx={{
            width: 120,
            height: "100%",
            bgcolor: "grey.200",
            backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!imageUrl && (
            <Typography variant="caption" color="text.secondary">
              No Image
            </Typography>
          )}
        </Box>

        {/* Content Section - Right side */}
        <Box
          sx={{
            p: 1.5,
            flexGrow: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            gap: 1.5,
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                mb: 0.5,
                maxWidth: "100%",
                wordBreak: "break-all",
              }}
            >
              {name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                mb: 0.5,
                maxWidth: "100%",
                wordBreak: "break-all",
              }}
            >
              {restaurantName}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                mt: 0.5,
                minHeight: "18px",
              }}
            >
              {allergens.slice(0, 2).map((allergen) => (
                <Chip
                  key={allergen}
                  label={allergen}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    bgcolor: "error.light",
                    color: "white",
                  }}
                />
              ))}
              {allergens.length > 2 && (
                <Chip
                  label={`+${allergens.length - 2}`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    bgcolor: "grey.400",
                    color: "white",
                  }}
                />
              )}
            </Box>

            {!showActions && extraInfo && (
              <Typography
                variant="body2"
                sx={{ mt: "auto", pt: 1, fontWeight: 700, color: "text.secondary" }}
              >
                {extraInfo}
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          {showActions && onDelete && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              {onEdit && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  size="small"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    width: 32,
                    height: 32,
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                size="small"
                disabled={actionDisabled}
                sx={{
                  bgcolor: actionBg,
                  color: "white",
                  width: 32,
                  height: 32,
                  "&:hover": {
                    bgcolor: actionHoverBg,
                  },
                  "&.Mui-disabled": {
                    bgcolor: "grey.400",
                    color: "white",
                    opacity: 1,
                    cursor: "not-allowed",
                  },
                }}
              >
                {actionIcon}
              </IconButton>
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  // Desktop Layout - Vertical card with image on top
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 380,
        maxHeight: 380,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Image Section */}
      <Box
        sx={{
          width: "100%",
          height: 160,
          flexShrink: 0,
          bgcolor: "grey.200",
          backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!imageUrl && (
          <Typography variant="body2" color="text.secondary">
            No Image
          </Typography>
        )}
      </Box>

      {/* Content Section */}
      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              maxWidth: "100%",
              wordBreak: "break-all",
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              maxWidth: "100%",
              wordBreak: "break-all",
            }}
          >
            {restaurantName}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: 1,
              minHeight: "2.5em",
              maxHeight: "2.5em",
              lineHeight: "1.25em",
              wordBreak: "break-word",
            }}
          >
            {position}
          </Typography>

          {/* Allergens (reserve space even when empty) */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              mb: 1,
              minHeight: "24px",
            }}
          >
            {allergens.slice(0, 3).map((allergen) => (
              <Chip
                key={allergen}
                label={allergen}
                size="small"
                sx={{
                  height: 20,
                  bgcolor: "error.light",
                  color: "white",
                  fontSize: "0.7rem",
                }}
              />
            ))}
            {allergens.length > 3 && (
              <Chip
                label={`+${allergens.length - 3}`}
                size="small"
                sx={{
                  height: 20,
                  bgcolor: "grey.400",
                  color: "white",
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ mt: "auto" }}>
          {!showActions && extraInfo && (
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                maxWidth: "100%",
                wordBreak: "break-word",
                fontWeight: 700,
                color: "text.secondary",
              }}
            >
              {extraInfo}
            </Typography>
          )}

          {/* Action Buttons */}
          {showActions && onDelete && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 1.5,
              }}
            >
              {onEdit && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  sx={{
                    flex: 1,
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={actionDisabled}
                sx={{
                  flex: 1,
                  bgcolor: actionBg,
                  color: "white",
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: actionHoverBg,
                  },
                  "&.Mui-disabled": {
                    bgcolor: "grey.400",
                    color: "white",
                    opacity: 1,
                    cursor: "not-allowed",
                  },
                }}
              >
                {actionMode === "add" ? <AddIcon /> : <DeleteIcon />}
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default DishCard;
