"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { sendAnnouncement, getAnnouncements } from "./actions";
import {
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  InputBase,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { uploadAttachment } from "./uploadAction";

import { useI18n } from "@/components/I18nProvider";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

interface IFile {
  name: string;
  date: string;
  size: string;
  url: string; // Added URL
}

interface IMessage {
  id: number;
  text: string;
  time: string;
  isAdmin: boolean;
  file?: IFile;
}

interface IAudienceMessages {
  worker: IMessage[];
  student: IMessage[];
}

const initialMessages: IAudienceMessages = {
  worker: [],
  student: [],
};

interface AudienceCardProps {
  type: "worker" | "student";
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: (type: "worker" | "student") => void;
}

const AudienceCard = ({
  type,
  title,
  subtitle,
  selected,
  onClick,
}: AudienceCardProps) => (
  <Paper
    onClick={() => onClick(type)}
    elevation={selected ? 1 : 0}
    sx={{
      p: 2,
      mb: 2,
      cursor: "pointer",
      borderRadius: 3,
      border: "1px solid",
      borderColor: selected ? "primary.main" : "rgba(0,0,0,0.12)",
      bgcolor: selected ? "white" : "transparent",
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

export default function AnnouncementChatPage() {
  const { t, lang } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(lang === "HR" ? "hr-HR" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };
  const [selectedAudience, setSelectedAudience] = useState<
    "worker" | "student"
  >("worker");
  // const [messages, setMessages] = useState<IAudienceMessages>(initialMessages); // Removed mock
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Fetch messages on mount and when audience changes
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      const history = await getAnnouncements(selectedAudience);
      setMessages(history);
      setIsLoading(false);
    };
    loadMessages();

    // Optional: Poll for new messages if multiple managers exist
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [selectedAudience]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFile) return;

    // 1. Upload file if exists
    let attachmentData = undefined;
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await uploadAttachment(formData);

      if (!uploadRes.success || !uploadRes.attachment) {
        setSnackbar({
          open: true,
          message: t("fileUploadFailed"),
          severity: "error",
        });
        setIsUploading(false);
        return;
      }
      attachmentData = uploadRes.attachment;
      setIsUploading(false);
    }

    // Optimistic update
    const optimisticId = Date.now();
    const newMessage: IMessage = {
      id: optimisticId,
      text: messageInput,
      time: formatTime(new Date()),
      isAdmin: true,
      file: attachmentData
        ? { ...attachmentData, date: new Date().toLocaleDateString() }
        : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
    setSelectedFile(null); // Clear file selection

    const result = await sendAnnouncement(
      selectedAudience,
      newMessage.text,
      attachmentData,
    );
    if (!result.success) {
      // Rollback on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      console.error("Failed to send:", result.error);
      setSnackbar({
        open: true,
        message: t("announcementSendFailed"),
        severity: "error",
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        pt: 4,
        pb: isMobile ? "80px" : 4,
      }}
    >
      {/* Header */}
      <Box sx={{ px: isMobile ? 3 : 5, mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: "#212222", mb: 2 }}
        >
          {t("announcementsTitle")}
        </Typography>
        <Divider
          sx={{ borderBottomWidth: 1.5, borderColor: "rgba(0,0,0,0.1)" }}
        />
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          px: isMobile ? 2 : 5,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 4,
          height: isMobile ? "auto" : `calc(100vh - 250px)`, // Increased offset to clear footer
        }}
      >
        {/* Sidebar */}
        <Box sx={{ width: isMobile ? "100%" : "300px", flexShrink: 0 }}>
          <AudienceCard
            type="worker"
            title={t("audienceWorkers")}
            subtitle={t("audienceWorkersSubtitle")}
            selected={selectedAudience === "worker"}
            onClick={setSelectedAudience}
          />
          <AudienceCard
            type="student"
            title={t("audienceStudents")}
            subtitle={t("audienceStudentsSubtitle")}
            selected={selectedAudience === "student"}
            onClick={setSelectedAudience}
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
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  position: "relative",
                  "&:before, &:after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    width: "40px",
                    height: "1px",
                    bgcolor: "rgba(0,0,0,0.1)",
                  },
                  "&:before": { right: "100%", mr: 2 },
                  "&:after": { left: "100%", ml: 2 },
                }}
              >
                Today
              </Typography>
            </Box>

            {messages.map((msg) => (
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

                  {/* Attachment render */}
                  {msg.file && (
                    <Box
                      component={msg.file.url ? "a" : "div"}
                      href={msg.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        mt: 1.5,
                        bgcolor: "white",
                        p: 1.5,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        textDecoration: "none",
                        color: "text.primary",
                        minWidth: 240,
                        cursor: msg.file.url ? "pointer" : "default",
                        "&:hover": {
                          bgcolor: "grey.100",
                        },
                      }}
                    >
                      <PictureAsPdfIcon
                        sx={{ color: "#f44336", fontSize: 32 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {msg.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {msg.file.date} • {msg.file.size}
                        </Typography>
                      </Box>
                      <IconButton size="small" aria-label="download file">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                {/* Time Below */}
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    mt: 0.5,
                    mr: 1,
                    fontSize: "0.7rem",
                  }}
                >
                  {msg.time}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Input Bar */}
          <Box sx={{ p: 3, bgcolor: "white" }}>
            {selectedFile && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1, px: 2 }}>
                <AttachFileIcon fontSize="small" color="action" />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {selectedFile.name}
                </Typography>
                <IconButton size="small" onClick={() => setSelectedFile(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
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
              <input
                accept="*/*"
                style={{ display: "none" }}
                id="attachment-button-file"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="attachment-button-file">
                <IconButton
                  size="small"
                  sx={{
                    color: selectedFile ? "primary.main" : "text.secondary",
                    mr: 1,
                  }}
                  aria-label="attach file"
                  component="span"
                >
                  <AttachFileIcon />
                </IconButton>
              </label>
              <InputBase
                fullWidth
                  placeholder={t("enterMessagePlaceholder")}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isUploading}
                sx={{ flexGrow: 1, fontSize: "0.95rem" }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={
                  (!messageInput.trim() && !selectedFile) || isUploading
                }
                aria-label="send message"
                sx={{
                  bgcolor:
                    messageInput.trim() || selectedFile
                      ? "#5faef4"
                      : "rgba(0,0,0,0.05)",
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ borderRadius: 3, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
