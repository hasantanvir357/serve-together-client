"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormEvent } from "react";
import * as React from "react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fallback display name until a real backend returns the user profile. */
function nameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type LoginField = "email" | "password";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [values, setValues] = React.useState({ email: "", password: "" });
  const [errors, setErrors] = React.useState<
    Partial<Record<LoginField, string>>
  >({});

  const handleChange = (field: LoginField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the field-level error as soon as the user edits that field.
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<LoginField, string>> = {};
    if (!EMAIL_PATTERN.test(values.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (values.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    const name = nameFromEmail(values.email);
    login({ name, email: values.email });
    toast.add({
      title: "Signed in",
      description: `Welcome back, ${name}!`,
      type: "success",
    });
    router.push("/");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Sign in to create and manage your volunteering events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={values.email}
              aria-invalid={errors.email ? true : undefined}
              onChange={(event) => handleChange("email")(event.target.value)}
            />
            {errors.email ? (
              <p role="alert" className="text-xs text-destructive">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={values.password}
              aria-invalid={errors.password ? true : undefined}
              onChange={(event) =>
                handleChange("password")(event.target.value)
              }
            />
            {errors.password ? (
              <p role="alert" className="text-xs text-destructive">
                {errors.password}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="mt-2 w-full">
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
