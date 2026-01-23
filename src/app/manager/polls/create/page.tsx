"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { createPoll, getEligibleStudentCount } from "../actions";
import SuccessScreen from "@/components/SuccessScreen";
import { useI18n } from "@/components/I18nProvider";

export default function ManagerPollsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [percentage, setPercentage] = useState<number>(25);
  const [eligibleCount, setEligibleCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  useEffect(() => {
    async function loadCount() {
      const res = await getEligibleStudentCount();
      if (res.error) {
        setSnackbar({ open: true, message: res.error, severity: "error" });
      } else {
        setEligibleCount(res.count!);
      }
      setLoadingCount(false);
    }
    loadCount();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handlePercentageChange = (
    event: React.MouseEvent<HTMLElement>,
    newPercentage: number | null,
  ) => {
    if (newPercentage !== null) {
      setPercentage(newPercentage);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: t("enterPollTitleError"),
        severity: "error",
      });
      return;
    }

    if (questions.some((q) => !q.trim())) {
      setSnackbar({
        open: true,
        message: t("fillAllQuestionsError"),
        severity: "error",
      });
      return;
    }

    setSending(true);
    try {
      const res = await createPoll({
        title,
        questions,
        percentage,
      });

      if (res.error) {
        setSnackbar({ open: true, message: res.error, severity: "error" });
      } else {
        setShowSuccessScreen(true);
        // Redirect after showing success screen
        setTimeout(() => {
          router.push("/manager/polls");
        }, 2000);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: t("pollSendError"),
        severity: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const calculateTargetCount = () => {
    if (eligibleCount === null) return 0;
    return Math.max(1, Math.ceil(eligibleCount * (percentage / 100)));
  };

  if (showSuccessScreen) {
    return <SuccessScreen message={t("pollSentSuccess")} />;
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/manager/polls")}
          sx={{ mb: 2, mt: 2 }}
        >
          {t("backToPollHistory")}
        </Button>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ color: "#212222" }}
        >
          {t("createNewPollTitle")}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {t("sendPollSubtitle")}
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 3, mb: 2 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {t("basicInfoTitle")}
              </Typography>
              <TextField
                fullWidth
                label={t("pollTitleLabel")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("pollTitlePlaceholder")}
                sx={{ mb: 2 }}
              />
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {t("questionsTitle")}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 2 }}
              >
                {t("questionsScaleHint")}
              </Typography>

              <Stack spacing={2}>
                {questions.map((q, index) => (
                  <Box key={index} sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      label={t("questionLabel", { number: index + 1 })}
                      value={q}
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                      placeholder={t("questionPlaceholder")}
                    />
                    {questions.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveQuestion(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddQuestion}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {t("addQuestion")}
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {t("availableStudentsTitle")}
                </Typography>
                {loadingCount ? (
                  <CircularProgress size={24} />
                ) : eligibleCount !== null ? (
                  <Box>
                    <Typography variant="body1">
                      {t("totalSubscribedStudents", { count: eligibleCount })}
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      {t("sampleInfo", {
                        percentage,
                        count: calculateTargetCount(),
                      })}
                    </Alert>
                  </Box>
                ) : (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {t("failedToFetchStudentCount")}
                  </Alert>
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {t("studentSampleTitle")}
                </Typography>
                <ToggleButtonGroup
                  value={percentage}
                  exclusive
                  onChange={handlePercentageChange}
                  fullWidth
                  sx={{
                    mt: 1,
                    "& .MuiToggleButton-root": {
                      borderRadius: 2,
                      mx: 0.5,
                      border: "1px solid #e0e0e0 !important",
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value={25}>25%</ToggleButton>
                  <ToggleButton value={50}>50%</ToggleButton>
                  <ToggleButton value={75}>75%</ToggleButton>
                  <ToggleButton value={100}>100%</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={
                  sending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                onClick={handleSubmit}
                disabled={sending || loadingCount || eligibleCount === 0}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  boxShadow: "none",
                  fontWeight: 600,
                }}
              >
                {t("sendPoll")}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
