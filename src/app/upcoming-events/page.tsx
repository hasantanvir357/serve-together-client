"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Search, TriangleAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EVENTS_API_URL = "http://localhost:5000/api/events";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format&fit=crop";

const CATEGORIES = [
  "All",
  "Tree Plantation",
  "Winter Clothes",
  "Blood Drive",
  "Cleanup",
  "Education",
] as const;

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
};

function EventImage({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = React.useState(false);
  const imgSrc = failed ? FALLBACK_IMAGE : src && src.trim() !== "" ? src : FALLBACK_IMAGE;

  return (
    <img
      src={imgSrc}
      alt={title}
      loading="lazy"
      onError={() => setFailed(true)}
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

export default function UpcomingEventsPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");

  React.useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const response = await fetch(EVENTS_API_URL, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`The server responded with status ${response.status}.`);
        }
        const data: unknown = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as { events?: unknown }).events)
            ? (data as { events: EventItem[] }).events
            : [];
        setEvents(list as EventItem[]);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading events.",
        );
      } finally {
        // Only finalize loading state if the request was not cancelled.
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [reloadKey]);

  const handleRetry = React.useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setReloadKey((key) => key + 1);
  }, []);

  const filteredEvents = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory =
        category === "All" || event.category === category;
      const matchesQuery =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [events, search, category]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pt-4 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Upcoming Events
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover volunteer opportunities near you and be the change.
        </p>
      </div>

      {/* Compact Search Bar & Category Dropdown Container */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or location..."
            className="pl-9 h-9 border-slate-200 dark:border-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56 shrink-0">
          <Select value={category} onValueChange={(val) => setCategory(val || "All")}>
            <SelectTrigger className="h-9 w-full border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
              <div className="aspect-[16/9] w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-9 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg">Could not load events</CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              {loadError}
            </CardDescription>
            <Button
              className="mt-4 bg-[#0284c7] hover:bg-[#0284c7]/90 text-white"
              onClick={handleRetry}
            >
              Try again
            </Button>
          </CardHeader>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-[#0284c7]/10 text-[#0284c7]">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg">
              {events.length === 0 ? "No events yet" : "No events match your filters"}
            </CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              {events.length === 0
                ? "There are no upcoming events right now — check back soon."
                : "Try a different search term or category."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Showing {filteredEvents.length} of {events.length} event
            {events.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
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
                        Target: {event.volunteersNeeded} volunteer
                        {event.volunteersNeeded === 1 ? "" : "s"}
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
