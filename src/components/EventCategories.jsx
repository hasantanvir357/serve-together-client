import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, HeartHandshake, Users } from "lucide-react";
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
import EventBadge from "@/components/EventBadge";

import treePlantation from "@/assets/events/tree-plantation.jpg";
import winterClothes from "@/assets/events/winter-clothes.jpg";
import bloodDrive from "@/assets/events/blood-drive.jpg";
import floodRelief from "@/assets/events/flood-relief.jpg";
import cleanupDrive from "@/assets/events/cleanup-drive.jpg";
import educationSupport from "@/assets/events/education-support.jpg";

const CATEGORIES = [
  {
    title: "Tree Plantation",
    description:
      "Join green drives that plant and protect saplings across rural Bangladesh.",
    events: 24,
    volunteers: "1,200+",
    img: treePlantation,
    alt: "Volunteers planting saplings during a tree plantation drive",
  },
  {
    title: "Winter Clothes",
    description:
      "Distribute warm clothes and blankets to families facing the cold season.",
    events: 18,
    volunteers: "950+",
    img: winterClothes,
    alt: "Volunteers distributing warm winter clothes to families",
  },
  {
    title: "Blood Drive",
    description:
      "Organize and donate at local blood camps that save lives every week.",
    events: 32,
    volunteers: "1,500+",
    img: bloodDrive,
    alt: "Donors giving blood at a community blood drive camp",
  },
  {
    title: "Flood Relief",
    description:
      "Deliver food, medicine and shelter support to flood-hit communities.",
    events: 21,
    volunteers: "1,800+",
    img: floodRelief,
    alt: "Volunteers delivering flood relief supplies to affected families",
  },
  {
    title: "Cleanup Drive",
    description:
      "Clear canals, streets and markets to keep neighborhoods clean and safe.",
    events: 27,
    volunteers: "1,100+",
    img: cleanupDrive,
    alt: "Volunteers collecting waste during a community cleanup drive",
  },
  {
    title: "Education Support",
    description:
      "Mentor children and supply learning materials in under-resourced schools.",
    events: 15,
    volunteers: "800+",
    img: educationSupport,
    alt: "Volunteers teaching and supporting children in a rural classroom",
  },
];

export default function EventCategories() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-8 flex flex-col items-start gap-2">
        <EventBadge
          variant="status"
          icon={<HeartHandshake className="size-3.5" aria-hidden="true" />}
          label="Causes you can serve"
          className="rounded-full"
        />
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Explore Event Categories
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pick a cause, show up, and make a difference — every category is
          led by volunteers from the community.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          return (
            <Card
              key={category.title}
              className="group/card pt-0 transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={category.img}
                  alt={category.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                />
              </div>

              <CardHeader>
                <EventBadge label={category.title} className="rounded-full" />
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {category.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <EventBadge
                    variant="neutral"
                    label={
                      <>
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        {category.events} Events
                      </>
                    }
                  />
                  <EventBadge
                    variant="neutral"
                    label={
                      <>
                        <Users className="size-3.5" aria-hidden="true" />
                        {category.volunteers} Volunteers
                      </>
                    }
                  />
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
    </section>
  );
}
