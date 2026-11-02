'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  location: string;
  date: string;
  volunteersNeeded: number;
}

export default function JoinedEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const email = session?.user?.email ?? '';

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/joined?email=${encodeURIComponent(email)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as EventItem[];
          setEvents(data);
        }
      } catch {
        console.error('Failed to load joined events');
      } finally {
        // Only finalize loading state if the request was not cancelled.
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [email]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading joined events...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Joined Events</h1>
      <p className="text-slate-500 mb-6">View all the upcoming and past volunteering events you have signed up for.</p>

      {events.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-600 mb-4">You haven&apos;t joined any volunteer events yet.</p>
          <Link
            href="/upcoming-events"
            className="inline-block bg-[#0284c7] hover:bg-sky-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            Browse Upcoming Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <img
                src={event.image || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=600'}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <span className="inline-block bg-sky-100 text-[#0284c7] text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  {event.category}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{event.title}</h3>
                <div className="flex items-center text-sm text-slate-500 mb-1">
                  <MapPin className="w-4 h-4 mr-1 text-[#0284c7]" /> {event.location}
                </div>
                <div className="flex items-center text-sm text-slate-500 mb-4">
                  <CalendarDays className="w-4 h-4 mr-1 text-[#0284c7]" />
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <Link
                  href={`/events/${event._id}`}
                  className="block text-center w-full bg-[#0284c7] hover:bg-sky-700 text-white font-medium py-2 rounded-lg transition text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
