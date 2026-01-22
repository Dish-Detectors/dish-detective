"use client";

import {
  Box,
  Typography,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CampaignIcon from "@mui/icons-material/Campaign";
import BarChartIcon from "@mui/icons-material/BarChart";
import BallotIcon from "@mui/icons-material/Ballot";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserFirstName } from "@/app/admin/actions";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { headerHeight } from "@/components/ManagerNavbar";

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

export default function ManagerPage() {
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
          sx={{ color: "#212222", mb: 2 }}
        >
          Dobrodošli{name ? `, ${name}` : ""}!
        </Typography>

        <Divider sx={{ mb: 4, borderBottomWidth: 2 }} />

        <Box sx={{ flexGrow: 1, py: 4 }}>
          <MobileActionCard
            onClick={() => router.push("/manager/menu")}
            icon={<MenuBookIcon sx={{ fontSize: 32, color: "text.primary" }} />}
            animationDelay="0.1s"
          >
            Dnevni meni
          </MobileActionCard>
          <MobileActionCard
            onClick={() => router.push("/manager/hours")}
            icon={
              <AccessTimeIcon sx={{ fontSize: 32, color: "text.primary" }} />
            }
            animationDelay="0.3s"
          >
            Radno vrijeme
          </MobileActionCard>

          <MobileActionCard
            onClick={() => router.push("/manager/stats")}
            icon={<BarChartIcon sx={{ fontSize: 32, color: "text.primary" }} />}
            animationDelay="0.5s"
          >
            Statistika
          </MobileActionCard>

          <MobileActionCard
            onClick={() => router.push("/manager/announcements")}
            icon={<CampaignIcon sx={{ fontSize: 32, color: "text.primary" }} />}
            animationDelay="0.7s"
          >
            Obavijesti
          </MobileActionCard>

          <MobileActionCard
            onClick={() => router.push("/manager/polls")}
            icon={<BallotIcon sx={{ fontSize: 32, color: "text.primary" }} />}
            animationDelay="0.9s"
          >
            Ankete
          </MobileActionCard>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: `calc(100vh - ${headerHeight}px)`,
        bgcolor: "#f5f5f5",
        p: 5,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={780}
        sx={{ color: "#212222", mb: 4, ml: 0 }}
      >
        Dobrodošli{name ? `, ${name}` : ""}!
      </Typography>

      <Box sx={{ mt: -3 }}>
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
            maxWidth: 1000,
            display: "flex",
            flexWrap: "wrap",
            gap: 3.5,
            justifyContent: "center",
            mt: -7,
          }}
        >
          <Box sx={{ flex: "1 1 300px" }}>
            <DesktopActionCard
              icon={
                <MenuBookIcon
                  sx={{
                    fontSize: { xs: 44, sm: 52, md: 60, lg: 68 },
                    color: "text.primary",
                  }}
                />
              }
              title="Dnevni meni"
              descriptions={[]}
              onClick={() => router.push("/manager/menu")}
              animationDelay="0.1s"
            />
          </Box>

          <Box sx={{ flex: "1 1 300px" }}>
            <DesktopActionCard
              icon={
                <AccessTimeIcon
                  sx={{
                    fontSize: { xs: 44, sm: 52, md: 60, lg: 68 },
                    color: "text.primary",
                  }}
                />
              }
              title="Radno vrijeme"
              descriptions={[]}
              onClick={() => router.push("/manager/hours")}
              animationDelay="0.3s"
            />
          </Box>

          <Box sx={{ flex: "1 1 300px" }}>
            <DesktopActionCard
              icon={
                <BarChartIcon
                  sx={{
                    fontSize: { xs: 44, sm: 52, md: 60, lg: 68 },
                    color: "text.primary",
                  }}
                />
              }
              title="Statistika"
              descriptions={[]}
              onClick={() => router.push("/manager/stats")}
              animationDelay="0.5s"
            />
          </Box>

          <Box sx={{ flex: "1 1 300px" }}>
            <DesktopActionCard
              icon={
                <CampaignIcon
                  sx={{
                    fontSize: { xs: 44, sm: 52, md: 60, lg: 68 },
                    color: "text.primary",
                  }}
                />
              }
              title="Obavijesti"
              descriptions={[]}
              onClick={() => router.push("/manager/announcements")}
              animationDelay="0.7s"
            />
          </Box>

          <Box sx={{ flex: "1 1 300px" }}>
            <DesktopActionCard
              icon={
                <BallotIcon
                  sx={{
                    fontSize: { xs: 44, sm: 52, md: 60, lg: 68 },
                    color: "text.primary",
                  }}
                />
              }
              title="Ankete"
              descriptions={[]}
              onClick={() => router.push("/manager/polls")}
              animationDelay="0.9s"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
