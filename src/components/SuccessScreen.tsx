"use client";

import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { useI18n } from "@/components/I18nProvider";

interface SuccessScreenProps {
  message: string;
  showLoader?: boolean;
}

export default function SuccessScreen({
  message,
  showLoader = true,
}: SuccessScreenProps) {
  const { t } = useI18n();

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
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          {t("redirecting")}
        </Typography>
      </Box>
    </Box>
  );
}
