"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  LoaderCircle,
  MapPin,
  Mail,
  TriangleAlert,
  Users,
  HandHeart,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EVENTS_API_URL = "http://localhost:5000/api/events";

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

const CATEGORY_STYLES: Record<string, string> = {
  "Tree Plantation":
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  "Winter Clothes":
    "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-400",
  "Blood Drive":
    "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400",
  Cleanup:
    "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
  Education:
    "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-400",
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

const DISPLAY_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const DISPLAY_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

/** Initials avatar for the organizer email. */
function OrganizerAvatar({ email }: { email: string }) {
  const initials =
    email
      .split("@")[0]
      .split(/[._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-sm font-semibold text-teal-700 ring-1 ring-teal-500/20 dark:text-teal-400"
    >
      {initials}
    </span>
  );
}

/** Shared layout for the three info rows (date, time, location). */
function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-2 text-sm">
      {icon}
      {children}
    </span>
  );
}

export default function EventDetails({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const email = user?.email ?? "";

  const [event, setEvent] = React.useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isNotFound, setIsNotFound] = React.useState(false);

  // Local copy of the remaining volunteer slots, decreased on join.
  const [volunteersNeeded, setVolunteersNeeded] = React.useState(0);
  const [hasJoined, setHasJoined] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);

  const loadEvent = React.useCallback(
    async (id: string, signal: AbortSignal) => {
      setIsLoading(true);
      setLoadError(null);
      setIsNotFound(false);
      try {
        const response = await fetch(
          `${EVENTS_API_URL}/${encodeURIComponent(id)}`,
          { signal, cache: "no-store" },
        );
        if (!response.ok) {
          if (response.status === 404) {
            setIsNotFound(true);
            return;
          }
          throw new Error(
            `The server responded with status ${response.status}.`,
          );
        }
        const data: unknown = await response.json();
        // The API may return the event directly or wrapped in an envelope.
        const found =
          data && typeof data === "object" && "event" in data
            ? (data as { event: EventItem }).event
            : (data as EventItem);
        if (!found || typeof found !== "object" || !("_id" in found)) {
          throw new Error("The server returned an unexpected response.");
        }
        setEvent(found);
        setVolunteersNeeded(found.volunteersNeeded);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading this event.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (!eventId) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    void loadEvent(eventId, controller.signal);
    return () => controller.abort();
  }, [eventId, loadEvent]);

  const handleJoin = async () => {
    if (!event || !email || hasJoined || isJoining) {
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(
        `${EVENTS_API_URL}/${event._id}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (!response.ok) {
        const rawError = await response.text().catch(() => "");
        let serverMessage = "";
        try {
          const parsed = JSON.parse(rawError) as { message?: unknown };
          if (typeof parsed.message === "string") {
            serverMessage = parsed.message;
          }
        } catch {
          // Not JSON — fall through to the generic message.
        }
        if (response.status === 404) {
          throw new Error("This event no longer exists.");
        }
        if (response.status === 409) {
          throw new Error("You have already joined this event.");
        }
        throw new Error(
          serverMessage || `The server responded with status ${response.status}.`,
        );
      }

      // Reflect the successful signup immediately: one less slot needed.
      setVolunteersNeeded((prev) => Math.max(0, prev - 1));
      setHasJoined(true);
      toast.add({
        title: "Joined as volunteer!",
        description: `You're signed up for “${event.title}”. See you there!`,
        type: "success",
      });
    } catch (error) {
      toast.add({
        title: "Could not join event",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong — please try again.",
        type: "error",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-4 py-10" aria-busy="true" aria-live="polite">
        <div className="aspect-[16/7] w-full animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-3">
          <div className="h-7 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-4 grid gap-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <span className="sr-only">Loading event details…</span>
      </main>
    );
  }

  if (isNotFound || !event) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Event not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {isNotFound
            ? "This event doesn't exist or has been removed."
            : "The event ID in the address looks invalid."}
        </p>
        <Link href="/upcoming-events" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back to Events
        </Link>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Could not load event</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {loadError} Make sure the API server is running, then try again.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadEvent(eventId, new AbortController().signal)}>
            Try again
          </Button>
          <Link href="/upcoming-events" className={cn(buttonVariants({ variant: "ghost" }))}>
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const eventDate = new Date(event.date);

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-4 py-10">
      <Link
        href="/upcoming-events"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Events
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column: banner, title/meta, description. */}
        <div className="grid content-start gap-6">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="aspect-[16/7] w-full rounded-2xl object-cover ring-1 ring-foreground/10"
            />
          ) : (
            <div className="flex aspect-[16/7] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/10 ring-1 ring-foreground/10">
              <CalendarDays className="size-10 text-teal-600/60 dark:text-teal-400/60" />
            </div>
          )}

          <div className="grid gap-3">
            <CategoryBadge category={event.category} />
            <h1 className="text-3xl font-semibold tracking-tight">{event.title}</h1>

            {/* Organizer + event meta. */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-2.5">
                <OrganizerAvatar email={event.organizerEmail} />
                <span className="grid text-sm">
                  <span className="text-xs text-muted-foreground">Organized by</span>
                  <span className="font-medium">{event.organizerEmail}</span>
                </span>
              </span>
              <InfoRow
                icon={<Mail className="size-4 text-muted-foreground" />}
              >
                <span className="text-sm text-muted-foreground">Volunteer organizer</span>
              </InfoRow>
            </div>

            <div className="grid gap-1.5 text-muted-foreground">
              <InfoRow
                icon={<CalendarDays className="size-4 shrink-0" />}
              >
                {DISPLAY_DATE_FORMAT.format(eventDate)}
              </InfoRow>
              <InfoRow icon={<Clock className="size-4 shrink-0" />}>
                {DISPLAY_TIME_FORMAT.format(eventDate)}
              </InfoRow>
              <InfoRow icon={<MapPin className="size-4 shrink-0" />}>
                {event.location}
              </InfoRow>
            </div>
          </div>

          <Card size="sm">
            <CardHeader>
              <CardTitle>About this event</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: join card. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Join this event</CardTitle>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  {volunteersNeeded === 0
                    ? "All volunteer slots filled!"
                    : `${volunteersNeeded} volunteer${volunteersNeeded === 1 ? "" : "s"} still needed`}
                </span>
              </span>
            </CardHeader>
            <CardContent className="grid gap-3">
              {email ? (
                <Button
                  size="lg"
                  className="w-full"
                  disabled={hasJoined || isJoining || volunteersNeeded === 0}
                  onClick={() => void handleJoin()}
                >
                  {hasJoined ? (
                    <>
                      <HandHeart data-icon="inline-start" aria-hidden="true" />
                      You've joined
                    </>
                  ) : isJoining ? (
                    <>
                      <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden="true" />
                      Joining…
                    </>
                  ) : volunteersNeeded === 0 ? (
                    "No slots left"
                  ) : (
                    <>
                      <HandHeart data-icon="inline-start" aria-hidden="true" />
                      Join as Volunteer
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button size="lg" className="w-full" disabled>
                    <HandHeart data-icon="inline-start" aria-hidden="true" />
                    Join as Volunteer
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    <Link
                      href="/login"
                      className="font-medium text-teal-600 hover:underline dark:text-teal-400"
                    >
                      Sign in
                    </Link>{" "}
                    to join this event as a volunteer.
                  </p>
                </>
              )}
              {hasJoined && (
                <p className="text-xs text-muted-foreground" role="status">
                  Your spot is confirmed — you’ll find this event under Joined
                  Events.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
