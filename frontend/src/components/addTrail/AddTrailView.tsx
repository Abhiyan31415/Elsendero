'use client';

import dynamic from 'next/dynamic';
import Protected from '../protected/Protected';
import MapLoading from '../map/MapLoading';

// The stepper bundles mapbox-gl, the geocoder and react-dropzone: split it out.
const AddTrails = dynamic(() => import('./AddTrails'), { ssr: false, loading: () => <MapLoading /> });

export default function AddTrailView() {
  return (
    <Protected>
      <AddTrails />
    </Protected>
  );
}
