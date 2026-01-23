"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Container,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Divider,
} from "@mui/material";
import PancakeStackLoader from "@/components/PancakeStackLoader";
import { getPoll, submitPollAnswers } from "../actions";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useI18n } from "@/components/I18nProvider";

interface PollData {
  _id: string;
  questions: string[];
}

export default function PollPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const pollId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [poll, setPoll] = useState<PollData | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!pollId) return;
      const res = await getPoll(pollId);
      if ("errorKey" in res && res.errorKey) {
        setError(t(res.errorKey));
      } else if (res.poll) {
        setPoll(res.poll);
        const name = res.restaurantName || "";
        setRestaurantName(
          name === "__unknownRestaurant__" ? t("unknownRestaurant") : name,
        );
      }
      setLoading(false);
    }
    loadData();
  }, [pollId]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: parseInt(value),
    }));
  };

  const handleSubmit = async () => {
    // Validate all questions answered
    if (!poll) return;
    const allAnswered = poll.questions.every(
      (_, index) => answers[index] !== undefined,
    );

    if (!allAnswered) {
      setError(t("pleaseAnswerAllQuestions"));
      return;
    }

    setSubmitting(true);
    setError("");

    const formattedAnswers = Object.entries(answers).map(([index, value]) => ({
      questionIndex: parseInt(index),
      value: value,
    }));

    const res = await submitPollAnswers(pollId, formattedAnswers);

    if ("errorKey" in res && res.errorKey) {
      setError(t(res.errorKey));
      setSubmitting(false);
    } else {
      setSubmitted(true);
      setTimeout(() => {
        router.push("/student/restaurants");
      }, 3000);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <PancakeStackLoader />
      </Box>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" fontWeight={700}>
            {t("thankYou")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("answersRecorded")}
            <br />
            {t("redirectingToHome")}
          </Typography>
          <CircularProgress size={24} sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }

  if (error && !poll) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
        <Button
          onClick={() => router.push("/student/restaurants")}
          sx={{ mt: 2 }}
        >
          {t("backToHome")}
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 1, textAlign: "center" }}
        >
          {restaurantName}
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          gutterBottom
          sx={{ mb: 4, textAlign: "center" }}
        >
          {t("pleaseRateExperience")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Stack spacing={4}>
            {poll?.questions.map((question, index) => (
              <Box key={index}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {index + 1}. {question}
                </Typography>

                <Box sx={{ mt: 2, px: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {t("stronglyDisagree")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("stronglyAgree")}
                    </Typography>
                  </Box>
                  <RadioGroup
                    row
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    sx={{
                      justifyContent: "space-between",
                      bgcolor: "action.hover",
                      p: 1,
                      borderRadius: 2,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((val) => (
                      <FormControlLabel
                        key={val}
                        value={val.toString()}
                        control={<Radio />}
                        label={val.toString()}
                        labelPlacement="bottom"
                        sx={{ mx: 0 }}
                      />
                    ))}
                  </RadioGroup>
                </Box>
                {index < poll.questions.length - 1 && (
                  <Divider sx={{ mt: 4 }} />
                )}
              </Box>
            ))}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                disabled={submitting}
                onClick={handleSubmit}
                startIcon={
                  submitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: "1.1rem",
                  textTransform: "none",
                }}
              >
                {t("submitAnswers")}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
