"use client";

import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PancakeStackLoader from "@/components/PancakeStackLoader";

interface SuccessScreenProps {
  message: string;
  showLoader?: boolean;
  onContinue?: () => void;
  continueText?: string;
  title?: string;
}

export default function SuccessScreen({
  message,
  showLoader = true,
  onContinue,
  continueText,
  title,
}: SuccessScreenProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          bgcolor: "white",
          p: 6,
          borderRadius: 3,
          boxShadow: 2,
          maxWidth: 500,
        }}
      >
        {/* Pancake Loader */}
        {showLoader && (
          <Box
            sx={{
              width: 200,
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PancakeStackLoader />
          </Box>
        )}

        {/* Checkmark Icon */}
        <CheckCircleIcon
          sx={{
            fontSize: 100,
            color: "#4caf50",
            animation: "scaleIn 0.5s ease-out",
            "@keyframes scaleIn": {
              from: {
                transform: "scale(0)",
                opacity: 0,
              },
              to: {
                transform: "scale(1)",
                opacity: 1,
              },
            },
          }}
        />

        {/* Success Message */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "#4caf50",
            textAlign: "center",
          }}
        >
          {message}
        </Typography>

        {/* Redirect Notice */}
        {/* Redirect Notice or Continue Button */}
        {onContinue ? (
          <Box
            component="button"
            onClick={onContinue}
            sx={{
              mt: 2,
              px: 4,
              py: 1.5,
              bgcolor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: 2,
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                bgcolor: "#43a047",
                transform: "scale(1.05)",
              },
            }}
          >
            {continueText || "Nastavi"}
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            Preusmjeravanje...
          </Typography>
        )}
      </Box>
    </Box>
  );
}
