import type { Metadata } from 'next';
import EventDetails from './event-details';

export const metadata: Metadata = {
  title: 'Event Details | ServeTogether',
};

export default async function EventDetailsPage({ params }: PageProps<'/events/[id]'>) {
  const { id } = await params;
  return <EventDetails eventId={id} />;
}
