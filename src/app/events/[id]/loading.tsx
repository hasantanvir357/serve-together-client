import { ArrowLeft } from "lucide-react";

/**
 * Route-level Suspense boundary for `/events/[id]`.
 *
 * The page reads dynamic `params`, so it must stream behind a boundary.
 * This skeleton matches the event-details layout to minimize layout shift.
 */
export default function Loading() {
  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-4 py-10">
      <div className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-400">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Events
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]" aria-busy="true">
        <div className="space-y-6">
          <div className="h-72 w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-40 w-full animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
