"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Box } from "@mui/material";
import PancakeStackLoader from "@/components/PancakeStackLoader";

export default function SSOCallback() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ width: 200, height: 200 }}>
        <PancakeStackLoader />
      </Box>
      <AuthenticateWithRedirectCallback />
    </Box>
  );
}
