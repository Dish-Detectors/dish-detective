"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { IRestaurant } from "@/models/Restaurant";
import { Box } from "@mui/material";

interface RestaurantMapProps {
    restaurants: IRestaurant[];
}

const ZAGREB_CENTER = { lat: 45.815, lng: 15.9819 };

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "grey.100",
                    borderRadius: 4,
                }}
            >
                Google Maps API Key is missing
            </Box>
        );
    }

    return (
        <Box sx={{ height: "100%", width: "100%", borderRadius: 4, overflow: "hidden" }}>
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={ZAGREB_CENTER}
                    defaultZoom={13}
                    mapId="DEMO_MAP_ID" // Required for AdvancedMarker
                    disableDefaultUI={true}
                >
                    {restaurants.map((restaurant) => (
                        <AdvancedMarker
                            key={restaurant._id as string}
                            position={{
                                lat: restaurant.location.coordinates[1],
                                lng: restaurant.location.coordinates[0],
                            }}
                        >
                            <Pin background={"#FBBC04"} glyphColor={"#000"} borderColor={"#000"} />
                        </AdvancedMarker>
                    ))}
                </Map>
            </APIProvider>
        </Box>
    );
}
