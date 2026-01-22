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
} from "@mui/material";
import PancakeStackLoader from "@/components/PancakeStackLoader";

export default function Page() {
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();

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

      setError("Greška prilikom prijave s Google računom");
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
          bgcolor: "#f5f5f5",
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
        backgroundImage: "url(/BackgroundMan.svg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          bgcolor: "white",
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
          Student login
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
            borderColor: "#dadce0",
            color: "#3c4043",
            "&:hover": {
              bgcolor: "#f8f9fa",
              borderColor: "#dadce0",
            },
          }}
        >
          {loading ? "Prijava..." : "Prijavi se s Google računom"}
        </Button>
      </Box>
    </Box>
  );
}
