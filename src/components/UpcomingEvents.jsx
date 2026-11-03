"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Users, ArrowRight, LoaderCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EventBadge from "@/components/EventBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEED_EVENTS, mergeEventsWithSeeds } from "@/lib/seed-events";
import { useMounted } from "@/lib/use-mounted";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;

    fetch(`${API_BASE_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.events || [];
        // Seeds always render first; backend events merge in without overwriting them.
        setEvents(mergeEventsWithSeeds(list));
        setLoading(false);
      })
      .catch(() => {
        setEvents(SEED_EVENTS);
        setLoading(false);
      });
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-[#0284c7]" />
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 dark:text-slate-100">
      <div className="mb-8 flex flex-col items-start gap-2">
        <EventBadge
          variant="status"
          icon={<CalendarDays className="size-3.5" aria-hidden="true" />}
          label="Get involved"
          className="rounded-full"
        />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Upcoming Community Drives
        </h2>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-300 sm:text-base">
          Reserve your spot at the next neighborhood drive — seats fill up fast.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const parsedDate = new Date(event.date);
          const formattedDate = isNaN(parsedDate.getTime())
            ? event.date
            : parsedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

          return (
            <Card
              key={event._id || event.title}
              className="flex flex-col justify-between overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={event.imageUrl || event.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800"}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <EventBadge
                    variant="status"
                    label="Upcoming"
                    leadingDot
                    className="absolute top-3 left-3 rounded-full bg-sky-100/95 dark:bg-sky-950/75"
                  />
                </div>

                <CardHeader className="p-5">
                  <EventBadge label={event.category} />
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-300 mt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-[#0284c7]" />
                      {formattedDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-[#0284c7]" />
                      {event.location}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-5 py-0">
                  <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Users className="size-3.5" />
                    {event.volunteersNeeded || 20} seats remaining
                  </div>
                </CardContent>
              </div>

              <CardFooter className="p-5 pt-4">
                <Link
                  href={`/events/${event._id}`}
                  className={cn(
                    buttonVariants(),
                    "w-full bg-[#0284c7] hover:bg-sky-700 text-white transition flex items-center justify-center gap-2"
                  )}
                >
                  Explore Events
                  <ArrowRight className="size-4" />
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/upcoming-events"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 px-6 bg-[#0284c7] hover:bg-sky-700 text-white font-medium transition flex items-center gap-2"
          )}
        >
          View All Upcoming Events
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
