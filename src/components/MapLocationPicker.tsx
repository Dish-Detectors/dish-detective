"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  MapMouseEvent,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { Box, TextField, Typography, Paper } from "@mui/material";

interface Location {
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  initialLocation?: Location;
  initialAddress?: string;
  onLocationChange: (location: Location, address: string) => void;
}

const ZAGREB_CENTER = { lat: 45.815, lng: 15.9819 };

function LocationPickerContent({
  initialLocation,
  initialAddress,
  onLocationChange,
}: MapLocationPickerProps) {
  const [position, setPosition] = useState<Location>(
    initialLocation || ZAGREB_CENTER,
  );
  const [address, setAddress] = useState(initialAddress || "");
  const [mapZoom, setMapZoom] = useState(13);

  const placesLib = useMapsLibrary("places");
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync props
  useEffect(() => {
    if (initialLocation) setPosition(initialLocation);
    if (initialAddress) setAddress(initialAddress);
  }, [initialLocation, initialAddress]);

  // Initialize Autocomplete
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const ac = new placesLib.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address", "name"],
      types: ["establishment", "geocode"],
    });
    setAutocomplete(ac);
  }, [placesLib]);

  // Handle Selection
  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address || place.name || "";

        const newPos = { lat, lng };
        setPosition(newPos);
        setAddress(formattedAddress);
        setMapZoom(16);

        onLocationChange(newPos, formattedAddress);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, onLocationChange]);

  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail.latLng) {
      const newPos = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
      setPosition(newPos);
      onLocationChange(newPos, address);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddr = e.target.value;
    setAddress(newAddr);
  };

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField
        inputRef={inputRef}
        fullWidth
        label="Adresa restorana"
        value={address}
        onChange={handleAddressChange}
      />

      <Paper
        elevation={0}
        sx={{
          height: 400,
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          position: "relative",
        }}
      >
        <Map
          defaultCenter={ZAGREB_CENTER}
          center={position}
          zoom={mapZoom}
          onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}
          mapId="DEMO_MAP_ID"
          onClick={handleMapClick}
          disableDefaultUI={false}
        >
          <AdvancedMarker position={position}>
            <Pin
              background={"#FBBC04"}
              glyphColor={"#000"}
              borderColor={"#000"}
            />
          </AdvancedMarker>
        </Map>

        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            bgcolor: "rgba(255,255,255,0.9)",
            p: 1,
            borderRadius: 2,
            boxShadow: 1,
            pointerEvents: "none",
          }}
        >
          <Typography variant="caption" fontWeight={600}>
            Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default function MapLocationPicker(props: MapLocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 2 }}>
        <Typography color="error.dark">
          Google Maps API Key missing. Location picker disabled.
        </Typography>
      </Box>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <LocationPickerContent {...props} />
    </APIProvider>
  );
}
