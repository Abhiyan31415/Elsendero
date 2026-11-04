'use client';

import dynamic from 'next/dynamic';
import MapLoading from './MapLoading';

// mapbox-gl and supercluster are browser-only and heavy: load them in their own chunk.
const ClusterMap = dynamic(() => import('./ClusterMap'), {
  ssr: false,
  loading: () => <MapLoading height="calc(100dvh - 120px)" />,
});

export default function MapView() {
  return <ClusterMap />;
}
