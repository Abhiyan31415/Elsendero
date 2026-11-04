'use client';

import { useEffect, useRef } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from 'mapbox-gl';
import { useControl, type IControl } from 'react-map-gl';
import { MAPBOX_TOKEN } from '@/config';
import type { LngLat } from '@/types';

// The geocoder's @types target older mapbox-gl typings than v3 ships.
type GeocoderMapbox = NonNullable<MapboxGeocoder.GeocoderOptions['mapboxgl']>;

/** Geocoder search box inside a react-map-gl map; reports the picked place. */
function Geocoder({ onResult }: { onResult: (location: LngLat) => void }) {
  const callback = useRef(onResult);
  useEffect(() => {
    callback.current = onResult;
  }, [onResult]);

  useControl(() => {
    const ctrl = new MapboxGeocoder({ accessToken: MAPBOX_TOKEN, marker: false, collapsed: true, mapboxgl: mapboxgl as unknown as GeocoderMapbox });
    ctrl.on('result', (e: { result: { geometry: { coordinates: [number, number] } } }) => {
      const [lng, lat] = e.result.geometry.coordinates;
      callback.current({ lng, lat });
    });
    return ctrl as unknown as IControl;
  });
  return null;
}

export default Geocoder;
