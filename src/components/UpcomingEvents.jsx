import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
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

const EVENTS = [
  {
    title: "Surma River Tree Plantation",
    date: "Nov 8, 2026",
    location: "Sylhet",
    seats: 45,
    img: treePlantation,
    alt: "Volunteers planting saplings along a riverbank in Sylhet",
  },
  {
    title: "Cox's Bazar Beach Cleanup",
    date: "Nov 12, 2026",
    location: "Cox's Bazar",
    seats: 30,
    img: cleanupDrive,
    alt: "Volunteers collecting waste on a beach in Cox's Bazar",
  },
  {
    title: "Winter Clothes Distribution",
    date: "Nov 18, 2026",
    location: "Rangpur",
    seats: 25,
    img: winterClothes,
    alt: "Volunteers distributing warm clothes in Rangpur",
  },
  {
    title: "Community Blood Donation Camp",
    date: "Nov 22, 2026",
    location: "Dhaka",
    seats: 60,
    img: bloodDrive,
    alt: "Donors giving blood at a community camp in Dhaka",
  },
  {
    title: "Flood Relief Supply Delivery",
    date: "Nov 27, 2026",
    location: "Khulna",
    seats: 50,
    img: floodRelief,
    alt: "Volunteers delivering flood relief supplies in Khulna",
  },
  {
    title: "Learning Support for Rural Schools",
    date: "Dec 3, 2026",
    location: "Chattogram",
    seats: 20,
    img: educationSupport,
    alt: "Volunteers supporting students in a rural school in Chattogram",
  },
];

export default function UpcomingEvents() {
  return (
    <section
      aria-label="Upcoming community drives"
      className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col items-start gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Get involved
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Upcoming Community Drives
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Reserve your spot at the next neighborhood drive — seats fill up
          fast.
        </p>
      </div>

      {/* Event grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {EVENTS.map((event, index) => {
          const isPrimary = index % 2 === 0;
          return (
            <Card
              key={event.title}
              className="group/card pt-0 transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={event.img}
                  alt={event.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                />
                {/* Status badge */}
                <span
                  className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold text-white shadow-sm backdrop-blur ${
                    isPrimary ? "bg-primary/90" : "bg-secondary/90"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                  Upcoming
                </span>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {event.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {event.location}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Users className="size-3.5" aria-hidden="true" />
                  {event.seats} seats remaining
                </div>
              </CardContent>

              <CardFooter>
                <Link
                  href="/upcoming-events"
                  className={cn(buttonVariants(), "w-full")}
                >
                  Explore Events
                  <ArrowRight aria-hidden="true" />
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/upcoming-events"
          className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
        >
          View All Upcoming Events
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
