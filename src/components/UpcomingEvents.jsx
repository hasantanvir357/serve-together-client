import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users, LoaderCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import treePlantation from "@/assets/events/tree-plantation.jpg";
import winterClothes from "@/assets/events/winter-clothes.jpg";
import bloodDrive from "@/assets/events/blood-drive.jpg";
import floodRelief from "@/assets/events/flood-relief.jpg";
import cleanupDrive from "@/assets/events/cleanup-drive.jpg";
import educationSupport from "@/assets/events/education-support.jpg";

const LOCAL_EVENTS = [
  {
    _id: "seed-1",
    title: "Surma River Tree Plantation",
    date: "Nov 8, 2026",
    location: "Sylhet",
    seats: 45,
    img: treePlantation,
    alt: "Volunteers planting saplings along a riverbank in Sylhet",
  },
  {
    _id: "seed-2",
    title: "Cox's Bazar Beach Cleanup",
    date: "Nov 12, 2026",
    location: "Cox's Bazar",
    seats: 30,
    img: cleanupDrive,
    alt: "Volunteers collecting waste on a beach in Cox's Bazar",
  },
  {
    _id: "seed-3",
    title: "Winter Clothes Distribution",
    date: "Nov 18, 2026",
    location: "Rangpur",
    seats: 25,
    img: winterClothes,
    alt: "Volunteers distributing warm clothes in Rangpur",
  },
  {
    _id: "seed-4",
    title: "Community Blood Donation Camp",
    date: "Nov 22, 2026",
    location: "Dhaka",
    seats: 60,
    img: bloodDrive,
    alt: "Donors giving blood at a community camp in Dhaka",
  },
  {
    _id: "seed-5",
    title: "Flood Relief Supply Delivery",
    date: "Nov 27, 2026",
    location: "Khulna",
    seats: 50,
    img: floodRelief,
    alt: "Volunteers delivering flood relief supplies in Khulna",
  },
  {
    _id: "seed-6",
    title: "Learning Support for Rural Schools",
    date: "Dec 3, 2026",
    location: "Chattogram",
    seats: 20,
    img: educationSupport,
    alt: "Volunteers supporting students in a rural school in Chattogram",
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.events || [];
        if (list.length > 0) {
          setEvents(list.slice(0, 6)); // প্রথম ৬টি ডাটাবেজ ইভেন্ট
        } else {
          setEvents(LOCAL_EVENTS); // ফলব্যাক ডামি ডাটা
        }
        setLoading(false);
      })
      .catch(() => {
        setEvents(LOCAL_EVENTS);
        setLoading(false);
      });
  }, []);

  return (
    <section
      aria-label="Upcoming community drives"
      className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12 dark:text-slate-100"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col items-start gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-[#0284c7] border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/50">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Get involved
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Upcoming Community Drives
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
          Reserve your spot at the next neighborhood drive — seats fill up fast.
        </p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-[#0284c7]" />
        </div>
      ) : (
        /* Event grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => {
            const isPrimary = index % 2 === 0;
            const eventId = event._id || `event-${index}`;
            const targetSeats = event.volunteersNeeded || event.seats || 20;
            const formattedDate = event.date
              ? (isNaN(new Date(event.date).getTime()) ? event.date : new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
              : "Upcoming";

            return (
              <Card
                key={eventId}
                className="group/card flex flex-col justify-between overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-shadow duration-300 hover:shadow-xl"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                      />
                    ) : event.img ? (
                      <Image
                        src={event.img}
                        alt={event.alt || event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <CalendarDays className="size-10" />
                      </div>
                    )}
                    {/* Status badge */}
                    <span
                      className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold text-white shadow-sm backdrop-blur ${isPrimary ? "bg-[#0284c7]/90" : "bg-teal-600/90"
                        }`}
                    >
                      <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                      Upcoming
                    </span>
                  </div>

                  <CardHeader className="p-5">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        {formattedDate}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" aria-hidden="true" />
                        {event.location}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 py-0">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <Users className="size-3.5" aria-hidden="true" />
                      {targetSeats} seats remaining
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-5 pt-4">
                  <Link
                    href={`/events/${eventId}`}
                    className={cn(
                      buttonVariants(),
                      "w-full bg-[#0284c7] hover:bg-sky-700 text-white transition flex items-center justify-center gap-2"
                    )}
                  >
                    Explore Events
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/upcoming-events"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 px-6 bg-[#0284c7] hover:bg-sky-700 text-white font-medium transition flex items-center gap-2"
          )}
        >
          View All Upcoming Events
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}