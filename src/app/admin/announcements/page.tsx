"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  InputBase,
  Stack,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import AdminNavbar, { navWidth, headerHeight } from "@/components/AdminNavbar";

// Mock data based on the screenshot
const initialMessages = {
  workers: [
    {
      id: 1,
      text: "Dolor sit amet, consectetur adipiscing elit. Hendrerit",
      time: "5min ago",
      isAdmin: true,
    },
    {
      id: 2,
      text: "Dokumenti o otpustu Milice Radović.",
      time: "5min ago",
      isAdmin: true,
      file: {
        name: "Otpust",
        date: "22 Jun, 2022",
        size: "238 KB",
      },
    },
    {
      id: 3,
      text: "Iz ponude trajno izbacujemo sarmu.",
      time: "5min ago",
      isAdmin: true,
    },
  ],
  students: [
    {
      id: 4,
      text: "Dragi studenti, obavještavamo vas o novom radnom vremenu menze.",
      time: "1h ago",
      isAdmin: true,
    },
  ],
};

export default function AnnouncementChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedAudience, setSelectedAudience] = useState<"workers" | "students">("workers");
  const [messages, setMessages] = useState(initialMessages);
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: messageInput,
      time: "Just now",
      isAdmin: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedAudience]: [...prev[selectedAudience], newMessage],
    }));
    setMessageInput("");
  };

  const AudienceCard = ({ 
    type, 
    title, 
    subtitle 
  }: { 
    type: "workers" | "students", 
    title: string, 
    subtitle: string 
  }) => (
    <Paper
      onClick={() => setSelectedAudience(type)}
      elevation={selectedAudience === type ? 1 : 0}
      sx={{
        p: 2,
        mb: 2,
        cursor: "pointer",
        borderRadius: 3,
        border: "1px solid",
        borderColor: selectedAudience === type ? "primary.main" : "rgba(0,0,0,0.12)",
        bgcolor: selectedAudience === type ? "white" : "transparent",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Paper>
  );

  return (
    <>
      <AdminNavbar isMobile={isMobile} />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
          pl: isMobile ? 0 : `${navWidth}px`,
          pt: 4,
          pb: isMobile ? "80px" : 4,
        }}
      >
        {/* Header */}
        <Box sx={{ px: isMobile ? 3 : 5, mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight={780}
            sx={{ color: "#212222", mb: 2 }}
          >
            Dobrodošli
          </Typography>
          <Divider sx={{ borderBottomWidth: 1.5, borderColor: "rgba(0,0,0,0.1)" }} />
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            px: isMobile ? 2 : 5,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 4,
            height: isMobile ? "auto" : `calc(100vh - 200px)`,
          }}
        >
          {/* Sidebar */}
          <Box sx={{ width: isMobile ? "100%" : "300px", flexShrink: 0 }}>
            <AudienceCard
              type="workers"
              title="Radnici"
              subtitle="Interna obavijest radnicima"
            />
            <AudienceCard
              type="students"
              title="Studenti"
              subtitle="Javna obavijest studentima"
            />
          </Box>

          {/* Chat Window */}
          <Paper
            sx={{
              flexGrow: 1,
              borderRadius: 6,
              border: "1px solid rgba(0,0,0,0.1)",
              bgcolor: "white",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
              height: "100%",
            }}
          >
            {/* Messages Area */}
            <Box
              sx={{
                flexGrow: 1,
                p: 4,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", position: 'relative', '&:before, &:after': { content: '""', position: 'absolute', top: '50%', width: '40px', height: '1px', bgcolor: 'rgba(0,0,0,0.1)' }, '&:before': { right: '100%', mr: 2 }, '&:after': { left: '100%', ml: 2 } }}>
                  Today
                </Typography>
              </Box>

              {messages[selectedAudience].map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    alignSelf: "flex-end",
                    maxWidth: "80%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, mr: 1 }}>
                    {msg.time}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#5faef4",
                      color: "white",
                      p: "12px 18px",
                      borderRadius: "12px 12px 0 12px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                    
                    {msg.file && (
                      <Box
                        sx={{
                          mt: 1.5,
                          bgcolor: "white",
                          p: 1.5,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          color: "text.primary",
                          minWidth: 240,
                        }}
                      >
                        <PictureAsPdfIcon sx={{ color: "#f44336", fontSize: 32 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {msg.file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {msg.file.date} • {msg.file.size}
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Input Bar */}
            <Box sx={{ p: 3, bgcolor: "white" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: "8px 16px",
                  borderRadius: "50px",
                  border: "1.5px solid rgba(0,0,0,0.15)",
                  bgcolor: "white",
                  "&:focus-within": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <IconButton size="small" sx={{ color: "text.secondary", mr: 1 }}>
                  <AttachFileIcon />
                </IconButton>
                <InputBase
                  fullWidth
                  placeholder="Enter your message"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  sx={{ flexGrow: 1, fontSize: "0.95rem" }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  sx={{
                    bgcolor: messageInput.trim() ? "#5faef4" : "rgba(0,0,0,0.05)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#4a9ce6",
                    },
                    ml: 1,
                  }}
                >
                  <SendIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
}
