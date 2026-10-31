import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VolunteerCTA() {
  return (
    <section aria-label="Join as a volunteer" className="w-full px-4 pb-12 md:pb-16">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#0D9488] to-[#14b8a6] px-6 py-12 shadow-lg md:px-12 md:py-16">
        {/* Decorative rings */}
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-16 size-56 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-10 size-64 rounded-full bg-black/10"
        />

        <div className="relative flex flex-col items-start gap-5 md:w-4/5 lg:w-3/5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur">
            <HeartHandshake className="size-3.5" aria-hidden="true" />
            Be the change
          </span>

          <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            Ready to Make an Impact in Your Local Community?
          </h2>

          <p className="max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
            Whether it&apos;s planting trees, serving blood drives, or
            delivering relief — your time can change a family&apos;s story.
            Sign up in minutes and join thousands of volunteers already
            making a difference.
          </p>

          <Link
            href="/create-event"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-1 h-11 bg-white px-6 text-teal-700 transition-all hover:bg-white/90 hover:shadow-md",
            )}
          >
            Join as a Volunteer
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
