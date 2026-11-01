"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Search,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

/** The categories the feed can be filtered by, plus "All". */
const CATEGORIES = [
  "All",
  "Tree Plantation",
  "Winter Clothes",
  "Blood Drive",
  "Cleanup",
  "Education",
] as const;

type Category = (typeof CATEGORIES)[number];

/** Event document exactly as the Express/Mongo API returns it. */
type EventItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  organizerEmail: string;
  imageUrl?: string;
};

/** Consistent accent colors per category badge. */
const CATEGORY_STYLES: Record<string, string> = {
  "Tree Plantation":
    "bg-primary/10 text-primary ring-primary/20",
  "Winter Clothes":
    "bg-secondary/10 text-secondary ring-secondary/20",
  "Blood Drive":
    "bg-primary/15 text-primary ring-primary/25",
  Cleanup:
    "bg-secondary/15 text-secondary ring-secondary/25",
  Education:
    "bg-primary/10 text-primary ring-primary/20",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        CATEGORY_STYLES[category] ??
          "bg-muted text-muted-foreground ring-foreground/10",
      )}
    >
      {category}
    </span>
  );
}

/** Image with a graceful placeholder when it fails to load. */
function EventImage({
  src,
  title,
  category,
}: {
  src?: string;
  title: string;
  category: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const showPlaceholder = !src || failed;

  return showPlaceholder ? (
    <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-primary/15 to-secondary/10">
      <CalendarDays className="size-10 text-primary/60" />
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

const DISPLAY_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function UpcomingEvents() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<Category>("All");

  const loadEvents = React.useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(EVENTS_API_URL, { signal, cache: "no-store" });
      if (!response.ok) {
        throw new Error(`The server responded with status ${response.status}.`);
      }
      const data: unknown = await response.json();
      // The API may return either an array or an `{ events: [...] }` envelope.
      const list =
        Array.isArray(data)
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
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadEvents(controller.signal);
    return () => controller.abort();
  }, [loadEvents]);

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
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-10">
      <div className="grid gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Upcoming Events</h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Discover volunteer opportunities near you and be the change.
        </p>
      </div>

      {/* Filters: search by title/location, filter by category. */}
      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor="event-search">Search events</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="event-search"
              type="search"
              placeholder="Search by title or location…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2 sm:w-56">
          <Label htmlFor="event-category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory((value ?? "All") as Category)}
          >
            <SelectTrigger
              id="event-category"
              className="w-full"
              aria-label="Filter by category"
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
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
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-live="polite"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="grid gap-3">
              <div className="aspect-[16/9] animate-pulse rounded-t-xl bg-muted" />
              <div className="grid gap-2 px-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-9 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading events…</span>
        </div>
      ) : loadError ? (
        <Card>
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg">Could not load events</CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              {loadError} Make sure the API server is running, then try again.
            </CardDescription>
            <Button
              variant="outline"
              className="mt-4 w-fit"
              onClick={() => void loadEvents(new AbortController().signal)}
            >
              Try again
            </Button>
          </CardHeader>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
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
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {filteredEvents.length} of {events.length} event
            {events.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="gap-3">
                <EventImage
                  src={event.imageUrl}
                  title={event.title}
                  category={event.category}
                />
                <CardHeader>
                  <CategoryBadge category={event.category} />
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{event.location}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                    {DISPLAY_DATE_FORMAT.format(new Date(event.date))}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="size-4 shrink-0" aria-hidden="true" />
                    <span className="tabular-nums">
                      Target: {event.volunteersNeeded} volunteer
                      {event.volunteersNeeded === 1 ? "" : "s"}
                    </span>
                  </span>
                  {/* Fills the remaining space so the button lines up across cards. */}
                  <div className="flex-1" />
                  <Link
                    href={`/events/${event._id}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "mt-2 w-full",
                    )}
                  >
                    View Details
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
