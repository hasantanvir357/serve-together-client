"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Users, TriangleAlert, HandHeart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format&fit=crop";

type EventItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  organizerEmail?: string;
  image?: string;
  imageUrl?: string;
  volunteers?: string[];
};

function EventImage({ src, title }: { src?: string; title: string }) {
  const initialSrc = src && src.trim() !== "" ? src : FALLBACK_IMAGE;
  const [imgSrc, setImgSrc] = React.useState(initialSrc);

  React.useEffect(() => {
    setImgSrc(src && src.trim() !== "" ? src : FALLBACK_IMAGE);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={title}
      loading="lazy"
      onError={() => setImgSrc(FALLBACK_IMAGE)}
      className="aspect-[16/9] w-full object-cover rounded-t-xl"
    />
  );
}

const DISPLAY_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function JoinedEventsPage() {
  const { user } = useAuth() || {};
  const email = user?.email ?? "";

  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadJoinedEvents = React.useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const userEmail = email || "volunteer@servetogether.com";
      
      let res = await fetch(
        `${API_BASE_URL}/api/events/joined?email=${encodeURIComponent(userEmail)}`,
        {
          signal,
          headers: {
            "Content-Type": "application/json",
            "x-user-email": userEmail,
          },
          cache: "no-store",
        }
      );

      let list: EventItem[] = [];

      if (res.ok) {
        const data: unknown = await res.json();
        list = Array.isArray(data)
          ? data
          : Array.isArray((data as { events?: unknown }).events)
            ? (data as { events: EventItem[] }).events
            : [];
      } else {
        const fallbackRes = await fetch(`${API_BASE_URL}/api/events`, { signal, cache: "no-store" });
        if (fallbackRes.ok) {
          const data: unknown = await fallbackRes.json();
          const allEvents: EventItem[] = Array.isArray(data)
            ? data
            : Array.isArray((data as { events?: unknown }).events)
              ? (data as { events: EventItem[] }).events
              : [];
          list = allEvents.filter((evt) =>
            Array.isArray(evt.volunteers) && evt.volunteers.includes(userEmail)
          );
        } else {
          throw new Error(`The server responded with status ${res.status}.`);
        }
      }

      // Requirement 3: Sort events by event date
      list.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setEvents(list);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setLoadError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading joined events."
      );
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadJoinedEvents(controller.signal);
    return () => controller.abort();
  }, [loadJoinedEvents]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pt-4 pb-12">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <HandHeart className="size-6 text-[#0284c7]" />
          Joined Events
        </h1>
        <p className="text-sm text-muted-foreground">
          View all the upcoming and past volunteering events you have signed up for.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
              <div className="aspect-[16/9] w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg">Could not load joined events</CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              {loadError}
            </CardDescription>
            <Button
              className="mt-4 bg-[#0284c7] hover:bg-[#0284c7]/90 text-white"
              onClick={() => void loadJoinedEvents(new AbortController().signal)}
            >
              Try again
            </Button>
          </CardHeader>
        </Card>
      ) : events.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-[#0284c7]/10 text-[#0284c7]">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg">No joined events yet</CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              You haven&apos;t joined any volunteer events yet. Explore upcoming events to get involved!
            </CardDescription>
            <Link
              href="/upcoming-events"
              className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#0284c7] hover:bg-[#0284c7]/90 text-white font-medium text-sm transition-colors shadow-xs"
            >
              Browse Upcoming Events
            </Link>
          </CardHeader>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            You are currently enrolled in {events.length} event
            {events.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event._id}
                className="bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <EventImage
                    src={event.image || event.imageUrl}
                    title={event.title}
                  />
                  <CardHeader className="pt-4 pb-2">
                    <span className="inline-flex w-fit items-center rounded-md bg-[#0284c7]/10 px-2 py-0.5 text-xs font-medium text-[#0284c7] ring-1 ring-inset ring-[#0284c7]/20">
                      {event.category}
                    </span>
                    <CardTitle className="line-clamp-2 text-base font-semibold pt-1">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-1.5 text-xs text-muted-foreground pt-0 pb-4">
                    <span className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0 text-[#0284c7]" aria-hidden="true" />
                      <span className="truncate">{event.location}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarDays className="size-3.5 shrink-0 text-[#0284c7]" aria-hidden="true" />
                      {DISPLAY_DATE_FORMAT.format(new Date(event.date))}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="size-3.5 shrink-0 text-[#0284c7]" aria-hidden="true" />
                      <span className="tabular-nums">
                        Volunteers Needed: {event.volunteersNeeded}
                      </span>
                    </span>
                  </CardContent>
                </div>
                <div className="p-4 pt-0">
                  <Link
                    href={`/events/${event._id}`}
                    className="inline-flex items-center justify-center w-full h-9 rounded-lg bg-[#0284c7] hover:bg-[#0284c7]/90 text-white font-medium text-sm transition-colors shadow-xs"
                  >
                    View Details
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
