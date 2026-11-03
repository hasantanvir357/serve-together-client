import { Heart, MapPin, Quote } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar";

const REVIEWS = [
  {
    name: "Nusrat Jahan",
    location: "Dhaka",
    quote:
      "The first flood relief drive changed how I see my own life. Serving with ServeTogether turned strangers into family — I now show up for every call, no matter how busy the week is.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces&q=70",
  },
  {
    name: "Tanvir Ahmed",
    location: "Chittagong",
    quote:
      "I joined one beach cleanup and never left. Seeing a cleaner Cox's Bazar because of our own hands is a feeling I can't put into words. This community keeps me grounded.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=70",
  },
  {
    name: "Sadia Rahman",
    location: "Sylhet",
    quote:
      "Planting a sapling beside a village child reminded me that hope grows when we serve together. ServeTogether gave my weekends a purpose I never knew I was missing.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces&q=70",
  },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Testimonials() {
  return (
    <section
      aria-label="Volunteer testimonials"
      className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20 dark:border-sky-400/40 dark:bg-sky-950/40 dark:text-sky-300">
          <Heart className="size-3.5" aria-hidden="true" />
          Real stories, real service
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Voices of Our{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Volunteers
          </span>
        </h2>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {REVIEWS.map((review) => (
          <figure
            key={review.name}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
          >
            <Quote
              className="size-6 shrink-0 text-primary/70 dark:text-sky-300"
              aria-hidden="true"
            />
            <blockquote className="text-sm leading-relaxed text-muted-foreground dark:text-slate-300">
              &ldquo;{review.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
              <Avatar size="lg">
                <AvatarImage
                  src={review.img}
                  alt={`${review.name}, volunteer from ${review.location}`}
                />
                <AvatarFallback className="bg-primary/15 font-medium text-primary">
                  {getInitials(review.name)}
                </AvatarFallback>
                <AvatarBadge aria-hidden="true">
                  <Heart className="size-2 fill-current" />
                </AvatarBadge>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {review.name}
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground dark:text-slate-300">
                  <MapPin className="size-3" aria-hidden="true" />
                  {review.location}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
