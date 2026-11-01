"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormEvent } from "react";
import * as React from "react";
import { CalendarPlus, LoaderCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const EVENTS_API_URL = "http://localhost:5000/api/events";

const CATEGORIES = [
  "Tree Plantation",
  "Winter Clothes",
  "Blood Drive",
  "Flood Relief",
  "Cleanup",
  "Education",
];

const URL_PATTERN = /^https?:\/\/\S+$/;

function localDateISO(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

type EventValues = {
  title: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: string;
  imageUrl: string;
  description: string;
};

type EventField = keyof EventValues;

type EventErrors = Partial<Record<EventField, string>>;

function validate(values: EventValues): EventErrors {
  const errors: EventErrors = {};

  if (values.title.trim().length < 3) {
    errors.title = "Please enter an event title (at least 3 characters).";
  }
  if (!values.category) {
    errors.category = "Please choose a category.";
  }
  if (!values.location.trim()) {
    errors.location = "Please enter the event location.";
  }
  if (!values.date) {
    errors.date = "Please pick a date.";
  }
  if (!values.volunteersNeeded || Number(values.volunteersNeeded) < 1) {
    errors.volunteersNeeded = "Target volunteers must be at least 1.";
  }
  if (!URL_PATTERN.test(values.imageUrl)) {
    errors.imageUrl = "Please enter a valid image URL (http/https).";
  }
  if (values.description.trim().length < 20) {
    errors.description =
      "Please describe the event in at least 20 characters.";
  }

  return errors;
}

const INITIAL_VALUES: EventValues = {
  title: "",
  category: "",
  location: "",
  date: "",
  volunteersNeeded: "",
  imageUrl: "",
  description: "",
};

export default function CreateEventForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [values, setValues] = React.useState<EventValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<EventErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (field: EventField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(EVENTS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Field names match the Express server's expected schema exactly;
        // volunteersNeeded must be a true number before it is serialized.
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          category: values.category,
          location: values.location.trim(),
          date: values.date,
          volunteersNeeded: Number(values.volunteersNeeded),
          imageUrl: values.imageUrl,
          organizerEmail: user?.email ?? "",
        }),
      });

      if (!response.ok) {
        // Surface the exact server error body for debugging.
        const rawError = await response.text().catch(() => "");
        let serverError: unknown = rawError;
        try {
          serverError = JSON.parse(rawError);
        } catch {
          // Not JSON — log the raw text as-is.
        }
        console.error(
          `POST ${EVENTS_API_URL} failed with status ${response.status}:`,
          serverError,
        );
        throw new Error(`The server responded with status ${response.status}.`);
      }

      toast.add({
        title: "Event created",
        description: `“${values.title.trim()}” is live and ready to recruit volunteers.`,
        type: "success",
      });
      router.push("/manage-events");
    } catch (error) {
      toast.add({
        title: "Could not create event",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong — please try again.",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  const fieldErrors = (field: EventField) =>
    errors[field] ? (
      <p role="alert" className="text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <CalendarPlus className="size-5" aria-hidden="true" />
        </span>
        <CardTitle className="text-lg">Create Event</CardTitle>
        <CardDescription className="mx-auto max-w-sm">
          Publish a new volunteering opportunity for the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="event-title">Event Title</Label>
            <Input
              id="event-title"
              name="title"
              placeholder="Surma River Tree Plantation"
              required
              value={values.title}
              aria-invalid={errors.title ? true : undefined}
              onChange={(event) => handleChange("title", event.target.value)}
            />
            {fieldErrors("title")}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="event-category">Category</Label>
              <Select
                value={values.category || null}
                onValueChange={(value) =>
                  handleChange("category", value ? String(value) : "")
                }
              >
                <SelectTrigger
                  id="event-category"
                  className="w-full"
                  aria-invalid={errors.category ? true : undefined}
                  aria-label="Category"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors("category")}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                name="location"
                placeholder="Sylhet, Bangladesh"
                required
                value={values.location}
                aria-invalid={errors.location ? true : undefined}
                onChange={(event) =>
                  handleChange("location", event.target.value)
                }
              />
              {fieldErrors("location")}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                name="date"
                type="date"
                min={localDateISO()}
                required
                value={values.date}
                aria-invalid={errors.date ? true : undefined}
                onChange={(event) => handleChange("date", event.target.value)}
              />
              {fieldErrors("date")}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-volunteers">Volunteers Needed</Label>
              <Input
                id="event-volunteers"
                name="volunteersNeeded"
                type="number"
                min={1}
                step={1}
                placeholder="45"
                required
                value={values.volunteersNeeded}
                aria-invalid={errors.volunteersNeeded ? true : undefined}
                onChange={(event) =>
                  handleChange("volunteersNeeded", event.target.value)
                }
              />
              {fieldErrors("volunteersNeeded")}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-image-url">Image URL</Label>
            <Input
              id="event-image-url"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/event.png"
              required
              value={values.imageUrl}
              aria-invalid={errors.imageUrl ? true : undefined}
              onChange={(event) =>
                handleChange("imageUrl", event.target.value)
              }
            />
            {fieldErrors("imageUrl")}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              name="description"
              placeholder="What will volunteers do? Who will it help? What should they bring?"
              rows={5}
              required
              value={values.description}
              aria-invalid={errors.description ? true : undefined}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
            />
            {fieldErrors("description")}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse sm:items-center">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Creating…
                </>
              ) : (
                "Create Event"
              )}
            </Button>
            <Link
              href="/upcoming-events"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full sm:w-auto",
              )}
            >
              Cancel
            </Link>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-muted-foreground">
          Created events appear under{" "}
          <Link
            href="/manage-events"
            className="font-medium text-primary hover:underline"
          >
            Manage Events
          </Link>{" "}
          so you can track volunteers and future sign-ups.
        </p>
      </CardFooter>
    </Card>
  );
}
