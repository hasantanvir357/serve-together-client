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
    <section className="relative w-full overflow-hidden">
      {/* Full-width background image */}
      <Image
        src={banner}
        alt="Volunteers serving a rural community"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark/gradient overlay: heavy on the left for readability, fades to the right */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
      />

      {/* Content */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-12 md:w-3/5 md:py-16">
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-600/90 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-teal-400/40 backdrop-blur">
          <Users className="size-3.5" aria-hidden="true" />
          5,000+ Volunteers Across Bangladesh
        </span>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
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

        <div className="flex flex-wrap gap-3 pt-2">
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
    </section>
  );
}
