'use client';

import dynamic from 'next/dynamic';
import MapLoading from './MapLoading';

/** Client-only wrapper so server components can render the trail map (mapbox-gl needs `window`). */
const TrailMapClient = dynamic(() => import('./TrailMap'), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default TrailMapClient;
