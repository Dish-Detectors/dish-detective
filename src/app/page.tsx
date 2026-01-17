"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import {
  Box,
  Button,
  Typography,
  Menu,
  MenuItem,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import PancakeStackLoader from "@/components/PancakeStackLoader";
import HomeRevealAnimation from "@/components/HomeRevealAnimation";
import HomeRevealGate from "@/components/HomeRevealGate";
import CardSwap, { Card } from "@/components/CardSwap";
import { getUserRole } from "./actions";

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [checkingRole, setCheckingRole] = useState(true);

  // Typewriter effect for subtitle
  const fullSubtitle = "Real-time jelovnik u restoranima";
  const [subtitleText, setSubtitleText] = useState("");

  // Used for main login dropdown
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  // Used for top-right (mini) login dropdown
  const [anchorElTop, setAnchorElTop] = React.useState<null | HTMLElement>(
    null,
  );
  const openTop = Boolean(anchorElTop);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isShortScreen = useMediaQuery("(max-height: 740px)");
  const showDesktopCards = useMediaQuery("(min-width: 1400px)");

  const [cardSwapLayout, setCardSwapLayout] = useState(() => ({
    cardWidth: 520,
    cardHeight: 340,
    wrapperWidth: 590,
    wrapperHeight: 460,
    cardDistance: 55,
    verticalDistance: 65,
  }));

  const cardSwapImageSizes = `${cardSwapLayout.cardWidth}px`;

  useEffect(() => {
    if (!showDesktopCards) return;

    const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(max, value));
    let rafId = 0;

    const recompute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Scale mostly with width, but cap by height so it doesn't get cramped on short screens.
      const cardWidth = clamp(520, Math.round(vw * 0.33), 780);
      const idealCardHeight = cardWidth * (340 / 520);
      const maxCardHeight = Math.min(540, Math.round(vh * 0.58));
      const cardHeight = clamp(340, Math.round(idealCardHeight), maxCardHeight);

      // Keep roughly the same extra breathing room as before: +60w / +120h.
      const wrapperWidth = cardWidth + 70;
      const wrapperHeight = cardHeight + 130;

      const cardDistance = clamp(55, Math.round(cardWidth * 0.12), 90);
      const verticalDistance = clamp(65, Math.round(cardHeight * 0.22), 110);

      setCardSwapLayout({
        cardWidth,
        cardHeight,
        wrapperWidth,
        wrapperHeight,
        cardDistance,
        verticalDistance,
      });
    };

    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(recompute);
    };

    recompute();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    };
  }, [showDesktopCards]);

  const typingFinished = subtitleText.length >= fullSubtitle.length;

  // Typewriter effect
  useEffect(() => {
    const startDelay = isMobile ? 0 : 1850; // Start immediately on mobile
    const timer = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        setSubtitleText(fullSubtitle.slice(0, index + 1));
        index++;
        if (index >= fullSubtitle.length) {
          clearInterval(interval);
        }
      }, 50); // Typing speed
    }, startDelay);
    return () => clearTimeout(timer);
  }, [fullSubtitle, isMobile]);

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    async function checkUserRole() {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        // Fetch user role using server action
        const { role, error } = await getUserRole();

        if (role) {
          switch (role) {
            case "admin":
              router.push("/admin");
              return;
            case "manager":
              router.push("/manager");
              return;
            case "worker":
              router.push("/worker");
              return;
            case "student":
              router.push("/student");
              return;
          }
        }

        if (error) {
          console.error("Error fetching user role:", error);
        }
      }

      setCheckingRole(false);
    }

    checkUserRole();
  }, [isLoaded, isSignedIn, user, router]);

  // Show loading while checking authentication
  if (!isLoaded || checkingRole) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <Box sx={{ width: 200, height: 200 }}>
          <PancakeStackLoader />
        </Box>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          backgroundImage: `url(/mobilebg.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: 4,
              padding: 4,
              maxWidth: "90%",
              boxShadow: 3,
              mt: 2,
              mb: 2,
              "@media (max-height: 740px)": {
                mt: 5,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                component="img"
                src="logoDark.png"
                alt="Dish Detective Logo"
                sx={{
                  width: "18vh",
                  height: "18vh",
                  mb: 1,
                  "@media (min-height: 900px)": {
                    width: "20vh",
                    height: "20vh",
                  },
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  color: "#000000d4",
                  fontWeight: 750,
                  textAlign: "center",
                }}
              >
                Dish Detective
              </Typography>
            </Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                color: "#000000d4",
                mb: 2,
                textAlign: "center",
                letterSpacing: -1,
                fontSize: { xs: "6vh" },
              }}
            >
              Poboljšaj svoje iskustvo u menzi
            </Typography>

            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mb: 3,
                color: "#3c403d",
                textAlign: "center",
                fontSize: { xs: "1.1rem" },
              }}
            >
              <span className="ddTypewriterText">{subtitleText}</span>
              <span
                className={
                  typingFinished
                    ? "ddTypewriterCaret ddTypewriterCaret--idle"
                    : "ddTypewriterCaret"
                }
                aria-hidden="true"
              />
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              fullWidth
              sx={{
                fontWeight: 600,
                borderRadius: 3,
                minHeight: 50,
                textTransform: "none",
              }}
            >
              Prijava
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              // We make the menu open upwards on short screens
              // TODO: Think of a better responsive fix, I guess?
              anchorOrigin={{
                vertical: isShortScreen ? "top" : "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: isShortScreen ? "bottom" : "top",
                horizontal: "center",
              }}
              slotProps={{
                list: {
                  disablePadding: true,
                },
                paper: {
                  sx: { minWidth: 300, mt: 1, borderRadius: 2 },
                },
              }}
            >
              <MenuItem
                onClick={() => router.push("/login/employee")}
                sx={{ fontSize: "1.2rem", py: 1.2 }}
              >
                <RestaurantIcon fontSize="small" sx={{ mr: 1 }} /> Radnik u menzi
              </MenuItem>
              <Box sx={{ borderBottom: "1px solid black", my: 0 }} />
              <MenuItem
                onClick={() => router.push("/login/student")}
                sx={{ fontSize: "1.2rem", py: 1.2 }}
              >
                <SchoolIcon fontSize="small" sx={{ mr: 1 }} /> Student
              </MenuItem>
            </Menu>
          </Box>
      </Box>
    );
  }

  // Desktop layout
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 10,
        backgroundImage: `url(/desktopbg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 0.95,
      }}
    >
      <HomeRevealAnimation />
      <HomeRevealGate>
        {/* This overlay box makes the background a bit darker */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.13)",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            zIndex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            pr: "clamp(80px, 6vw, 200px)",
          }}
        >
          <Box sx={{ maxWidth: 600 }}>
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                color: "white",
                mb: 2,
                lineHeight: 1.2,
                wordBreak: "break-word",
                letterSpacing: -1,
              }}
            >
              Poboljšaj svoje iskustvo u menzi
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mb: 3,
                color: "lightgrey",
                letterSpacing: 1.2,
              }}
            >
              <span className="ddTypewriterText">{subtitleText}</span>
              <span
                className={
                  typingFinished
                    ? "ddTypewriterCaret ddTypewriterCaret--idle"
                    : "ddTypewriterCaret"
                }
                aria-hidden="true"
              />
            </Typography>

            <Stack spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  fontWeight: 600,
                  borderRadius: 3,
                  width: "25%",
                  minHeight: 45,
                  color: "white",
                  textTransform: "none",
                }}
              >
                Prijava
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                slotProps={{
                  list: {
                    disablePadding: true,
                  },
                  paper: {
                    sx: { minWidth: 300, mt: 1, borderRadius: 2 },
                  },
                }}
              >
                <MenuItem
                  onClick={() => router.push("/login/employee")}
                  sx={{ fontSize: "1rem", py: 1.2, display: "flex", alignItems: "center" }}
                >
                  <RestaurantIcon fontSize="small" sx={{ mr: 1 }} /> Radnik u menzi
                </MenuItem>
                <Box sx={{ borderBottom: "1px solid black", my: 0 }} />
                <MenuItem
                  onClick={() => router.push("/login/student")}
                  sx={{ fontSize: "1rem", py: 1.2, display: "flex", alignItems: "center" }}
                >
                  <SchoolIcon fontSize="small" sx={{ mr: 1 }} /> Student
                </MenuItem>
              </Menu>
            </Stack>
          </Box>

          <Box
            sx={{
              position: "relative",
              width: cardSwapLayout.wrapperWidth,
              height: cardSwapLayout.wrapperHeight,
              flex: "0 0 auto",
              display: "none",
              "@media (min-width: 1400px)": {
                display: "block",
              },
            }}
            aria-hidden="true"
          >
            <CardSwap
              width={cardSwapLayout.cardWidth}
              height={cardSwapLayout.cardHeight}
              cardDistance={cardSwapLayout.cardDistance}
              verticalDistance={cardSwapLayout.verticalDistance}
              delay={5200}
              pauseOnHover
            >
              <Card
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  borderRadius: 18,
                  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                  overflow: "hidden",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ p: 1.5, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 4,
                      borderRadius: 999,
                      background: "#56AAF5",
                      mb: 1,
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#111827", lineHeight: 1.1 }}>
                    Real-time meni
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.75,
                      width: "100%",
                      aspectRatio: "1380 / 780",
                      borderRadius: 2,
                      background: "#f6f7f9",
                      border: "1px solid rgba(0,0,0,0.10)",
                      overflow: "hidden",
                      p: 0,
                    }}
                  >
                    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                      <Image
                        src="/menuview.png"
                        alt="Student view"
                        fill
                        sizes={cardSwapImageSizes}
                        style={{ objectFit: "contain", objectPosition: "center" }}
                        priority
                      />
                    </Box>
                  </Box>
                </Box>
              </Card>

              <Card
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  borderRadius: 18,
                  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                  overflow: "hidden",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ p: 1.5, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 4,
                      borderRadius: 999,
                      background: "#56AAF5",
                      mb: 1,
                      opacity: 0.9,
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#111827", lineHeight: 1.1 }}>
                    Jednostavan pregled menzi
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.75,
                      width: "100%",
                      aspectRatio: "1380 / 780",
                      borderRadius: 2,
                      background: "#f6f7f9",
                      border: "1px solid rgba(0,0,0,0.10)",
                      overflow: "hidden",
                      p: 0,
                    }}
                  >
                    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                      <Image
                        src="/menzamap.png"
                        alt="Menza map"
                        fill
                        sizes={cardSwapImageSizes}
                        style={{ objectFit: "contain", objectPosition: "center" }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Card>

              <Card
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  borderRadius: 18,
                  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                  overflow: "hidden",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ p: 1.75, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 4,
                      borderRadius: 999,
                      background: "#56AAF5",
                      mb: 1,
                      opacity: 0.85,
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#111827", lineHeight: 1.1 }}>
                    Obavijesti u stvarnom vremenu
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      mt: 0.75,
                      aspectRatio: "1380 / 780",
                      borderRadius: 2,
                      background: "#f6f7f9",
                      border: "1px solid rgba(0,0,0,0.10)",
                      overflow: "hidden",
                      p: 0,
                    }}
                  >
                    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                      <Image
                        src="/notification.png"
                        alt="Notifications"
                        fill
                        sizes={cardSwapImageSizes}
                        style={{ objectFit: "contain", objectPosition: "center" }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Card>
            </CardSwap>
          </Box>
        </Box>
      </HomeRevealGate>
    </Box>
  );
}
