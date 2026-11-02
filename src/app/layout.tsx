import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toast";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ServeTogether | Empowering Community Action",
  description:
    "Join 5,000+ volunteers across Bangladesh for tree plantation, blood drives, flood relief, winter clothes distribution and community cleanup events.",
  icons: { icon: "/favicon.png" },
};

/**
 * Fallback for the Navbar's `<Suspense>` boundary. The real Navbar reads
 * the runtime pathname (`usePathname`), so it streams in behind this
 * skeleton on dynamic routes.
 */
function NavbarSkeleton() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur"
      aria-busy="true"
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <div className="h-7 w-28 animate-pulse rounded bg-muted" />
        <div className="hidden h-4 w-64 animate-pulse rounded bg-muted md:block" />
        <div className="h-8 w-36 animate-pulse rounded bg-muted" />
      </div>
    </header>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<NavbarSkeleton />}>
              <Navbar />
            </Suspense>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
