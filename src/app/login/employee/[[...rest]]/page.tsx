"use client";

import React, { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import PancakeStackLoader from "@/components/PancakeStackLoader";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: username,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/auth/redirect");
      } else {
        setError("Neuspješna prijava. Provjerite korisničko ime i lozinku.");
      }
    } catch (err: any) {
      console.error("Login error:", err);

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

      setError("Neispravno korisničko ime ili lozinka");
    } finally {
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
          Zaposlenik login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Lozinka"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !isLoaded}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              bgcolor: "#56aaf5",
              "&:hover": {
                bgcolor: "#2684c5",
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Prijava...
              </>
            ) : (
              "Prijavi se"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
