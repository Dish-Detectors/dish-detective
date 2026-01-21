"use client";

import {
  Box,
  Typography,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import TuneIcon from "@mui/icons-material/Tune";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PeopleIcon from "@mui/icons-material/People";
import FoodBankIcon from "@mui/icons-material/FoodBank";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserFirstName } from "@/app/admin/actions";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { navWidth } from "@/components/AdminNavbar";

interface ActionButtonProps {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  animationDelay?: string;
}

const MobileActionCard = ({
  children,
  onClick,
  icon,
  animationDelay = "0.1s",
}: ActionButtonProps) => (
  <Paper
    onClick={onClick}
    elevation={2}
    sx={{
      textTransform: "none",
      fontSize: "1.1rem",
      fontWeight: "600",
      padding: 2,
      borderRadius: "16px",
      border: "1px solid rgba(0, 0, 0, 0.08)",
      color: "text.primary",
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      opacity: 0,
      animation: `fadeInUp 0.6s ease-out ${animationDelay} forwards`,
      "@keyframes fadeInUp": {
        from: { opacity: 0, transform: "translateY(20px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      "&:hover": {
        borderColor: "primary.main",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transform: "translateY(-2px)",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: "1/1",
      textAlign: "center",
      gap: 1.5,
    }}
  >
    {icon && <Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>}
    <Typography sx={{ fontSize: "0.95rem", fontWeight: "600" }}>
      {children}
    </Typography>
  </Paper>
);

interface DesktopActionCardProps {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  animationDelay?: string;
}

const DesktopActionCard = ({
  icon,
  title,
  onClick,
  animationDelay = "0.1s",
}: DesktopActionCardProps) => (
  <Paper
    onClick={onClick}
    elevation={2}
    sx={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 200, // Ensure some height
      p: { xs: 3.5, sm: 4.5 },
      borderRadius: 3,
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      opacity: 0,
      animation: `fadeInUp 0.6s ease-out ${animationDelay} forwards`,
      "@keyframes fadeInUp": {
        from: { opacity: 0, transform: "translateY(20px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      "&:hover": {
        bgcolor: "grey.100",
        boxShadow: 4,
        transform: "translateY(-2px)",
      },
    }}
  >
    {icon}
    <Typography
      sx={{
        fontSize: "clamp(1.25rem, 1.8vw, 2.25rem)",
        fontWeight: "600",
        color: "text.primary",
        pt: 1,
      }}
    >
      {title}
    </Typography>
  </Paper>
);

export default function Page() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await getCurrentUserFirstName();
      if (result.success && result.firstName) {
        setName(result.firstName);
      }
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
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

  if (isMobile) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f5f5f5",
          justifyContent: "flex-start",
          p: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={780}
          sx={{ color: "#212222", mb: 3, ml: 1 }}
        >
          Dobrodošli{name ? `, ${name}` : ""}!
        </Typography>

        <Box sx={{ px: 2 }}>
          <Divider sx={{ borderBottomWidth: 2 }} />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            py: 4,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            alignContent: "start",
          }}
        >
          <MobileActionCard
            onClick={() => router.push("/admin/restaurants")}
            icon={<TuneIcon sx={{ fontSize: 32, color: "text.primary" }} />}
            animationDelay="0.1s"
          >
            Restorani
          </MobileActionCard>
          <MobileActionCard
            onClick={() => router.push("/admin/dishes")}
            icon={
              <RestaurantIcon sx={{ fontSize: 32, color: "text.primary" }} />
            }
            animationDelay="0.3s"
          >
            Jela
          </MobileActionCard>
          <MobileActionCard
            onClick={() => router.push("/admin/accounts")}
            icon={<PeopleIcon sx={{ fontSize: 32, color: "text.primary" }} />}
            animationDelay="0.5s"
          >
            Računi
          </MobileActionCard>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
        p: 5,
      }}
    >
      <Typography
        variant="h4"
        fontWeight={780}
        sx={{ color: "#212222", mb: 4, ml: 4 }}
      >
        Dobrodošli{name ? `, ${name}` : ""}!
      </Typography>

      <Box sx={{ px: 4, mt: -3 }}>
        <Divider sx={{ borderBottomWidth: 2 }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          px: { xs: 2, sm: 5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 900, // Limit max width for 2x2 grid
            display: "flex",
            flexWrap: "wrap",
            mt: 4,
            gap: 3.5,
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Box sx={{ width: "calc(50% - 14px)" }}>
            <DesktopActionCard
              icon={
                <FoodBankIcon
                  sx={{
                    fontSize: { xs: 44, sm: 52, md: 60, lg: 68 },
                    color: "text.primary",
                  }}
                />
              }
              title="Restorani"
              onClick={() => router.push("/admin/restaurants")}
              animationDelay="0.1s"
            />
          </Box>

          <Box sx={{ width: "calc(50% - 14px)" }}>
            <DesktopActionCard
              icon={
                <RestaurantIcon
                  sx={{
                    fontSize: { xs: 44, sm: 52, md: 60, lg: 68 },
                    color: "text.primary",
                  }}
                />
              }
              title="Jela"
              onClick={() => router.push("/admin/dishes")}
              animationDelay="0.3s"
            />
          </Box>

          <Box sx={{ width: "calc(50% - 14px)" }}>
            <DesktopActionCard
              icon={
                <PeopleIcon
                  sx={{
                    fontSize: { xs: 44, sm: 52, md: 60, lg: 68 },
                    color: "text.primary",
                  }}
                />
              }
              title="Računi"
              onClick={() => router.push("/admin/accounts")}
              animationDelay="0.5s"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
