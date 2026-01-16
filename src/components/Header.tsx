"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs"; // Import useUser
import {
  Menu,
  MenuItem,
  Box,
  AppBar,
  Toolbar,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser(); // Get the user data from Clerk

  const isHomepage = pathname === "/";
  const isLoginRoute = pathname.startsWith("/login");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [showHomepageHeader, setShowHomepageHeader] = useState(false);

  useEffect(() => {
    if (isHomepage) {
      if (isMobile) {
        // On mobile, show header immediately
        setShowHomepageHeader(true);
        return;
      }
      setShowHomepageHeader(false); // Reset to hidden when navigating to homepage
      const timeout = setTimeout(() => setShowHomepageHeader(true), 1850);
      return () => clearTimeout(timeout);
    } else {
      setShowHomepageHeader(false);
    }
  }, [isHomepage, isMobile]);

  if (isHomepage) {
    // ... (Homepage header remains unchanged)
    return (
      <AppBar
        position="absolute"
        elevation={0}
        sx={{
          background: "transparent",
          zIndex: 50,
          opacity: isMobile ? 1 : showHomepageHeader ? 1 : 0,
          transition: "opacity 600ms cubic-bezier(.4,1,.4,1)",
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
              ...(isMobile && { color: "black" }),
            }}
          >
            <Image
              src={isMobile ? "/logoDark.png" : "/logoWhite.png"}
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
                  ...(isMobile && { color: "grey.700" }),
                },
              }}
            >
              Dish Detective
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: { xs: 2, md: 3 } }}>
            <Button
              variant="contained"
              sx={{
                display: { xs: "none", sm: "flex" },
                bgcolor: "white",
                color: "black",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "grey.200",
                },
              }}
            >
              Kontakt
            </Button>

            <Button
              aria-controls={open ? "prijava-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              variant="contained"
              sx={{
                display: { xs: "none", sm: "flex" },
                bgcolor: isMobile ? "#56aaf4" : "#ff8c00",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  bgcolor: isMobile ? "#4a94db" : "#f18501ff",
                },
              }}
            >
              Prijava
            </Button>

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
            >
              <Image
                src="/translate.png"
                alt="Translate"
                width={32}
                height={32}
              />
            </Button>

            <Menu
              id="prijava-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: { minWidth: 200, mt: 1, borderRadius: 2 },
                },
                list: {
                  "aria-labelledby": "prijava-button",
                },
              }}
            >
              <MenuItem onClick={() => router.push("/login/employee")}>
                Radnik u menzi
              </MenuItem>
              <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 0 }} />
              <MenuItem onClick={() => router.push("/login/student")}>
                Student
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // --- CHANGES ARE IN THIS SECTION ---

  // Get the role from the public metadata we just set
  const userRole = user?.publicMetadata?.role as string;
  // Create the dynamic link. Default to "/" if role isn't found.
  const homeHref = userRole ? `/${userRole}` : "/";
  const isWorker = userRole === "worker" || pathname.startsWith("/worker");

  // Non-homepage header (blue header)
  return (
    <AppBar position="static" sx={{ bgcolor: "#56aaf4" }}>
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
          href={homeHref} // Use the dynamic homeHref here
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

        <Box sx={{ display: "flex", gap: { xs: 2, md: 3 } }}>
          {isWorker && (
            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                color: "white",
                fontWeight: 600,
                whiteSpace: "nowrap",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              Ime menze u kojoj radi
            </Typography>
          )}

          <Button
            sx={{
              display: { xs: "none", sm: "flex" },
              minWidth: 0,
              padding: 0,
              bgcolor: "transparent",
              "&:hover": {
                bgcolor: "transparent",
              },
            }}
            disableRipple
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
