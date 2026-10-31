import type { Metadata } from "next";

import ManageEvents from "./manage-events";

export const instant = false;

export const metadata: Metadata = {
  title: "Manage Events | ServeTogether",
};

export default function ManageEventsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 md:py-16">
      <ManageEvents />
    </main>
  );
}
