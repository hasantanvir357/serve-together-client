import type { Metadata } from "next";
import UpcomingEvents from "./upcoming-events";

export const metadata: Metadata = {
  title: "Upcoming Events | ServeTogether",
};

export default function UpcomingEventsPage() {
  return <UpcomingEvents />;
}
