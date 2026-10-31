import type { Metadata } from "next";

import CreateEventForm from "./create-event-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Create Event | ServeTogether",
};

export default function CreateEventPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 md:py-16">
      <CreateEventForm />
    </main>
  );
}
