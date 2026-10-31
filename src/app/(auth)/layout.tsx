import Link from "next/link";
import type { ReactNode } from "react";
import { HandHeart } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400">
          <HandHeart className="size-5" aria-hidden="true" />
        </span>
        <span className="bg-gradient-to-r from-teal-600 to-amber-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:from-teal-400 dark:to-amber-400">
          ServeTogether
        </span>
      </Link>
      {children}
    </main>
  );
}
