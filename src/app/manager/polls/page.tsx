"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fab,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  InputAdornment,
  Stack,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PollIcon from "@mui/icons-material/Poll";
import { useRouter } from "next/navigation";
import { fetchManagerPolls } from "./actions";
import { useI18n } from "@/components/I18nProvider";

export default function PollsListingPage() {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [polls, setPolls] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolls() {
      const res = await fetchManagerPolls();
      if (res.error) {
        setError(res.error);
      } else {
        setPolls(res.polls || []);
      }
      setLoading(false);
    }
    loadPolls();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(lang === "HR" ? "hr-HR" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPolls = polls.filter((poll) =>
    (poll.title || t("pollDefaultTitle"))
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 4 },
        pt: 0,
        pb: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          width: "100%",
          maxWidth: 800,
          mx: "auto",
          pr: { xs: 0, sm: 1 },
          pb: { xs: "100px", sm: 10 },
          scrollbarGutter: "stable",
        }}
      >
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ color: "#212222" }}
          >
            {t("pollsHistoryTitle")}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t("pollsHistorySubtitle")}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder={t("searchPollsByTitlePlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "background.paper",
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push("/manager/polls/create")}
              sx={{
                borderRadius: 3,
                px: 3,
                whiteSpace: "nowrap",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
              }}
            >
              {t("newPoll")}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {polls.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
            <PollIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t("noPollsCreatedYet")}
            </Typography>
          </Paper>
        ) : filteredPolls.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
            <SearchIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t("noResultsForSearch")}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 2 }}>
            {filteredPolls.map((poll) => (
              <Card
                key={poll._id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardActionArea
                  onClick={() => router.push(`/manager/polls/${poll._id}`)}
                >
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", p: 3 }}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        bgcolor: "primary.50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 3,
                      }}
                    >
                      <PollIcon color="primary" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ color: "#212222" }}
                      >
                        {poll.title || t("pollDefaultTitle")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("questionsCountLabel", {
                          count: poll.questions.length,
                        })}{" "}
                        • {formatDate(poll.createdAt)}
                      </Typography>
                    </Box>
                    <ChevronRightIcon color="action" />
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
