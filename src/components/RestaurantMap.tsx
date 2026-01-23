"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { IRestaurant } from "@/models/Restaurant";
import { Box, Typography, Button, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import NavigationIcon from "@mui/icons-material/Navigation";
import CloseIcon from "@mui/icons-material/Close";

interface RestaurantMapProps {
  restaurants: IRestaurant[];
}

const ZAGREB_CENTER = { lat: 45.815, lng: 15.9819 };

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<IRestaurant | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
      );
    }
  }, []);

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
    <Box
      sx={{
        height: "100%",
        width: "100%",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <APIProvider apiKey={apiKey}>
        {isDarkMode && (
          <style>{`
            .gm-style-iw {
              background-color: #1e293b !important;
              color: #e2e8f0 !important;
            }
            .gm-style-iw-c {
              background-color: #1e293b !important;
              padding: 0 !important;
            }
            .gm-style-iw-d {
              background-color: #1e293b !important;
              color: #e2e8f0 !important;
              overflow: hidden !important;
            }
            .gm-style-iw-tc::after {
              background: #1e293b !important;
            }
            .gm-ui-hover-effect {
              filter: invert(1) !important;
            }
            .gm-style-iw-ch {
                padding-top: 10px !important;
                padding-left: 10px !important;
            }
          `}</style>
        )}
        <Map
          defaultCenter={ZAGREB_CENTER}
          defaultZoom={13}
          mapId="DEMO_MAP_ID" // Required for AdvancedMarker
          disableDefaultUI={true}
          onClick={() => setSelectedRestaurant(null)}
          colorScheme={isDarkMode ? "DARK" : "LIGHT"}
          styles={isDarkMode ? DARK_MAP_STYLES : []}
        >
          {/* User Location Marker */}
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#4285F4",
                  border: "2px solid white",
                  borderRadius: "50%",
                  boxShadow: "0 0 0 2px #4285F4",
                }}
              />
            </AdvancedMarker>
          )}

          {restaurants.map((restaurant) => (
            <AdvancedMarker
              key={restaurant._id as string}
              position={{
                lat: restaurant.location.coordinates[1],
                lng: restaurant.location.coordinates[0],
              }}
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <Pin
                background={"#E53935"}
                glyphColor={"#000"}
                borderColor={"#000"}
              />
            </AdvancedMarker>
          ))}

          {selectedRestaurant && (
            <InfoWindow
              position={{
                lat: selectedRestaurant.location.coordinates[1],
                lng: selectedRestaurant.location.coordinates[0],
              }}
              onCloseClick={() => setSelectedRestaurant(null)}
              headerContent={
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="text.primary"
                >
                  {selectedRestaurant.name}
                </Typography>
              }
            >
              <Box sx={{ width: 200, p: 1 }}>
                {selectedRestaurant.imageUrl && (
                  <img
                    src={selectedRestaurant.imageUrl}
                    alt={selectedRestaurant.name}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {selectedRestaurant.address}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  startIcon={<NavigationIcon />}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedRestaurant.location.coordinates[1]},${selectedRestaurant.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: "none" }}
                >
                  Navigiraj
                </Button>
              </Box>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </Box>
  );
}
