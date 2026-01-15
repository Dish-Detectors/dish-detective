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
      fontSize: "1.25rem",
      fontWeight: "600",
      padding: "20px 15px",
      borderRadius: "8px",
      border: "1px solid rgba(0, 0, 0, 0.23)",
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
        boxShadow: 4,
      },
      mb: 3,
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    {icon && <Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>}
    <Typography sx={{ fontSize: "1.25rem", fontWeight: "600" }}>
      {children}
    </Typography>
  </Paper>
);

interface DesktopActionCardProps {
  icon: ReactNode;
  title: string;
  descriptions: string[];
  onClick: () => void;
  animationDelay?: string;
}

const DesktopActionCard = ({
  icon,
  title,
  descriptions,
  onClick,
  animationDelay = "0.1s",
}: DesktopActionCardProps) => (
  <Paper
    onClick={onClick}
    elevation={2}
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      minWidth: 150,
      maxWidth: 350,
      p: 3,
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
        fontSize: "clamp(1rem, 1.7vw, 2rem)",
        fontWeight: "600",
        color: "text.primary",
        pt: 1,
      }}
    >
      {title}
    </Typography>
    {descriptions.map((desc, index) => (
      <Typography
        key={index}
        sx={{
          fontSize: "clamp(0.75rem, 0.9vw, 1.2rem)",
          fontWeight: "550",
          color: "text.secondary",
          pt: index === 0 ? 1 : 0,
        }}
      >
        {desc}
      </Typography>
    ))}
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

        <Box sx={{ flexGrow: 1, py: 4 }}>
          <MobileActionCard
            onClick={() => router.push("/admin/restaurants")}
            icon={<TuneIcon sx={{ fontSize: 32, color: "text.primary" }} />}
            animationDelay="0.1s"
          >
            Upravljaj restoranima
          </MobileActionCard>
          <MobileActionCard
            onClick={() => router.push("/admin/dishes")}
            icon={
              <RestaurantIcon sx={{ fontSize: 32, color: "text.primary" }} />
            }
            animationDelay="0.3s"
          >
            Upravljaj jelima
          </MobileActionCard>
          <MobileActionCard
            onClick={() => router.push("/admin/accounts")}
            icon={<PeopleIcon sx={{ fontSize: 32, color: "text.primary" }} />}
            animationDelay="0.5s"
          >
            Upravljaj računima
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
          px: 5,
          py: 6,
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <DesktopActionCard
          icon={<TuneIcon sx={{ fontSize: 40, color: "text.primary" }} />}
          title="Upravljaj restoranima"
          descriptions={[
            "• Dodavanje i brisanje restorana",
            "• Postavljanje voditelja menze",
          ]}
          onClick={() => router.push("/admin/restaurants")}
          animationDelay="0.1s"
        />

        <DesktopActionCard
          icon={<RestaurantIcon sx={{ fontSize: 40, color: "text.primary" }} />}
          title="Upravljaj jelima"
          descriptions={[
            "• Dodavanje i brisanje jela",
            "• Naglašavanje sastojaka i alergena",
          ]}
          onClick={() => router.push("/admin/dishes")}
          animationDelay="0.3s"
        />

        <DesktopActionCard
          icon={<PeopleIcon sx={{ fontSize: 40, color: "text.primary" }} />}
          title="Upravljaj računima"
          descriptions={["• Dodavanje i brisanje računa radnika"]}
          onClick={() => router.push("/admin/accounts")}
          animationDelay="0.5s"
        />
      </Box>
    </Box>
  );
}
