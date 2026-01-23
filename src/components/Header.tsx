"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { getRestaurantName } from "@/app/admin/actions";
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import { useColorMode } from "@/components/ThemeRegistry";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useI18n } from "@/components/I18nProvider";

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const { toggleColorMode, mode } = useColorMode();
  const { lang, setLang, t } = useI18n();
  const isHomepage = pathname === "/";
  const isLoginRoute = pathname.startsWith("/login");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleLang = () => setLang(lang === "HR" ? "EN" : "HR");

  const [showHomepageHeader, setShowHomepageHeader] = useState(false);

  // Get the role from the public metadata we just set
  const userRole = user?.publicMetadata?.role as string | undefined;
  // Create the dynamic link. Default to "/" if role isn't found.
  // Students go to /student/restaurants
  const homeHref =
    userRole === "student"
      ? "/student/restaurants"
      : userRole
        ? `/${userRole}`
        : "/";

  // State for restaurant name
  const [restaurantName, setRestaurantName] = React.useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isHomepage) {
      if (isMobile) {
        // On mobile, show header immediately
        setShowHomepageHeader(true);
        return;
      }

      // Default hidden on desktop to avoid a brief flash before the reveal animation
      // sets up (and before MUI styles hydrate).
      setShowHomepageHeader(false);

      const onRevealStart = () => setShowHomepageHeader(false);
      const onRevealDone = () => setShowHomepageHeader(true);

      window.addEventListener("dd:homeRevealStart", onRevealStart);
      window.addEventListener("dd:homeRevealDone", onRevealDone);

      // Grace period: if the reveal never starts (e.g. animation not mounted), allow header to appear.
      // If the reveal is active (paused waiting for language), keep hidden until dd:homeRevealDone.
      const grace = window.setTimeout(() => {
        const isRevealActive =
          typeof document !== "undefined" &&
          document.documentElement.getAttribute("data-dd-home-reveal") === "1";
        if (!isRevealActive) setShowHomepageHeader(true);
      }, 300);

      return () => {
        window.removeEventListener("dd:homeRevealStart", onRevealStart);
        window.removeEventListener("dd:homeRevealDone", onRevealDone);
        window.clearTimeout(grace);
      };
    } else {
      setShowHomepageHeader(false);
    }
  }, [isHomepage, isMobile]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadRestaurantName() {
      if (userRole === "worker" || userRole === "manager") {
        try {
          const result = await getRestaurantName();
          if (!cancelled && result.success && result.name) {
            setRestaurantName(result.name);
          }
        } catch {
          if (!cancelled) setRestaurantName(null);
        }
      } else {
        setRestaurantName(null);
      }
    }

    loadRestaurantName();
    return () => {
      cancelled = true;
    };
  }, [userRole]);

  if (isHomepage) {
    return (
      <AppBar
        position="absolute"
        elevation={0}
        style={{
          opacity: isMobile ? 1 : showHomepageHeader ? 1 : 0,
          visibility: isMobile
            ? "visible"
            : showHomepageHeader
              ? "visible"
              : "hidden",
          pointerEvents: isMobile || showHomepageHeader ? "auto" : "none",
          transition: "opacity 600ms cubic-bezier(.4,1,.4,1)",
        }}
        sx={{
          background: "transparent",
          zIndex: 50,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            py: { xs: 1, sm: 2 },
            minHeight: { xs: "60px", sm: "64px" },
            px: { xs: 3, lg: 4 },
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "white",
            }}
          >
            <Image
              src="/logoWhite.png"
              alt="Dish Detective Logo"
              width={32}
              height={32}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                "&:hover": {
                  color: "grey.200",
                },
              }}
            >
              Dish Detective
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
            }}
          >
            <Button
              sx={{
                display: { xs: "flex", sm: "none" },
                minWidth: 0,
                padding: 0,
                bgcolor: "transparent",
                "&:hover": {
                  bgcolor: "transparent",
                },
              }}
              disableRipple
              aria-label={t("language")}
              onClick={toggleLang}
            >
              <Image
                src="/translate.png"
                alt="Translate"
                width={32}
                height={32}
                style={{ filter: "invert(1)" }}
              />
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // Non-homepage header
  // Only show dark mode toggle if user is NOT an employee/manager (so students or public on sub-pages)
  // Actually, standard behavior: if subdomain is employee, we forced light mode in ThemeRegistry.
  // We can just hide the button if role is not student, or rely on subdomain check.
  // User said "dark mode is not feature for employees".
  // Let's assume on main domain (Student), we show it.
  const showDarkModeToggle =
    userRole === "student" || (!userRole && !isLoginRoute);

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: mode === "dark" ? "background.paper" : "primary.main",
        backgroundImage: "none", // Remove default gradient if any
        transition: "background-color 0.3s ease",
        position: "relative", // Ensure z-index applies
        zIndex: (theme) => theme.zIndex.drawer + 2, // Ensure header is above sidebar
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          py: isMobile ? 1 : 2,
          minHeight: isMobile ? "60px" : "64px",
          px: { xs: 3, lg: 4 },
        }}
      >
        <Box
          component={Link}
          href={homeHref}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "white",
          }}
        >
          <Image
            src="/logoWhite.png"
            alt="Dish Detective Logo"
            width={32}
            height={32}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              "&:hover": {
                color: "grey.200",
              },
            }}
          >
            Dish Detective
          </Typography>
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 3 } }}
        >
          <Typography
            variant="body1"
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "1.1rem",
              whiteSpace: "nowrap",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            }}
          >
            {restaurantName}
          </Typography>

          {showDarkModeToggle && (
            <IconButton onClick={toggleColorMode} sx={{ color: "white" }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          )}

          <Button
            sx={{
              display: "flex",
              minWidth: 0,
              padding: 0,
              bgcolor: "transparent",
              "&:hover": {
                bgcolor: "transparent",
              },
            }}
            disableRipple
            aria-label={t("language")}
            onClick={toggleLang}
          >
            <Image
              src="/translate.png"
              alt="Translate"
              width={32}
              height={32}
              style={{ filter: "invert(1)" }}
            />
          </Button>

          {!isLoginRoute && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
