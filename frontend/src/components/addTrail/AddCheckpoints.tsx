'use client';

import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import MapGL, { Layer, Marker, NavigationControl, Popup, Source, type MapLayerMouseEvent } from 'react-map-gl';
import { Box, Button, TextField, Tooltip, Typography } from '@mui/material';
import { Delete, Flag, Navigation, Save } from '@mui/icons-material';
import { MAPBOX_TOKEN } from '@/config';
import { useValue } from '@/context/ContextProvider';
import type { Checkpoint, LngLatTuple } from '@/types';
import { MAP_STYLE, fetchRoute, type RouteFeature } from '@/utils/mapbox';
import MissingTokenNotice from '../map/MissingTokenNotice';

type Selected = Checkpoint & { index: number };

function AddCheckpoints() {
  const {
    state: { slocation, flocation, checkpoints },
    dispatch,
  } = useValue();
  const [routeGeometry, setRouteGeometry] = useState<RouteFeature | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Selected | null>(null);
  const [description, setDescription] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const waypoints = useMemo<LngLatTuple[]>(
    () => [
      [slocation.lng, slocation.lat],
      ...checkpoints.map((c): LngLatTuple => [c.lng, c.lat]),
      [flocation.lng, flocation.lat],
    ],
    [slocation, flocation, checkpoints],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchRoute(waypoints, controller.signal).then((r) => {
      if (!controller.signal.aborted) setRouteGeometry(r);
    });
    return () => controller.abort();
  }, [waypoints]);

  // Fit start and finish in view.
  const initialView = useMemo(() => {
    const maxDist = Math.max(Math.abs(slocation.lng - flocation.lng), Math.abs(slocation.lat - flocation.lat));
    const zoom = maxDist > 0 ? Math.min(8, Math.floor(Math.log2(360 / (maxDist * 4))) + 1) : 8;
    return {
      longitude: (slocation.lng + flocation.lng) / 2,
      latitude: (slocation.lat + flocation.lat) / 2,
      zoom: Math.max(zoom, 5),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the first view matters
  }, []);

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) return;
    const { lng, lat } = event.lngLat;
    const newCheckpoint: Checkpoint = { lng, lat, description: '' };
    dispatch({ type: 'ADD_CHECKPOINT', payload: newCheckpoint });
    setSelectedPoint({ ...newCheckpoint, index: checkpoints.length });
    setDescription('');
  };

  const handleDeleteCheckpoint = (index: number, event?: MouseEvent) => {
    event?.stopPropagation();
    dispatch({ type: 'DELETE_CHECKPOINT', payload: index });
    setSelectedPoint(null);
    setHoveredIndex(null);
  };

  const handleSaveDescription = (index: number) => {
    dispatch({ type: 'UPDATE_CHECKPOINT', payload: { index, description } });
    setSelectedPoint(null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && selectedPoint) {
      event.preventDefault();
      handleSaveDescription(selectedPoint.index);
    }
  };

  if (!MAPBOX_TOKEN) return <MissingTokenNotice />;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Click the map to add checkpoints. Double-click a checkpoint to edit its description; hover to delete it.
      </Typography>
      <Box sx={{ height: 400, position: 'relative', '& .mapboxgl-marker': { transition: 'transform 0.2s' } }}>
        <MapGL
          initialViewState={initialView}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          onClick={handleMapClick}
          interactiveLayerIds={routeGeometry ? ['route'] : []}
          doubleClickZoom={false}
        >
          {routeGeometry && (
            <Source type="geojson" data={routeGeometry}>
              <Layer
                id="route"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.8 }}
              />
            </Source>
          )}

          <Marker latitude={slocation.lat} longitude={slocation.lng} anchor="bottom">
            <Tooltip title="Start Location" arrow placement="top">
              <Navigation sx={{ color: 'primary.main', transform: 'scale(1.5)' }} />
            </Tooltip>
          </Marker>

          {checkpoints.map((checkpoint, index) => (
            <Marker key={`${checkpoint.lng},${checkpoint.lat},${index}`} latitude={checkpoint.lat} longitude={checkpoint.lng} anchor="bottom">
              <Box
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2">Checkpoint {index + 1}</Typography>
                      <Typography variant="body2">{checkpoint.description || 'No description added'}</Typography>
                    </Box>
                  }
                  placement="top"
                  arrow
                >
                  <Navigation
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedPoint({ ...checkpoint, index });
                      setDescription(checkpoint.description || '');
                    }}
                    sx={{ color: 'error.main', transform: 'scale(1.5)', '&:hover': { transform: 'scale(1.8)' }, cursor: 'pointer' }}
                  />
                </Tooltip>
                {hoveredIndex === index && (
                  <Box
                    role="button"
                    aria-label={`Delete checkpoint ${index + 1}`}
                    onClick={(e) => handleDeleteCheckpoint(index, e)}
                    sx={{
                      position: 'absolute',
                      left: '100%',
                      ml: 1,
                      bgcolor: 'error.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </Box>
                )}
              </Box>
            </Marker>
          ))}

          <Marker latitude={flocation.lat} longitude={flocation.lng} anchor="bottom">
            <Tooltip title="End Location" arrow placement="top">
              <Flag sx={{ color: 'secondary.main', transform: 'scale(1.5)' }} />
            </Tooltip>
          </Marker>

          {selectedPoint && (
            <Popup
              latitude={selectedPoint.lat}
              longitude={selectedPoint.lng}
              closeOnClick={false}
              onClose={() => setSelectedPoint(null)}
              offset={25}
            >
              <Box sx={{ p: 1, minWidth: 200 }}>
                <Box sx={{ mb: 1 }}>Checkpoint {selectedPoint.index + 1}</Box>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" startIcon={<Save />} onClick={() => handleSaveDescription(selectedPoint.index)}>
                    Save
                  </Button>
                </Box>
              </Box>
            </Popup>
          )}
          <NavigationControl position="bottom-right" />
        </MapGL>
      </Box>
    </Box>
  );
}

export default AddCheckpoints;
