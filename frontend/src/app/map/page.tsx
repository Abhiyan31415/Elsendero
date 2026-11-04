import type { Metadata } from 'next';
import MapView from '@/components/map/MapView';

export const metadata: Metadata = {
  title: 'Trail map',
  description: 'Explore travel trails near you on an interactive map.',
};

export default function MapPage() {
  return <MapView />;
}
