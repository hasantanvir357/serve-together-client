"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { HandHeart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const DEMO_USER = {
  name: "Alex Rivera",
  email: "alex@servetogether.org",
};

export default function SignInPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleDemoSignIn = () => {
    login(DEMO_USER.name, DEMO_USER.email);
    router.push("/");
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400">
          <HandHeart className="size-5" aria-hidden="true" />
        </span>
        <span className="bg-gradient-to-r from-teal-600 to-amber-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:from-teal-400 dark:to-amber-400">
          ServeTogether
        </span>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Real authentication isn&apos;t wired up yet — this demo sign-in
            stores a local session so you can explore the avatar menu.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You&apos;ll be signed in as{" "}
          <span className="font-medium text-foreground">{DEMO_USER.name}</span>{" "}
          ({DEMO_USER.email}).
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" onClick={handleDemoSignIn}>
            Continue as demo user
          </Button>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
