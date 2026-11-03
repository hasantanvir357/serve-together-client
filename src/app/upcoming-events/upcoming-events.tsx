'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, Search, TriangleAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEED_EVENTS, mergeEventsWithSeeds } from '@/lib/seed-events';
import { useMounted } from '@/lib/use-mounted';
import EventBadge from '@/components/EventBadge';

const EVENTS_API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/events`
  : 'http://localhost:5000/api/events';

/** The categories the feed can be filtered by, plus "All". */
const CATEGORIES = ['All', 'Tree Plantation', 'Winter Clothes', 'Blood Drive', 'Cleanup', 'Education'] as const;

type Category = (typeof CATEGORIES)[number];

/** Event document structure */
type EventItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  organizerEmail?: string;
  imageUrl?: string;
  image?: string;
};

/** Image with a graceful placeholder when it fails to load. */
function EventImage({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = React.useState(false);
  const showPlaceholder = !src || failed;

  return showPlaceholder ? (
    <div className="flex aspect-[16/9] w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
      <CalendarDays className="size-10 text-sky-600 dark:text-sky-400" />
    </div>
  ) : (
    <img
      src={src}
      alt={title}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[16/9] w-full object-cover"
    />
  );
}

const DISPLAY_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export default function UpcomingEvents() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const mounted = useMounted();

  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<Category>('All');

  React.useEffect(() => {
    if (!mounted) return;

    const controller = new AbortController();
    const run = async () => {
      try {
        const response = await fetch(EVENTS_API_URL, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`The server responded with status ${response.status}.`);
        }
        const data: unknown = await response.json();
        const apiList = Array.isArray(data)
          ? data
          : Array.isArray((data as { events?: unknown }).events)
            ? (data as { events: EventItem[] }).events
            : [];

        // Seeds always render first; backend events merge in without
        // overwriting them (duplicates removed by title).
        setEvents(mergeEventsWithSeeds(apiList as EventItem[]));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        // Fallback to dummy events on network failure
        setEvents(SEED_EVENTS);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [reloadKey, mounted]);

  const handleRetry = React.useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setReloadKey((key) => key + 1);
  }, []);

  const filteredEvents = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory = category === 'All' || event.category === category;
      const matchesQuery =
        !query || event.title.toLowerCase().includes(query) || event.location.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [events, search, category]);

  if (!mounted) {
    return null;
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-10 dark:text-slate-100">
      <div className="grid gap-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Upcoming Events</h1>
        <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-300">
          Discover volunteer opportunities near you and be the change.
        </p>
      </div>

      {/* Filters: search by title/location, filter by category. */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-card p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor="event-search" className="dark:text-slate-200">
            Search events
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id="event-search"
              type="search"
              placeholder="Search by title or location…"
              className="pl-8 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2 sm:w-56">
          <Label htmlFor="event-category" className="dark:text-slate-200">
            Category
          </Label>
          <Select value={category} onValueChange={(value) => setCategory((value ?? 'All') as Category)}>
            <SelectTrigger
              id="event-category"
              className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              aria-label="Filter by category"
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-900 dark:border-slate-800 dark:text-white">
              {CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="grid gap-3 rounded-xl border p-4 dark:border-slate-800">
              <div className="aspect-[16/9] animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="grid gap-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg dark:text-white">Could not load events</CardTitle>
            <CardDescription className="mx-auto max-w-sm dark:text-slate-300">
              {loadError} Make sure the API server is running, then try again.
            </CardDescription>
            <Button
              variant="outline"
              className="mt-4 w-fit dark:border-slate-700 dark:text-white"
              onClick={handleRetry}
            >
              Try again
            </Button>
          </CardHeader>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-sky-100 text-[#0284c7] dark:bg-sky-950/50 dark:text-sky-400">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg dark:text-white">
              {events.length === 0 ? 'No events yet' : 'No events match your filters'}
            </CardTitle>
            <CardDescription className="mx-auto max-w-sm dark:text-slate-300">
              {events.length === 0
                ? 'There are no upcoming events right now — check back soon.'
                : 'Try a different search term or category.'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
              <p className="text-sm text-slate-500 dark:text-slate-300">
            Showing {filteredEvents.length} of {events.length} event
            {events.length === 1 ? '' : 's'}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const parsedDate = new Date(event.date);
              const formattedDate = isNaN(parsedDate.getTime()) ? event.date : DISPLAY_DATE_FORMAT.format(parsedDate);
              const eventImg =
                event.imageUrl ||
                event.image ||
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800';

              return (
                <Card
                  key={event._id || event.title}
                  className="flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <EventImage src={eventImg} title={event.title} />
                  <CardHeader className="gap-2 p-5">
                    <EventBadge label={event.category} />
                    <CardTitle className="line-clamp-1 text-xl font-bold dark:text-white">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm dark:text-slate-300">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5 pt-0 text-sm text-slate-600 dark:text-slate-300">
                    <div className="grid gap-2">
                      <span className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="truncate">{event.location}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="tabular-nums">
                          Target: {event.volunteersNeeded} volunteer
                          {event.volunteersNeeded === 1 ? '' : 's'}
                        </span>
                      </span>
                    </div>
                    <Link
                      href={`/events/${event._id}`}
                      className="mt-2 w-full rounded-lg bg-[#0284c7] hover:bg-sky-700 text-white font-medium py-2.5 text-center text-sm transition"
                    >
                      View Details
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
