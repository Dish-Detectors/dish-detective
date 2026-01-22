import { currentUser } from "@clerk/nextjs/server";
import { Box, Typography, Button } from "@mui/material";
import { SignOutButton } from "@clerk/nextjs";

export default async function UnassignedPage() {
  const user = await currentUser();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Niste pridodijeljeni
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 500 }}
      >
        Bok {user?.firstName}, tvoj račun je kreiran, ali još nisi pridodijeljen
        niti jednom restoranu. Molimo kontaktiraj administratora.
      </Typography>

      <SignOutButton>
        <Button variant="outlined" color="primary">
          Odjavi se
        </Button>
      </SignOutButton>
    </Box>
  );
}
