'use client';

import { useEffect, useRef } from 'react';
import MapGL, { GeolocateControl, Marker, NavigationControl, type MapRef } from 'react-map-gl';
import { Box, Typography } from '@mui/material';
import { MAPBOX_TOKEN } from '@/config';
import type { LngLat } from '@/types';
import { MAP_STYLE, ipLocation } from '@/utils/mapbox';
import MissingTokenNotice from '../map/MissingTokenNotice';
import Geocoder from './Geocoder';

interface Props {
  label: string;
  value: LngLat;
  onChange: (location: LngLat) => void;
}

/** Draggable-marker picker used for the trail start and final locations. */
function LocationPicker({ label, value, onChange }: Props) {
  const { lng, lat } = value;
  const mapRef = useRef<MapRef | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const move = (location: LngLat) => {
    onChange(location);
    mapRef.current?.flyTo({ center: [location.lng, location.lat] });
  };

  // No location yet: centre on the visitor's approximate position.
  const initial = useRef(value);
  useEffect(() => {
    if (initial.current.lng || initial.current.lat) return;
    let cancelled = false;
    void ipLocation().then((loc) => {
      if (!loc || cancelled) return;
      onChangeRef.current(loc);
      mapRef.current?.flyTo({ center: [loc.lng, loc.lat] });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!MAPBOX_TOKEN) return <MissingTokenNotice />;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}: search for a place, use your location, or drag the marker.
      </Typography>
      <Box sx={{ height: 400, position: 'relative' }}>
        <MapGL
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{ latitude: lat, longitude: lng, zoom: 8 }}
          mapStyle={MAP_STYLE}
        >
          <Marker
            latitude={lat}
            longitude={lng}
            draggable
            onDragEnd={(e) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
          />
          <NavigationControl position="bottom-right" />
          <GeolocateControl
            position="top-left"
            trackUserLocation
            onGeolocate={(e) => onChange({ lat: e.coords.latitude, lng: e.coords.longitude })}
          />
          <Geocoder onResult={move} />
        </MapGL>
      </Box>
    </Box>
  );
}

export default LocationPicker;
