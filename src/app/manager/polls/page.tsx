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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { createPoll, getEligibleStudentCount } from "./actions";

export default function ManagerPollsPage() {
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
        if (questions.some((q) => !q.trim())) {
            setSnackbar({
                open: true,
                message: "Molimo ispunite sva pitanja.",
                severity: "error",
            });
            return;
        }

        setSending(true);
        try {
            const res = await createPoll({
                questions,
                percentage,
            });

            if (res.error) {
                setSnackbar({ open: true, message: res.error, severity: "error" });
            } else {
                setSnackbar({
                    open: true,
                    message: `Anketa uspješno poslana na ${res.count} studenata!`,
                    severity: "success",
                });
                // Reset form
                setQuestions([""]);
                setPercentage(25);
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Došlo je do greške prilikom slanja.",
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

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Kreiraj novu anketu
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Pošaljite anketu studentima koji su pretplaćeni na vaša jela.
            </Typography>

            <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Stack spacing={4}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Dostupni studenti
                        </Typography>
                        {loadingCount ? (
                            <CircularProgress size={24} />
                        ) : eligibleCount !== null ? (
                            <Box>
                                <Typography variant="body1">
                                    Ukupno pretplaćenih studenata: <strong>{eligibleCount}</strong>
                                </Typography>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Odabrali ste <strong>{percentage}%</strong> uzorka. Anketa će
                                    biti poslana na približno{" "}
                                    <strong>{calculateTargetCount()}</strong> studenata.
                                </Alert>
                            </Box>
                        ) : (
                            <Alert severity="error">Neuspješno dohvaćanje broja studenata.</Alert>
                        )}
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Pitanja
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                            Studenti će za svako pitanje moći odabrati ocjenu od "U potpunosti se ne slažem" do "U potpunosti se slažem".
                        </Typography>

                        <Stack spacing={2}>
                            {questions.map((q, index) => (
                                <Box key={index} sx={{ display: "flex", gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        label={`Pitanje ${index + 1}`}
                                        value={q}
                                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                                        placeholder="npr. Jeste li zadovoljni veličinom porcije?"
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
                                Dodaj pitanje
                            </Button>
                        </Stack>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Uzorak studenata
                        </Typography>
                        <ToggleButtonGroup
                            value={percentage}
                            exclusive
                            onChange={handlePercentageChange}
                            fullWidth
                            sx={{ mt: 1 }}
                        >
                            <ToggleButton value={25}>25%</ToggleButton>
                            <ToggleButton value={50}>50%</ToggleButton>
                            <ToggleButton value={75}>75%</ToggleButton>
                            <ToggleButton value={100}>100%</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                            onClick={handleSubmit}
                            disabled={sending || loadingCount || eligibleCount === 0}
                            sx={{ borderRadius: 2, px: 4, py: 1.5 }}
                        >
                            Pošalji anketu
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

function Divider() {
    return <Box sx={{ height: 1, bgcolor: "divider", my: 2 }} />;
}
