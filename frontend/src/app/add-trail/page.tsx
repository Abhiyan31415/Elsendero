import type { Metadata } from 'next';
import AddTrailView from '@/components/addTrail/AddTrailView';

export const metadata: Metadata = {
  title: 'Add a trail',
  robots: { index: false },
};

export default function AddTrailPage() {
  return <AddTrailView />;
}
