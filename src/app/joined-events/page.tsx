'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, LoaderCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../lib/auth-client';
import { useMounted } from '../../lib/use-mounted';
import { toast } from '../../components/ui/toast';
import { API_BASE_URL, getAuthHeaders } from '../../lib/api-client';
import EventBadge from '../../components/EventBadge';

interface EventItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  imageUrl?: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  joinedUsers?: string[];
  volunteers?: string[];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=600';

export default function JoinedEventsPage() {
  const { user: authUser } = useAuth() || {};
  const { data: session, isPending: isSessionPending } = useSession() || {};
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const mounted = useMounted();

  const userEmail = (authUser?.email || session?.user?.email || '').trim().toLowerCase();

  useEffect(() => {
    if (!mounted) return;
    if (isSessionPending && !authUser) return;

    if (!userEmail) {
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      try {
        setIsLoading(true);
        const authHeaders = getAuthHeaders();
        if (!authHeaders) {
          throw new Error('Your session has expired. Please sign in again.');
        }

        const res = await fetch(`${API_BASE_URL}/api/events/joined?userEmail=${encodeURIComponent(userEmail)}`, {
          signal: controller.signal,
          credentials: 'include',
          headers: authHeaders,
        });

        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : []);
        } else {
          setEvents([]);
        }
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          toast.add({
            title: 'Could not load joined events',
            description: error instanceof Error ? error.message : 'Please try again.',
            type: 'error',
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [userEmail, isSessionPending, authUser, mounted]);

  const handleLeaveEvent = async (eventId: string) => {
    if (!userEmail) return;

    setLeavingId(eventId);
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({ userEmail }),
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

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
            className="inline-block bg-[#0284c7] hover:bg-sky-700 text-white font-medium px-6 py-2.5 rounded-lg transition cursor-pointer"
          >
            Browse Upcoming Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => {
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
                    <EventBadge label={event.category} className="mb-3 rounded-full" />
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
                    className="flex-1 text-center bg-[#0284c7] hover:bg-sky-700 text-white font-medium py-2 rounded-lg transition text-sm cursor-pointer"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleLeaveEvent(event._id)}
                    disabled={isLeavingThis}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/50 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
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
