import React from "react";
import { Box, Typography, Grid, Container } from "@mui/material";
import { getRestaurantOffer } from "@/app/student/action";
import { getUserSubscriptions } from "@/actions/notification";
import StudentDishCard from "@/components/StudentDishCard";
import Restaurant from "@/models/Restaurant";
import dbConnect from "@/utils/dbConnect";

export default async function RestaurantOfferPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    await dbConnect();
    const restaurant = await Restaurant.findById(id).lean();
    const offer = await getRestaurantOffer(id);
    const subscriptions = await getUserSubscriptions();

    if (!restaurant) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5">Restoran nije pronađen.</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Pregled ponude
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {(restaurant as any).name} - {(restaurant as any).address}
                </Typography>
            </Box>

            {offer.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center">
                    Trenutno nema dostupnih jela u ovom restoranu.
                </Typography>
            ) : (
                <Grid container spacing={4} justifyContent="center">
                    {offer.map((item: any) => (
                        <Grid
                            size={{ xs: 12, sm: 6, md: 4 }}
                            key={item.id}
                            sx={{ display: "flex", justifyContent: "center" }}
                        >
                            <StudentDishCard
                                menuItemId={item.id}
                                name={item.name}
                                description={item.description}
                                imageUrl={item.imageUrl}
                                allergens={item.allergens}
                                lastServed={item.lastServed}
                                rating={0}
                                isInitiallySubscribed={subscriptions.includes(item.id)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
