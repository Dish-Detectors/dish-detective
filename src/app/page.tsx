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
  const showDesktopCards = useMediaQuery("(min-width: 1400px)");

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

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.overflowX = prevBodyOverflowX;
      document.body.style.overflowY = prevBodyOverflowY;
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
    if (!showDesktopCards) return;

    const clamp = (min: number, value: number, max: number) =>
      Math.max(min, Math.min(max, value));
    let rafId = 0;

    const recompute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Scale mostly with width, but cap by height so it doesn't get cramped on short screens.
      const cardWidth = clamp(500, Math.round(vw * 0.32), 740);
      const idealCardHeight = cardWidth * (340 / 520);
      const maxCardHeight = Math.min(540, Math.round(vh * 0.58));
      const cardHeight = clamp(327, Math.round(idealCardHeight), maxCardHeight);

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

  if (isMobile) {
    return (
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          bgcolor: "black",
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
          <Box sx={{ width: "200%", height: "200%", position: "relative" }}>
            <Aurora
              colorStops={["#0c7fdb", "#57aaf5", "#f8a44b"]}
              amplitude={1.0}
              blend={0.75}
            />
          </Box>
        </Box>
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 4,
            padding: 4,
            maxWidth: "90%",
            boxShadow: 3,
            mt: 2,
            mb: 2,
            zIndex: 1,
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
            {tr("heroTitle")}
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
            onClick={() => {
              if (isEmployeeDomain) {
                router.push("/login/employee");
              } else {
                router.push("/login/student");
              }
            }}
            fullWidth
            sx={{
              fontWeight: 600,
              borderRadius: 999,
              minHeight: 50,
              textTransform: "none",
            }}
          >
            {tr("login")}
          </Button>
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
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 10,
        bgcolor: "black",
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
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            pr: "clamp(70px, 2vw, 180px)",
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
              {tr("heroTitle")}
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
                  width: "25%",
                  minHeight: 45,
                  color: "white",
                  textTransform: "none",
                }}
              >
                {tr("login")}
              </Button>
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
                        src="/menuview.png"
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
                        src="/menzamap.png"
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
                        src="/notification.png"
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
        </Box>
      </HomeRevealGate>
    </Box>
  );
}
