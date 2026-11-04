'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MapGL, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type MapLayerMouseEvent,
  type ViewStateChangeEvent,
} from 'react-map-gl';
import Supercluster from 'supercluster';
import { Avatar, Box, Paper, Tooltip, Typography } from '@mui/material';
import { MAPBOX_TOKEN } from '@/config';
import { useValue } from '@/context/ContextProvider';
import { getTrails } from '@/actions/trail';
import { recordId, type Trail } from '@/types';
import { toImageUrl } from '@/utils/imageUrl';
import { MAP_STYLE, checkpointsToGeoJSON, fetchRoute, type RouteFeature } from '@/utils/mapbox';
import GeocoderInput from './GeocoderInput';
import PopupTrail from './PopupTrail';
import MissingTokenNotice from './MissingTokenNotice';

type PointProps = { trail: Trail };
type BBox = [number, number, number, number];

function ClusterMap() {
  const {
    state: { filteredTrails },
    dispatch,
    mapRef,
  } = useValue();
  const [routeGeometry, setRouteGeometry] = useState<RouteFeature | null>(null);
  const [bounds, setBounds] = useState<BBox>([-180, -85, 180, 85]);
  const [zoom, setZoom] = useState(6);
  const [popupTrail, setPopupTrail] = useState<Trail | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<{ description: string; coordinates: [number, number] } | null>(null);

  useEffect(() => {
    void getTrails(dispatch);
  }, [dispatch]);

  const index = useMemo(() => {
    const sc = new Supercluster<PointProps>({ radius: 75, maxZoom: 20 });
    sc.load(
      filteredTrails
        .filter((t) => Array.isArray(t.sloc))
        .map((trail) => ({
          type: 'Feature' as const,
          properties: { trail },
          geometry: { type: 'Point' as const, coordinates: [trail.sloc[0], trail.sloc[1]] },
        })),
    );
    return sc;
  }, [filteredTrails]);

  const clusters = useMemo(() => index.getClusters(bounds, zoom), [index, bounds, zoom]);
  const total = Math.max(filteredTrails.length, 1);

  const syncView = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    setBounds(map.getBounds()?.toArray().flat() as BBox);
    setZoom(Math.round(map.getZoom()));
  }, [mapRef]);

  const checkpointData = useMemo(
    () => (popupTrail ? checkpointsToGeoJSON(popupTrail.checkp) : null),
    [popupTrail],
  );

  useEffect(() => {
    if (!popupTrail?.sloc || !popupTrail.floc) {
      setRouteGeometry(null);
      return undefined;
    }
    const controller = new AbortController();
    void fetchRoute(
      [popupTrail.sloc, ...(popupTrail.checkp ?? []).map(([lng, lat]) => [lng, lat] as [number, number]), popupTrail.floc],
      controller.signal,
    ).then((route) => {
      if (!controller.signal.aborted) setRouteGeometry(route);
    });
    return () => controller.abort();
  }, [popupTrail]);

  const handleClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.find((f) => f.layer?.id === 'checkpoint-layer');
    if (feature && feature.geometry.type === 'Point') {
      setSelectedCheckpoint({
        description: String(feature.properties?.description ?? ''),
        coordinates: feature.geometry.coordinates as [number, number],
      });
    } else {
      setSelectedCheckpoint(null);
    }
  };

  if (!MAPBOX_TOKEN) return <MissingTokenNotice />;

  return (
    <Box sx={{ height: 'calc(100dvh - 56px - 64px)', width: '100%' }}>
      <MapGL
        initialViewState={{ latitude: 27, longitude: 88, zoom: 6 }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        ref={mapRef}
        onLoad={syncView}
        onMoveEnd={(_e: ViewStateChangeEvent) => syncView()}
        onClick={handleClick}
        interactiveLayerIds={checkpointData ? ['checkpoint-layer'] : []}
      >
        {clusters.map((feature) => {
          const [longitude, latitude] = feature.geometry.coordinates as [number, number];
          if ('cluster' in feature.properties && feature.properties.cluster) {
            const clusterId = feature.id as number;
            const count = feature.properties.point_count;
            const size = 10 + (count / total) * 20;
            return (
              <Marker key={`cluster-${clusterId}`} longitude={longitude} latitude={latitude}>
                <div
                  className="trail-cluster"
                  style={{ width: size, height: size }}
                  onClick={() => {
                    const expansionZoom = Math.min(index.getClusterExpansionZoom(clusterId), 20);
                    mapRef.current?.flyTo({ center: [longitude, latitude], zoom: expansionZoom, speed: 1 });
                  }}
                >
                  {count}
                </div>
              </Marker>
            );
          }
          const { trail } = feature.properties as PointProps;
          return (
            <Marker key={`trail-${recordId(trail)}`} longitude={longitude} latitude={latitude}>
              <Tooltip title={trail.uName}>
                <Avatar
                  src={toImageUrl(trail.uPhoto)}
                  alt={trail.uName}
                  component={Paper}
                  elevation={2}
                  sx={{ cursor: 'pointer' }}
                  onMouseEnter={() => setPopupTrail(trail)}
                  onClick={() => setPopupTrail(trail)}
                >
                  {trail.uName?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            </Marker>
          );
        })}
        <GeocoderInput />

        {routeGeometry && (
          <Source id="route" type="geojson" data={routeGeometry}>
            <Layer id="route-layer" type="line" paint={{ 'line-color': '#3887be', 'line-width': 4 }} />
          </Source>
        )}
        {checkpointData && (
          <Source id="checkpoints" type="geojson" data={checkpointData}>
            <Layer
              id="checkpoint-layer"
              type="circle"
              paint={{
                'circle-radius': 6,
                'circle-color': '#FFFF00',
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',
              }}
            />
            <Layer
              id="checkpoint-label"
              type="symbol"
              layout={{
                'text-field': ['get', 'description'],
                'text-offset': [0, -1.5],
                'text-anchor': 'bottom',
                'text-size': 12,
              }}
              paint={{ 'text-color': '#000', 'text-halo-color': '#fff', 'text-halo-width': 1 }}
            />
          </Source>
        )}

        {popupTrail && (
          <Popup
            longitude={popupTrail.sloc[0]}
            latitude={popupTrail.sloc[1]}
            maxWidth="auto"
            closeOnClick={false}
            focusAfterOpen={false}
            onClose={() => setPopupTrail(null)}
          >
            <PopupTrail trail={popupTrail} />
          </Popup>
        )}
        {selectedCheckpoint && (
          <Popup
            longitude={selectedCheckpoint.coordinates[0]}
            latitude={selectedCheckpoint.coordinates[1]}
            onClose={() => setSelectedCheckpoint(null)}
            closeButton
            closeOnClick={false}
            anchor="bottom"
          >
            <Box sx={{ p: 1, minWidth: 150, maxWidth: 300 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'center', wordBreak: 'break-word' }}>
                {selectedCheckpoint.description}
              </Typography>
            </Box>
          </Popup>
        )}

        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
      </MapGL>
    </Box>
  );
}

export default ClusterMap;
