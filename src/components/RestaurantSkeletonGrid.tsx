import { Card, CardContent, Skeleton, Box } from "@mui/material";

export default function RestaurantSkeletonGrid() {
  return (
    <Box sx={{ p: 3, width: "100%", maxWidth: "100%", mx: "auto" }}>
      <Skeleton
        variant="text"
        sx={{ fontSize: "2.125rem", width: 300, mb: 3 }}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card
            key={item}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton variant="rectangular" height={160} />
            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Skeleton variant="text" width="70%" height={32} />
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ ml: 1 }}
                />
              </Box>
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="rounded" width={60} height={24} />
              </Box>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={36}
                sx={{ borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
