'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Users, Mail, TriangleAlert, LoaderCircle, LogIn } from 'lucide-react';

import { useSession } from '../../../lib/auth-client';
import { useAuth } from '../../../context/AuthContext';
import { useMounted } from '../../../lib/use-mounted';
import { findSeedEvent } from '../../../lib/seed-events';
import { toast } from '../../../components/ui/toast';
import { getAuthHeaders } from '../../../lib/api-client';
import EventBadge from '../../../components/EventBadge';

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
  volunteers?: string[];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format&fit=crop';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EventDetails({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const { user: authUser } = useAuth();

  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [volunteersNeeded, setVolunteersNeeded] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mounted = useMounted();

  const userEmail = useMemo(
    () =>
      (session?.user?.email || authUser?.email || '').trim().toLowerCase(),
    [session?.user?.email, authUser?.email],
  );

  const hasJoined = Boolean(
    userEmail && volunteers.some((email) => email.trim().toLowerCase() === userEmail),
  );

  useEffect(() => {
    if (!mounted) return;

    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
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
        setVolunteers(data?.volunteers ?? data?.joinedUsers ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        const seedMatch = findSeedEvent(eventId);
        if (seedMatch) {
          setEvent(seedMatch);
          setVolunteersNeeded(seedMatch.volunteersNeeded);
          setVolunteers(seedMatch.joinedUsers ?? []);
        } else {
          setLoadError(error instanceof Error ? error.message : 'Something went wrong while loading the event.');
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [eventId, mounted]);

  const requireLogin = (): boolean => {
    if (userEmail) return true;
    toast.add({
      title: 'Please login to join',
      description: 'You need to be signed in to join or leave this event.',
      type: 'warning',
    });
    router.push('/login');
    return false;
  };

  const handleToggleVolunteer = async () => {
    if (!requireLogin() || !event || isSubmitting) return;

    const joining = !hasJoined;
    setIsSubmitting(true);

    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      toast.add({
        title: 'Session expired',
        description: 'Please sign in again before changing your event status.',
        type: 'error',
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/${joining ? 'join' : 'leave'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ userEmail, email: userEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setVolunteers((prev) =>
          joining
            ? [...prev.filter((email) => email.trim().toLowerCase() !== userEmail), userEmail]
            : prev.filter((email) => email.trim().toLowerCase() !== userEmail),
        );
        setVolunteersNeeded((prev) => Math.max(0, prev + (joining ? -1 : 1)));
        toast.add({
          title: joining ? 'Joined!' : 'Left Event',
          description: joining
            ? 'Successfully joined as a volunteer!'
            : 'You have successfully left the event.',
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Error',
          description:
            data.message || data.error || (joining ? 'Failed to join event' : 'Failed to leave event'),
          type: 'error',
        });
      }
    } catch {
      toast.add({
        title: 'Error',
        description: joining ? 'An error occurred while joining.' : 'An error occurred while leaving.',
        type: 'error',
      });
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
          <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">{loadError}</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-slate-500 dark:text-slate-300">
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
            <EventBadge label={event?.category ?? 'Community event'} className="mb-2" />
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
            onClick={handleToggleVolunteer}
            disabled={isSubmitting || (!hasJoined && volunteersNeeded <= 0)}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition ${
              hasJoined
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#0284c7] hover:bg-sky-700 text-white'
            }`}
          >
            {isSubmitting
              ? hasJoined
                ? 'Leaving...'
                : 'Joining...'
              : hasJoined
                ? 'Leave Event'
                : 'Join as Volunteer'}
          </button>

          {hasJoined && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
              Your spot is confirmed! Check your Joined Events page.
            </p>
          )}

          {!userEmail && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 py-1.5 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in to join this event
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
