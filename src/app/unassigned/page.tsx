import { currentUser } from "@clerk/nextjs/server";
import { Box, Typography, Button } from "@mui/material";
import { SignOutButton } from "@clerk/nextjs";
import { tServer } from "@/utils/i18nServer";

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
        {await tServer("unassignedTitle")}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 500 }}
      >
        {await tServer("unassignedBody", { firstName: user?.firstName || "" })}
      </Typography>

      <SignOutButton>
        <Button variant="outlined" color="primary">
          {await tServer("signOut")}
        </Button>
      </SignOutButton>
    </Box>
  );
}
