"use client";

import React, { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { useI18n } from "@/components/I18nProvider";

export default function Page() {
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { t: tr } = useI18n();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Wait for Clerk to load
    if (isLoaded) {
      // Small delay to ensure background image is loaded
      const timer = setTimeout(() => {
        setPageLoaded(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: "/auth/redirect",
      });
    } catch (err: any) {
      console.error("Google login error:", err);

      // Check for specific Clerk error "You're already signed in."
      const errors = err.errors || [];
      const alreadySignedIn = errors.some(
        (e: any) => e.message === "You're already signed in.",
      );

      if (alreadySignedIn) {
        // If they are already signed in, redirect them to the role-based redistribution page
        router.push("/auth/redirect");
        return;
      }

      setError(tr("googleLoginError"));
      setLoading(false);
    }
  };

  if (!pageLoaded) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <PancakeStackLoader />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(/${isDarkMode ? "BackgroundMan-dark" : "BackgroundMan"}.svg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        p: 3,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          bgcolor: "background.paper",
          borderRadius: 3,
          p: 4,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 4,
            textAlign: "center",
          }}
        >
          {tr("studentLoginTitle")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <div id="clerk-captcha" />
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleGoogleSignIn}
          disabled={loading || !isLoaded}
          startIcon={
            loading ? (
              <CircularProgress size={20} />
            ) : (
              <img
                src="/google_logo.svg.png"
                alt="Google"
                width="20"
                height="20"
                style={{ display: "block" }}
              />
            )
          }
          sx={{
            py: 1.5,
            textTransform: "none",
            fontSize: "1.1rem",
            fontWeight: 600,
            transition: "all 0.2s ease",
            ...(isDarkMode
              ? {
                // Dark Mode Google Button Styles
                bgcolor: "#131314",
                borderColor: "#8e918f",
                color: "#e3e3e3",
                "&:hover": {
                  bgcolor: "#131314", // Keep generic background, lighten via opacity or overlay in real implementations, but here simple
                  borderColor: "#d2e3fc",
                  backgroundImage:
                    "linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))",
                },
              }
              : {
                // Light Mode Google Button Styles
                borderColor: "#dadce0",
                color: "#3c4043",
                "&:hover": {
                  bgcolor: "#f8f9fa",
                  borderColor: "#dadce0",
                },
              }),
          }}
        >
          {loading ? tr("signingIn") : tr("loginWithGoogle")}
        </Button>
      </Box>
    </Box>
  );
}
