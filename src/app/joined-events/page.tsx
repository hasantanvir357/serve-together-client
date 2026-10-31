import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Joined Events | ServeTogether",
};

export default function JoinedEventsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Joined Events</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Your upcoming and past volunteer commitments live here. This page is a
        placeholder.
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
