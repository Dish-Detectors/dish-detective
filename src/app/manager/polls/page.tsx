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

export default function PollsListingPage() {
    const router = useRouter();
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
        return date.toLocaleString("hr-HR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredPolls = polls.filter((poll) =>
        (poll.title || "Anketa")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
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
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto", position: "relative", minHeight: "80vh" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Povijest anketa
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Pregledajte rezultate i statistiku vaših anketa.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Pretraži ankete po naslovu..."
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
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                    >
                        Nova anketa
                    </Button>
                </Stack>
            </Box>

            {polls.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <PollIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Još uvijek niste kreirali nijednu anketu.
                    </Typography>
                </Paper>
            ) : filteredPolls.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <SearchIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Nema rezultata za vašu pretragu.
                    </Typography>
                </Paper>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {filteredPolls.map((poll) => (
                        <Card key={poll._id} sx={{ borderRadius: 3 }}>
                            <CardActionArea onClick={() => router.push(`/manager/polls/${poll._id}`)}>
                                <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: "50%",
                                        bgcolor: "primary.50",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 3
                                    }}>
                                        <PollIcon color="primary" />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight={600}>
                                            {poll.title || "Anketa"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {poll.questions.length} pitanja • {formatDate(poll.createdAt)}
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
    );
}
