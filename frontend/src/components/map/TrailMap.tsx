'use client';

import { useEffect, useMemo, useState } from 'react';
import MapGL, { Layer, Marker, NavigationControl, Source } from 'react-map-gl';
import { Flag, Navigation } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { MAPBOX_TOKEN } from '@/config';
import type { CheckpointTuple, LngLatTuple } from '@/types';
import { MAP_STYLE, checkpointsToGeoJSON, fetchRoute, type RouteFeature } from '@/utils/mapbox';
import MissingTokenNotice from './MissingTokenNotice';

export interface TrailMapProps {
  sloc: LngLatTuple;
  floc: LngLatTuple;
  checkp: CheckpointTuple[];
  height?: number;
}

/** Read-only map of a single trail: start, finish, checkpoints and the driving route. */
const TrailMap = ({ sloc, floc, checkp, height = 400 }: TrailMapProps) => {
  const [route, setRoute] = useState<RouteFeature | null>(null);
  const checkpoints = useMemo(() => checkpointsToGeoJSON(checkp), [checkp]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchRoute([sloc, ...(checkp ?? []).map(([lng, lat]) => [lng, lat] as LngLatTuple), floc], controller.signal).then(
      (r) => {
        if (!controller.signal.aborted) setRoute(r);
      },
    );
    return () => controller.abort();
  }, [sloc, floc, checkp]);

  if (!MAPBOX_TOKEN) return <MissingTokenNotice />;

  const all = [sloc, floc, ...(checkp ?? []).map(([lng, lat]) => [lng, lat] as LngLatTuple)];
  const lngs = all.map((p) => p[0]);
  const lats = all.map((p) => p[1]);
  const degenerate = Math.max(...lngs) - Math.min(...lngs) < 1e-6 && Math.max(...lats) - Math.min(...lats) < 1e-6;

  return (
    <Box sx={{ height, borderRadius: 2, overflow: 'hidden' }}>
      <MapGL
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        initialViewState={
          degenerate
            ? { longitude: sloc[0], latitude: sloc[1], zoom: 10 }
            : {
                bounds: [
                  [Math.min(...lngs), Math.min(...lats)],
                  [Math.max(...lngs), Math.max(...lats)],
                ],
                fitBoundsOptions: { padding: 48 },
              }
        }
      >
        {route && (
          <Source id="trail-route" type="geojson" data={route}>
            <Layer id="trail-route-layer" type="line" paint={{ 'line-color': '#3887be', 'line-width': 4 }} />
          </Source>
        )}
        <Source id="trail-checkpoints" type="geojson" data={checkpoints}>
          <Layer
            id="trail-checkpoint-layer"
            type="circle"
            paint={{ 'circle-radius': 6, 'circle-color': '#FFFF00', 'circle-stroke-width': 1, 'circle-stroke-color': '#fff' }}
          />
          <Layer
            id="trail-checkpoint-label"
            type="symbol"
            layout={{ 'text-field': ['get', 'description'], 'text-offset': [0, -1.5], 'text-anchor': 'bottom', 'text-size': 12 }}
            paint={{ 'text-color': '#000', 'text-halo-color': '#fff', 'text-halo-width': 1 }}
          />
        </Source>
        <Marker longitude={sloc[0]} latitude={sloc[1]} anchor="bottom">
          <Tooltip title="Start" arrow>
            <Navigation color="primary" sx={{ transform: 'scale(1.5)' }} />
          </Tooltip>
        </Marker>
        <Marker longitude={floc[0]} latitude={floc[1]} anchor="bottom">
          <Tooltip title="Finish" arrow>
            <Flag color="error" sx={{ transform: 'scale(1.5)' }} />
          </Tooltip>
        </Marker>
        <NavigationControl position="bottom-right" />
      </MapGL>
    </Box>
  );
};

export default TrailMap;
