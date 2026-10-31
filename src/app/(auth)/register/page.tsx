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
const URL_PATTERN = /^https?:\/\/\S+$/;

type RegisterValues = {
  name: string;
  email: string;
  password: string;
  imageUrl: string;
};

type RegisterField = keyof RegisterValues;

type RegisterErrors = Partial<Record<RegisterField, string>>;

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  // Image URL is optional, but must look like an absolute http(s) URL.
  if (values.imageUrl && !URL_PATTERN.test(values.imageUrl)) {
    errors.imageUrl = "Please enter a valid image URL (http/https).";
  }

  return errors;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [values, setValues] = React.useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
    imageUrl: "",
  });
  const [errors, setErrors] = React.useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (field: RegisterField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    const name = values.name.trim();
    setIsSubmitting(true);
    // No backend yet: persist the signup locally so the navbar picks it up.
    login({
      name,
      email: values.email,
      image: values.imageUrl || undefined,
    });
    toast.add({
      title: "Account created",
      description: `Welcome aboard, ${name}!`,
      type: "success",
    });
    router.push("/");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Join ServeTogether to volunteer in your community — it takes a
          minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="register-name">Full Name</Label>
            <Input
              id="register-name"
              name="name"
              placeholder="Jane Doe"
              autoComplete="name"
              required
              value={values.name}
              aria-invalid={errors.name ? true : undefined}
              onChange={(event) => handleChange("name")(event.target.value)}
            />
            {errors.name ? (
              <p role="alert" className="text-xs text-destructive">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
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
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
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

          <div className="grid gap-2">
            <Label htmlFor="register-image-url">Image URL (optional)</Label>
            <Input
              id="register-image-url"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/avatar.png"
              value={values.imageUrl}
              aria-invalid={errors.imageUrl ? true : undefined}
              onChange={(event) =>
                handleChange("imageUrl")(event.target.value)
              }
            />
            {errors.imageUrl ? (
              <p role="alert" className="text-xs text-destructive">
                {errors.imageUrl}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-teal-600 hover:underline dark:text-teal-400"
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
