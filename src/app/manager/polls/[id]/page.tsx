"use client";

import { useState, useEffect, use } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import { BarChart } from "@mui/x-charts/BarChart";
import { useRouter } from "next/navigation";
import { getPollResults } from "../actions";
import { useI18n } from "@/components/I18nProvider";

export default function PollResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { lang, t } = useI18n();
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      const res = await getPollResults(resolvedParams.id);
      if (res.error) {
        setError(res.error);
      } else {
        setData(res);
      }
      setLoading(false);
    }
    loadResults();
  }, [resolvedParams.id]);

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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          {t("back")}
        </Button>
        <Alert severity="error">{error || "Poll not found"}</Alert>
      </Box>
    );
  }

  const { poll, results, totalAnswers } = data;

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          pb: 0,
          maxWidth: 900,
          mx: "auto",
          width: "100%",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/manager/polls")}
          sx={{ mb: 2 }}
        >
          {t("allPolls")}
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, md: 4 }, pb: 8 }}>
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {poll.title || t("pollResultsTitle")}
            </Typography>
            <Typography color="text.secondary">
              {t("createdLabel", { date: formatDate(poll.createdAt) })} •{" "}
              {t("totalAnswersLabel", { count: totalAnswers })}
            </Typography>
          </Box>

          {totalAnswers === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
              <PeopleIcon
                sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                {t("noAnswersYet")}
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={4}>
              {results.map((result: any, index: number) => (
                <Paper
                  key={index}
                  sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {index + 1}. {result.question}
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ width: "100%", height: 350, mt: 2 }}>
                    <BarChart
                      xAxis={[
                        {
                          scaleType: "band",
                          data: ["1", "2", "3", "4", "5"],
                          label: t("ratingScaleLabel"),
                        },
                      ]}
                      series={[
                        {
                          data: result.data.map((d: any) => d.count),
                          label: t("studentCountLabel"),
                          color: "#2E7D32", // Success green
                        },
                      ]}
                      height={300}
                      margin={{ top: 20, right: 30, left: 40, bottom: 50 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "space-around",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      1 - {t("stronglyDisagree")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      5 - {t("stronglyAgree")}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
