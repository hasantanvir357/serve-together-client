"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

// Client-only detection without setState-in-effect: the server snapshot is
// `false`, and React re-renders with `true` right after hydration.
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Route-group auth guard. Renders children only for signed-in users and
 * redirects to /login otherwise. Until hydration completes the children are
 * withheld, so protected content never flashes to logged-out visitors.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mounted = React.useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  React.useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace("/login");
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <LoaderCircle
          className="size-6 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          Checking your session…
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <LoaderCircle
          className="size-6 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          You need to be signed in to view this page — redirecting to login…
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
