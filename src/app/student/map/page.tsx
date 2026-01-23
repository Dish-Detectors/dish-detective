import { getAllRestaurants } from "@/app/admin/restaurants/actions";
import RestaurantMap from "@/components/RestaurantMap";
import { Box } from "@mui/material";
import { IRestaurant } from "@/models/Restaurant";

export default async function StudentMapPage() {
  const response = await getAllRestaurants();
  const restaurants = (response.success ? response.data : []) as IRestaurant[];

  return (
    <Box
      sx={{
        p: 3,
        height: "100%", // Fill parent (which is already calc(100vh - header))
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden", // Prevent scroll
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          borderRadius: 4,
          overflow: "hidden",
          minHeight: 0, // Critical for flex scrolling/containment
        }}
      >
        <RestaurantMap restaurants={restaurants} />
      </Box>
    </Box>
  );
}
