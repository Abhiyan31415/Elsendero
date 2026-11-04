import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { MAPBOX_TOKEN } from '@/config';
import type { CheckpointTuple, LngLatTuple } from '@/types';

// Outdoors shows footpaths, trekking trails, contour lines and peaks.
export const MAP_STYLE = 'mapbox://styles/mapbox/outdoors-v12';

export type RouteFeature = Feature<LineString>;

/** Walking route (follows footpaths and trekking trails) through the given [lng, lat] waypoints, via the Mapbox Directions API. */
export const fetchRoute = async (waypoints: LngLatTuple[], signal?: AbortSignal): Promise<RouteFeature | null> => {
  if (!MAPBOX_TOKEN || waypoints.length < 2) return null;
  const coordinates = waypoints.map((c) => c.join(',')).join(';');
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`,
      { signal },
    );
    const data = (await res.json()) as { routes?: { geometry: LineString }[] };
    const geometry = data.routes?.[0]?.geometry;
    return geometry ? { type: 'Feature', properties: {}, geometry } : null;
  } catch (error) {
    if ((error as Error)?.name !== 'AbortError') console.error('Error fetching route:', error);
    return null;
  }
};

/** Reverse-geocode a point to a human-readable place name. */
export const reverseGeocode = async ([lng, lat]: LngLatTuple, signal?: AbortSignal): Promise<string | null> => {
  if (!MAPBOX_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`,
      { signal },
    );
    const data = (await res.json()) as { features?: { place_name?: string }[] };
    return data.features?.[0]?.place_name ?? null;
  } catch {
    return null;
  }
};

export const checkpointsToGeoJSON = (
  checkpoints: CheckpointTuple[],
): FeatureCollection<Point, { description: string }> => ({
  type: 'FeatureCollection',
  features: (checkpoints ?? []).map(([lng, lat, description]) => ({
    type: 'Feature',
    properties: { description: String(description ?? '') },
    geometry: { type: 'Point', coordinates: [lng, lat] },
  })),
});

/** Rough location from the visitor's IP (used to centre empty pickers). */
export const ipLocation = async (): Promise<{ lng: number; lat: number } | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = (await res.json()) as { longitude?: number; latitude?: number };
    if (typeof data.longitude === 'number' && typeof data.latitude === 'number') {
      return { lng: data.longitude, lat: data.latitude };
    }
  } catch {
    // ignore
  }
  return null;
};
