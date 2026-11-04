import type { Metadata } from 'next';
import TrailsList from '@/components/trails/TrailsList';

export const metadata: Metadata = {
  title: 'Trails',
  description: 'Browse travel trails shared by the Gantabya community.',
};

export default function TrailsPage() {
  return <TrailsList />;
}
