"use client";

import { Box, Stack, IconButton } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export const navWidth = 80;
export const headerHeight = 64;

interface ManagerNavbarProps {
    isMobile?: boolean;
}

export default function ManagerNavbar({ isMobile = false }: ManagerNavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/manager") {
            return pathname === "/manager";
        }
        return pathname.startsWith(path);
    };

    const getIconButtonStyle = (path: string) => ({
        bgcolor: isActive(path) ? "primary.main" : "transparent",
        color: isActive(path) ? "white" : "text.primary",
        "&:hover": {
            bgcolor: isActive(path) ? "primary.dark" : "grey.100",
        },
    });

    return (
        <Box
            component="nav"
            sx={{
                position: "fixed",
                ...(isMobile
                    ? {
                        top: "auto",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: "100%",
                        height: "64px",
                        boxShadow: "0 -2px 8px rgba(0,0,0,0.12)",
                    }
                    : {
                        top: `${headerHeight}px`,
                        left: 0,
                        bottom: 0,
                        width: `${navWidth}px`,
                        boxShadow: "2px 0 8px rgba(0,0,0,0.12)",
                    }),
                bgcolor: "common.white",
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                justifyContent: isMobile ? "space-around" : "center",
                alignItems: "center",
                p: isMobile ? 1 : 2,
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Stack
                spacing={isMobile ? 0 : 2}
                direction={isMobile ? "row" : "column"}
                sx={{
                    width: isMobile ? "100%" : "auto",
                    justifyContent: isMobile ? "space-around" : "center",
                }}
            >
                <IconButton
                    onClick={() => router.push("/manager")}
                    sx={getIconButtonStyle("/manager")}
                >
                    <HomeFilledIcon />
                </IconButton>
                <IconButton
                    onClick={() => router.push("/manager/menu")}
                    sx={getIconButtonStyle("/manager/menu")}
                >
                    <MenuBookIcon />
                </IconButton>
                <IconButton
                    onClick={() => router.push("/manager/hours")}
                    sx={getIconButtonStyle("/manager/hours")}
                >
                    <AccessTimeIcon />
                </IconButton>
            </Stack>
        </Box>
    );
}
