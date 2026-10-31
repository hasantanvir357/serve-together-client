import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import banner from "@/assets/banner-bg.jpg";

const CATEGORIES = [
  "Tree Plantation",
  "Winter Clothes",
  "Blood Drive",
  "Flood Relief",
  "Cleanup",
];

export default function Hero() {
  return (
    <section className="w-full px-4 py-4 md:py-6">
      {/* Contained banner: capped height + rounded corners so the image never stretches */}
      <div className="relative mx-auto max-h-[520px] w-full max-w-6xl overflow-hidden rounded-3xl">
        <Image
          src={banner}
          alt="Volunteers serving a rural community"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1152px"
          className="object-cover object-center"
        />

        {/* Sleek gradient overlays for maximum content contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
        />

        {/* Content (in-flow: keeps the banner height driven by content, capped at 520px) */}
        <div className="relative z-10 flex w-full flex-col items-start gap-4 px-5 py-8 md:w-3/4 md:py-10 lg:w-3/5">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-600/90 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-teal-400/40 backdrop-blur">
            <Users className="size-3.5" aria-hidden="true" />
            5,000+ Volunteers Across Bangladesh
          </span>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl">
            Empower Rural Communities Through{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#F59E0B] bg-clip-text text-transparent">
              Action &amp; Service
            </span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-slate-200 md:text-lg">
            Join local drives that deliver real impact — from planting trees to
            standing with families through floods and cold winters.
          </p>

          <ul className="flex flex-wrap gap-2" aria-label="Charity categories">
            {CATEGORIES.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur transition-colors hover:border-white/50 hover:bg-white/20 hover:text-white"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="h-11 px-6" render={<Link href="/upcoming-events" />}>
              Explore Events
              <ArrowRight aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 border-amber-400/50 bg-amber-500/15 px-6 text-amber-300 transition-colors hover:border-amber-400 hover:bg-amber-500/25 hover:text-amber-200"
              render={<Link href="/create-event" />}
            >
              Create Event
              <Plus aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
