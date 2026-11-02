'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, LoaderCircle, LogOut } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useMounted } from '@/lib/use-mounted';
import { SEED_EVENTS, mergeEventsWithSeeds } from '@/lib/seed-events';
import { toast } from '@/components/ui/toast';

interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  imageUrl?: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  joinedUsers?: string[];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=600';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function JoinedEventsPage() {
  const { data: session } = useSession() || {};
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const mounted = useMounted();

  const email = session?.user?.email ?? '';

  useEffect(() => {
    if (!mounted) return;

    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/joined?email=${encodeURIComponent(email)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as EventItem[];
          const apiList = Array.isArray(data) ? data : [];
          // `GET /joined` also returns the user's joined `seed-N` events
          // (tracked in the server's in-memory seedJoinStore). Match those
          // against the local seed data and merge, so joined seed cards
          // render immediately and reliably.
          const cleanEmail = email.trim().toLowerCase();
          const joinedSeeds = SEED_EVENTS.filter((seed) =>
            apiList.some(
              (ev) =>
                ev._id === seed._id &&
                Array.isArray(ev.joinedUsers) &&
                ev.joinedUsers.includes(cleanEmail),
            ),
          );
          setEvents(mergeEventsWithSeeds(apiList, joinedSeeds));
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to load joined events');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [email, mounted]);

  // Handle Leave Event Logic
  const handleLeaveEvent = async (eventId: string) => {
    if (!email) return;

    setLeavingId(eventId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
        if (toast?.add) {
          toast.add({
            title: 'Left Event',
            description: 'You have successfully left the event.',
            type: 'success',
          });
        }
      } else {
        throw new Error('Failed to leave');
      }
    } catch {
      if (toast?.add) {
        toast.add({
          title: 'Error',
          description: 'Failed to leave the event. Try again.',
          type: 'error',
        });
      }
    } finally {
      setLeavingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-slate-500 dark:text-slate-400">
        <LoaderCircle className="w-8 h-8 animate-spin text-[#0284c7]" />
        <span className="ml-3 font-medium">Loading joined events...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:text-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Joined Events</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        View all the upcoming and past volunteering events you have signed up for.
      </p>

      {events.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">You haven&apos;t joined any volunteer events yet.</p>
          <Link
            href="/upcoming-events"
            className="inline-block bg-[#0284c7] hover:bg-sky-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            Browse Upcoming Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const eventImg = event.imageUrl || event.image || FALLBACK_IMAGE;
            const parsedDate = new Date(event.date);
            const formattedDate = isNaN(parsedDate.getTime())
              ? event.date
              : parsedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

            const isLeavingThis = leavingId === event._id;

            return (
              <div
                key={event._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800">
                    <Image src={eventImg} alt={event.title} fill unoptimized className="object-cover" />
                  </div>
                  <div className="p-5">
                    <span className="inline-block bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                      {event.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-1">
                      <MapPin className="w-4 h-4 mr-1 text-[#0284c7] dark:text-sky-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <CalendarDays className="w-4 h-4 mr-1 text-[#0284c7] dark:text-sky-400 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Link
                    href={`/events/${event._id}`}
                    className="flex-1 text-center bg-[#0284c7] hover:bg-sky-700 text-white font-medium py-2 rounded-lg transition text-sm"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => handleLeaveEvent(event._id)}
                    disabled={isLeavingThis}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    title="Leave Event"
                  >
                    {isLeavingThis ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span>Leave</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
