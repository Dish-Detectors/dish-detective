"use client";

import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useContext,
} from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const ColorModeContext = createContext({
  toggleColorMode: () => { },
  mode: "light" as "light" | "dark",
});

export const useColorMode = () => useContext(ColorModeContext);

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  // Load saved preference
  useEffect(() => {
    // Check if on employee subdomain - if so, force light mode
    if (
      typeof window !== "undefined" &&
      window.location.hostname.startsWith("employee.")
    ) {
      setMode("light");
      return;
    }

    const savedMode = localStorage.getItem("themeMode");
    if (savedMode === "dark" || savedMode === "light") {
      setMode(savedMode);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setMode("dark");
    }
  }, []);

  // Sync with Tailwind
  useEffect(() => {
    // Ensure we force light if on employee subdomain even if state changes
    if (
      typeof window !== "undefined" &&
      window.location.hostname.startsWith("employee.") &&
      mode === "dark"
    ) {
      setMode("light");
      return;
    }

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#56aaf5",
          },
          ...(mode === "dark" && {
            background: {
              default: "#0f172a", // Slate 900
              paper: "#1e293b", // Slate 800
            },
            text: {
              primary: "#f8fafc", // Slate 50
              secondary: "#94a3b8", // Slate 400
            },
            divider: "rgba(255, 255, 255, 0.12)",
          }),
        },
        typography: {
          fontFamily: "Roboto, sans-serif",
          h2: {
            fontWeight: 700,
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                // Ensure AppBar uses the correct background in dark mode if not overridden
                ...(mode === "dark" && {
                  backgroundColor: "#1e293b",
                }),
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
