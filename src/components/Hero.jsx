import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HandHeart, Plus, Users } from "lucide-react";

const CATEGORIES = [
  "Tree Plantation",
  "Winter Clothes",
  "Blood Drive",
  "Flood Relief",
  "Cleanup",
];

export default function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-12 px-4 py-16 md:flex-row md:gap-8 md:py-24">
      {/* Left: copy */}
      <div className="flex w-full flex-col items-start gap-6 md:w-1/2">
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-700 ring-1 ring-teal-500/20 dark:bg-teal-500/15 dark:text-teal-300">
          <Users className="size-3.5" aria-hidden="true" />
          5,000+ Volunteers Across Bangladesh
        </span>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Empower Rural Communities Through{" "}
          <span className="bg-gradient-to-r from-teal-600 to-amber-500 bg-clip-text text-transparent dark:from-teal-400 dark:to-amber-400">
            Action &amp; Service
          </span>
        </h1>

        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          Join local drives that deliver real impact — from planting trees to
          standing with families through floods and cold winters.
        </p>

        <ul className="flex flex-wrap gap-2" aria-label="Charity categories">
          {CATEGORIES.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/80"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/upcoming-events"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore Events
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/create-event"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-6 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Right: photo card with glassmorphism */}
      <div className="relative w-full md:w-1/2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl ring-1 ring-black/5">
          <Image
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80"
            alt="Bangladeshi volunteers distributing aid during a rural community service drive"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          {/* Glass stat card */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md dark:bg-black/25">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-600 ring-1 ring-teal-400/30 dark:text-teal-300">
              <HandHeart className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Hands that help, hearts that serve
              </p>
              <p className="truncate text-xs text-white/80">
                Community-led service across 64 districts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
