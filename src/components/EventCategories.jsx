import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, HeartHandshake, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-700 ring-1 ring-teal-500/20 dark:bg-teal-500/15 dark:text-teal-300">
          <HeartHandshake className="size-3.5" aria-hidden="true" />
          Causes you can serve
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Explore Event Categories
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pick a cause, show up, and make a difference — every category is
          led by volunteers from the community.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category, index) => {
          const isTeal = index % 2 === 0;
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
                <span
                  className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[0.7rem] font-medium ${
                    isTeal
                      ? "bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/20 dark:bg-teal-500/15 dark:text-teal-300"
                      : "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400"
                  }`}
                >
                  {category.title}
                </span>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {category.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 font-medium">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {category.events} Events
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 font-medium">
                    <Users className="size-3.5" aria-hidden="true" />
                    {category.volunteers} Volunteers
                  </span>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  render={<Link href="/upcoming-events" />}
                >
                  Explore Events
                  <ArrowRight aria-hidden="true" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
