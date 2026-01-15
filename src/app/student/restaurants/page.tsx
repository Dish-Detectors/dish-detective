import { getAllRestaurants } from "@/app/admin/restaurants/actions";
import RestaurantList from "@/components/RestaurantList";
import RestaurantMap from "@/components/RestaurantMap";
import { Box, Typography } from "@mui/material";
import { IRestaurant } from "@/models/Restaurant";

export default async function StudentRestaurantsPage() {
    const response = await getAllRestaurants();
    const restaurants = (response.success ? response.data : []) as IRestaurant[];

    return (
        <Box sx={{
            p: 3,
            height: "calc(100vh - 64px)", // Adjust for header height
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box"
        }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Pregled restorana
            </Typography>
            <Box sx={{
                flexGrow: 1,
                display: "flex",
                gap: 3,
                overflow: "hidden",
                flexDirection: { xs: "column", md: "row" }
            }}>
                <Box sx={{
                    width: { xs: "100%", md: "33.33%" },
                    height: { xs: "50%", md: "100%" },
                    overflow: "hidden"
                }}>
                    <RestaurantList restaurants={restaurants} />
                </Box>
                <Box sx={{
                    flexGrow: 1,
                    height: { xs: "50%", md: "100%" },
                    borderRadius: 4,
                    overflow: "hidden"
                }}>
                    <RestaurantMap restaurants={restaurants} />
                </Box>
            </Box>
        </Box>
    );
}
