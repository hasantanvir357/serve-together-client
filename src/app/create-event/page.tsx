import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Event | ServeTogether",
};

export default function CreateEventPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Create Event</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Publish a new volunteer event. This page is a placeholder — the event
        form will be built here.
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
