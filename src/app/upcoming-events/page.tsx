import type { Metadata } from "next";
import UpcomingEvents from "./upcoming-events";

export const metadata: Metadata = {
  title: "Upcoming Events | ServeTogether",
};

/**
 * The `/upcoming-events` route renders the shared UpcomingEvents component so
 * the route, the home-page section, and the seed fallback data can never drift
 * apart — they all pull from `@/lib/seed-events`.
 */
export default function UpcomingEventsPage() {
  return <UpcomingEvents />;
}
