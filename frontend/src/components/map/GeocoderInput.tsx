'use client';

import { useEffect, useRef } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/config';
import { useValue } from '@/context/ContextProvider';

// The geocoder's @types target older mapbox-gl typings than v3 ships.
type GeocoderMapbox = NonNullable<MapboxGeocoder.GeocoderOptions['mapboxgl']>;

/** Mounts a Mapbox geocoder into the sidebar slot; picking a place filters trails near it. */
const GeocoderInput = () => {
  const {
    mapRef,
    containerRef,
    dispatch,
    state: { addressFilter },
  } = useValue();
  const ctrlRef = useRef<MapboxGeocoder | null>(null);

  // "Reset" in the filters drawer clears the address filter; clear the search box to match.
  useEffect(() => {
    if (addressFilter === null) ctrlRef.current?.clear();
  }, [addressFilter]);

  useEffect(() => {
    const container = containerRef.current;
    const map = mapRef.current?.getMap();
    if (!container || !map) return undefined;

    const ctrl = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      marker: false,
      placeholder: 'Search a place',
      mapboxgl: mapboxgl as unknown as GeocoderMapbox,
    });
    ctrlRef.current = ctrl;
    container.replaceChildren(ctrl.onAdd(map as unknown as Parameters<typeof ctrl.onAdd>[0]));
    ctrl.on('result', (e: { result: { geometry: { coordinates: [number, number] } } }) => {
      const [lng, lat] = e.result.geometry.coordinates;
      dispatch({ type: 'FILTER_ADDRESS', payload: { lng, lat } });
    });
    ctrl.on('clear', () => dispatch({ type: 'CLEAR_ADDRESS' }));

    return () => {
      try {
        ctrl.onRemove();
      } catch {
        // already detached
      }
      ctrlRef.current = null;
      container.replaceChildren();
    };
  }, [mapRef, containerRef, dispatch]);

  return null;
};

export default GeocoderInput;
