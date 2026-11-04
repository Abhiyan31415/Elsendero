import type { Metadata } from 'next';
import EventCard from '@/components/events/EventCard';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Group trips and meetups planned by the Gantabya community.',
};

export default function EventsPage() {
  return <EventCard />;
}
