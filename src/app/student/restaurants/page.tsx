import { getAllRestaurants } from "@/app/admin/restaurants/actions";
import RestaurantList from "@/components/RestaurantList";
import { Box, Typography } from "@mui/material";
import { IRestaurant } from "@/models/Restaurant";

export default async function StudentRestaurantsPage() {
    const response = await getAllRestaurants();
    const restaurants = (response.success ? response.data : []) as IRestaurant[];

    return (
        <Box
            sx={{
                p: 3,
                height: "calc(100vh - 64px)", // Adjust for header height
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
            }}
        >
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Pregled restorana
            </Typography>
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: "hidden",
                    maxWidth: 800,
                    mx: "auto",
                    width: "100%",
                }}
            >
                <RestaurantList restaurants={restaurants} />
            </Box>
        </Box>
    );
}
