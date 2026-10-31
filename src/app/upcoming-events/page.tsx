import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Upcoming Events | ServeTogether",
};

export default function UpcomingEventsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Upcoming Events</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Discover volunteer opportunities near you. This page is a placeholder —
        the events feed will be built here.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        Back to home
      </Link>
    </main>
  );
}
