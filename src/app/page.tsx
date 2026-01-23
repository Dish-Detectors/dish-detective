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
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SchoolIcon from "@mui/icons-material/School";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import HomeRevealAnimation from "@/components/HomeRevealAnimation";
import HomeRevealGate from "@/components/HomeRevealGate";
import CardSwap, { Card } from "@/components/CardSwap";
import Aurora from "@/components/Aurora";
import { getUserRole } from "./actions";
import { LANDING_IMAGES } from "@/constants/assets";
import { useI18n } from "@/components/I18nProvider";

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [checkingRole, setCheckingRole] = useState(true);
  const { t: tr } = useI18n();

  const [isEmployeeDomain, setIsEmployeeDomain] = useState(false);

  // Typewriter effect for subtitle
  const fullSubtitle = tr("heroSubtitle");
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
  // Show cards on mobile too
  const showCards = true;

  // Prevent scrollbars from appearing during reveal/card animations
  useEffect(() => {
    if (typeof document === "undefined") return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyOverflowX = document.body.style.overflowX;
    const prevBodyOverflowY = document.body.style.overflowY;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";
    document.body.classList.add("dd-home-no-scroll");

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.overflowX = prevBodyOverflowX;
      document.body.style.overflowY = prevBodyOverflowY;
      document.body.classList.remove("dd-home-no-scroll");
    };
  }, []);

  const [cardSwapLayout, setCardSwapLayout] = useState(() => ({
    cardWidth: 500,
    cardHeight: 327,
    wrapperWidth: 560,
    wrapperHeight: 447,
    cardDistance: 52,
    verticalDistance: 62,
  }));

  const cardSwapImageSizes = `${cardSwapLayout.cardWidth}px`;

  useEffect(() => {
    if (!showCards) return;

    const clamp = (min: number, value: number, max: number) =>
      Math.max(min, Math.min(max, value));
    let rafId = 0;

    const recompute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (vw < 900) {
        // Mobile sizing logic
        const cardWidth = clamp(280, Math.round(vw * 0.85), 450);
        const cardHeight = Math.round(cardWidth * (340 / 520));

        const wrapperWidth = cardWidth + 40;
        const wrapperHeight = cardHeight + 80;

        const cardDistance = clamp(30, Math.round(cardWidth * 0.08), 50);
        const verticalDistance = clamp(40, Math.round(cardHeight * 0.15), 60);

        setCardSwapLayout({
          cardWidth,
          cardHeight,
          wrapperWidth,
          wrapperHeight,
          cardDistance,
          verticalDistance,
        });
      } else {
        // Desktop sizing logic
        // Scale mostly with width, but cap by height so it doesn't get cramped on short screens.
        const cardWidth = clamp(500, Math.round(vw * 0.32), 740);
        const idealCardHeight = cardWidth * (340 / 520);
        const maxCardHeight = Math.min(540, Math.round(vh * 0.58));
        const cardHeight = clamp(
          327,
          Math.round(idealCardHeight),
          maxCardHeight,
        );

        // Keep roughly the same extra breathing room as before: +60w / +120h.
        const wrapperWidth = cardWidth + 60;
        const wrapperHeight = cardHeight + 120;

        const cardDistance = clamp(52, Math.round(cardWidth * 0.12), 86);
        const verticalDistance = clamp(62, Math.round(cardHeight * 0.22), 104);

        setCardSwapLayout({
          cardWidth,
          cardHeight,
          wrapperWidth,
          wrapperHeight,
          cardDistance,
          verticalDistance,
        });
      }
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
  }, [showCards]);

  const typingFinished = subtitleText.length >= fullSubtitle.length;

  const [homeRevealDone, setHomeRevealDone] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setHomeRevealDone(true);
      return;
    }

    const onStart = () => {
      setHomeRevealDone(false);
      setSubtitleText("");
    };
    const onDone = () => setHomeRevealDone(true);

    window.addEventListener("dd:homeRevealStart", onStart);
    window.addEventListener("dd:homeRevealDone", onDone);
    return () => {
      window.removeEventListener("dd:homeRevealStart", onStart);
      window.removeEventListener("dd:homeRevealDone", onDone);
    };
  }, [isMobile]);

  // Typewriter effect
  useEffect(() => {
    if (!homeRevealDone) {
      setSubtitleText("");
      return;
    }

    const startDelay = 0;
    let intervalId: number | null = null;
    const timer = setTimeout(() => {
      let index = 0;
      intervalId = window.setInterval(() => {
        setSubtitleText(fullSubtitle.slice(0, index + 1));
        index++;
        if (index >= fullSubtitle.length) {
          if (intervalId != null) window.clearInterval(intervalId);
          intervalId = null;
        }
      }, 50); // Typing speed
    }, startDelay);
    return () => {
      clearTimeout(timer);
      if (intervalId != null) window.clearInterval(intervalId);
    };
  }, [fullSubtitle, homeRevealDone]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsEmployeeDomain(window.location.hostname.startsWith("employee."));
    }
  }, []);

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
              router.push("/student/restaurants");
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

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: { xs: 0, lg: 10 },
        bgcolor: "black",
        overflowX: "hidden", // Prevent horizontal scroll
        overflowY: "hidden", // Prevent vertical scroll
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: { xs: "250%", md: "100%" },
            height: "100%",
            position: "relative",
            left: { xs: "50%", md: 0 },
            transform: { xs: "translateX(-50%)", md: "none" },
          }}
        >
          <Aurora
            colorStops={["#0c7fdb", "#57aaf5", "#f8a44b"]}
            amplitude={1.0}
            blend={0.75}
          />
        </Box>
      </Box>
      <HomeRevealGate>
        {/* This overlay box makes the background a bit darker */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            zIndex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "center",
            // On mobile, use space-evenly to distribute available vertical space
            justifyContent: { xs: "space-evenly", lg: "space-between" },
            gap: { xs: 1, lg: 12 }, // Smaller vertical gap on mobile, larger on desktop
            pr: { xs: 0, lg: "clamp(70px, 2vw, 180px)" },
            pt: { xs: 2, lg: 0 }, // Minimal top padding to push text up
            pb: { xs: 2, lg: 0 }, // Reduced bottom padding (was 4)
          }}
        >
          <Box
            sx={{
              maxWidth: 600,
              width: "100%",
              px: { xs: 4, lg: 0 },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", lg: "flex-start" },
              textAlign: { xs: "center", lg: "left" },
            }}
          >
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                color: "white",
                mb: 1, // Reduced margin
                lineHeight: 1.1, // Tighter line height
                wordBreak: "break-word",
                letterSpacing: -1,
                fontSize: { xs: "2.5rem", sm: "3.75rem" }, // Smaller font on mobile
              }}
            >
              {tr("heroTitle")}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mb: { xs: 1, sm: 2 }, // Smaller bottom margin on mobile
                color: "lightgrey",
                letterSpacing: 1.2,
                fontSize: { xs: "1rem", sm: "1.5rem" }, // Smaller subtitle
                minHeight: { xs: "2rem", sm: "auto" },
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

            {/* Desktop Button - Hidden on Mobile */}
            <Stack
              spacing={2}
              sx={{
                width: "100%",
                alignItems: "flex-start",
                display: { xs: "none", lg: "flex" },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (isEmployeeDomain) {
                    router.push("/login/employee");
                  } else {
                    router.push("/login/student");
                  }
                }}
                sx={{
                  fontWeight: 600,
                  borderRadius: 999,
                  width: { xs: "100%", sm: "auto", lg: 220 },
                  minWidth: { sm: 140 },
                  px: { sm: 4 },
                  minHeight: 45,
                  color: "white",
                  textTransform: "none",
                }}
              >
                {tr("login")}
              </Button>
            </Stack>
          </Box>

          {!isMobile && (
            <Box
              sx={{
                position: "relative",
                width: cardSwapLayout.wrapperWidth,
                height: cardSwapLayout.wrapperHeight,
                flex: "0 1 auto", // Allow shrinking if absolutely needed
                display: "block",
                mx: { xs: "auto", lg: 0 },
                ml: { lg: "auto" },
                mt: { xs: 8, lg: 0 }, // Verified gap on mobile
              }}
              aria-hidden="true"
            >
              <CardSwap
                appearDelayMs={250}
                width={cardSwapLayout.cardWidth}
                height={cardSwapLayout.cardHeight}
                cardDistance={cardSwapLayout.cardDistance}
                verticalDistance={cardSwapLayout.verticalDistance}
                delay={5200}
                pauseOnHover
                staggerFadeIn
                staggerFadeInDelayMs={60}
                staggerFadeInEachMs={120}
                staggerFadeInDurationSec={0.55}
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
                <Box
                  sx={{
                    p: 1.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 4,
                      borderRadius: 999,
                      background: "#56AAF5",
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{ color: "#111827", lineHeight: 1.1 }}
                  >
                    {tr("cardRealTimeMeni")}
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
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Image
                        src={LANDING_IMAGES.REAL_TIME_MENU}
                        alt="Student view"
                        fill
                        sizes={cardSwapImageSizes}
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
                        }}
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
                <Box
                  sx={{
                    p: 1.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
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
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{ color: "#111827", lineHeight: 1.1 }}
                  >
                    {tr("cardOverview")}
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
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Image
                        src={LANDING_IMAGES.OVERVIEW}
                        alt="Menza map"
                        fill
                        sizes={cardSwapImageSizes}
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
                        }}
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
                <Box
                  sx={{
                    p: 1.75,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
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
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{ color: "#111827", lineHeight: 1.1 }}
                  >
                    {tr("cardNotifications")}
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
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Image
                        src={LANDING_IMAGES.NOTIFICATIONS}
                        alt="Notifications"
                        fill
                        sizes={cardSwapImageSizes}
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Card>
              </CardSwap>
            </Box>
          )}

          {/* Mobile Button - Shown ONLY on mobile, after cards */}
          <Stack
            spacing={1}
            sx={{
              width: "100%",
              alignItems: "center",
              display: { xs: "flex", lg: "none" },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (isEmployeeDomain) {
                  router.push("/login/employee");
                } else {
                  router.push("/login/student");
                }
              }}
              sx={{
                fontWeight: 600,
                borderRadius: 999,
                width: "75%",
                minHeight: 50,
                color: "white",
                textTransform: "none",
              }}
            >
              {tr("login")}
            </Button>
          </Stack>
        </Box>
      </HomeRevealGate>
    </Box>
  );
}
