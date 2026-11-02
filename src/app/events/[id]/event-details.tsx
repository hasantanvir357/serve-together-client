'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, Users, Mail, TriangleAlert, LoaderCircle } from 'lucide-react';

import { useSession } from '@/lib/auth-client';
import { useMounted } from '@/lib/use-mounted';
import { findSeedEvent } from '@/lib/seed-events';
import { toast } from '@/components/ui/toast';

interface EventDoc {
  _id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  imageUrl?: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  organizerEmail?: string;
  creatorEmail?: string;
  joinedUsers?: string[];
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format&fit=crop';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EventDetails({ eventId }: { eventId: string }) {
  const { data: session } = useSession() || {};
  const userEmail = session?.user?.email ?? '';

  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [volunteersNeeded, setVolunteersNeeded] = useState(0);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;

    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}`,
          { signal: controller.signal, cache: 'no-store' }
        );
        if (!res.ok) {
          throw new Error(`The server responded with status ${res.status}.`);
        }
        const parsed: unknown = await res.json();
        const data =
          parsed && typeof parsed === 'object' && 'event' in parsed
            ? (parsed as { event: EventDoc }).event
            : (parsed as EventDoc);
            
        setEvent(data);
        setVolunteersNeeded(data?.volunteersNeeded ?? 0);
        setHasJoined(Boolean(userEmail && data?.joinedUsers?.includes(userEmail)));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to load event', error);

        // Seed cards use dummy IDs (`seed-1` … `seed-5`) that the API cannot
        // resolve as Mongo documents — render from the shared fallback mock
        // data instead of showing an error page.
        const seedMatch = findSeedEvent(eventId);
        if (seedMatch) {
          setEvent(seedMatch);
          setVolunteersNeeded(seedMatch.volunteersNeeded);
          setHasJoined(Boolean(userEmail && seedMatch.joinedUsers?.includes(userEmail)));
        } else {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Something went wrong while loading the event.'
          );
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [eventId, userEmail, mounted]);

  const handleJoin = async () => {
    if (hasJoined || !event) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${event._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setHasJoined(true);
        setVolunteersNeeded((prev) => Math.max(0, prev - 1));
        if (toast?.add) {
          toast.add({ title: 'Success!', description: 'Successfully joined as a volunteer!', type: 'success' });
        }
      } else {
        if (toast?.add) {
          toast.add({ title: 'Error', description: data.message || 'Failed to join event', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error joining event:', error);
      if (toast?.add) {
        toast.add({ title: 'Error', description: 'An error occurred while joining.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-start gap-6 px-4 py-10 dark:text-slate-100">
        <Link
          href="/upcoming-events"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0284c7] dark:text-slate-300 dark:hover:text-sky-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-10 text-center">
          <TriangleAlert className="size-8 text-red-500" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Could not load this event</h1>
          <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">{loadError}</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-slate-500 dark:text-slate-400">
        <LoaderCircle className="w-8 h-8 animate-spin text-[#0284c7]" />
        <span className="ml-3 font-medium">Loading event details...</span>
      </div>
    );
  }

  const eventDate = new Date(event?.date);
  const organizer = event?.organizerEmail || event?.creatorEmail || 'Volunteer Organizer';

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-4 py-10 dark:text-slate-100">
      <Link
        href="/upcoming-events"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0284c7] dark:text-slate-300 dark:hover:text-sky-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Column */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <img
              src={event?.image || event?.imageUrl || FALLBACK_IMAGE}
              alt={event?.title || 'Event Image'}
              className="h-72 w-full object-cover"
            />
          </div>

          <div>
            <span className="inline-block bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 text-xs font-semibold px-3 py-1 rounded-md mb-2">
              {event?.category}
            </span>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{event?.title}</h1>

            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0284c7] dark:text-sky-400" />
                <span>Organized by {organizer}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#0284c7] dark:text-sky-400" />
                <span>
                  {isNaN(eventDate.getTime())
                    ? event?.date || 'Date TBA'
                    : eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0284c7] dark:text-sky-400" />
                <span>{event?.location}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">About this event</h2>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {event?.description}
            </p>
          </div>
        </div>

        {/* Sidebar Action Card */}
        <div className="h-fit space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white">Join this event</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Users className="w-4 h-4 text-[#0284c7] dark:text-sky-400" />
            <span>{volunteersNeeded} volunteers still needed</span>
          </div>

          <button
            onClick={handleJoin}
            disabled={hasJoined || volunteersNeeded <= 0 || isSubmitting || !userEmail}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition ${
              hasJoined
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                : 'bg-[#0284c7] hover:bg-sky-700 text-white'
            }`}
          >
            {isSubmitting ? 'Joining...' : hasJoined ? "You've Joined" : 'Join as Volunteer'}
          </button>

          {hasJoined && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
              Your spot is confirmed! Check your Joined Events page.
            </p>
          )}
          {!userEmail && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center font-medium">
              Sign in to join this event.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}