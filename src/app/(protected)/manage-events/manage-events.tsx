"use client";

import type { FormEvent } from "react";
import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  LoaderCircle,
  Pencil,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

/** Event document exactly as the Express/Mongo API returns it. */
type ManageEvent = {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  organizerEmail: string;
  imageUrl?: string;
};

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

/** yyyy-mm-dd in the user's local timezone, for <input type="date" />. */
function toLocalInputDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const DISPLAY_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function toFormValues(event: ManageEvent): EventValues {
  return {
    title: event.title,
    category: event.category,
    location: event.location,
    date: toLocalInputDate(event.date),
    volunteersNeeded: String(event.volunteersNeeded),
    imageUrl: event.imageUrl ?? "",
    description: event.description,
  };
}

const EMPTY_FORM: EventValues = {
  title: "",
  category: "",
  location: "",
  date: "",
  volunteersNeeded: "",
  imageUrl: "",
  description: "",
};

export default function ManageEvents() {
  const { user } = useAuth();
  const email = user?.email ?? "";

  const [events, setEvents] = React.useState<ManageEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [editingEvent, setEditingEvent] = React.useState<ManageEvent | null>(
    null,
  );
  const [editValues, setEditValues] =
    React.useState<EventValues>(EMPTY_FORM);
  const [editErrors, setEditErrors] = React.useState<EventErrors>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const [deletingEvent, setDeletingEvent] = React.useState<ManageEvent | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadEvents = React.useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(
          `${EVENTS_API_URL}/user/${encodeURIComponent(email)}`,
          { signal, cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error(
            `The server responded with status ${response.status}.`,
          );
        }
        const data = await response.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading your events.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email],
  );

  React.useEffect(() => {
    if (!email) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    void loadEvents(controller.signal);
    return () => controller.abort();
  }, [email, loadEvents]);

  const startEdit = (event: ManageEvent) => {
    setEditingEvent(event);
    setEditValues(toFormValues(event));
    setEditErrors({});
    setIsSaving(false);
  };

  const handleEditChange = (field: EventField, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleEditFieldErrors = (field: EventField) =>
    editErrors[field] ? (
      <p role="alert" className="text-xs text-destructive">
        {editErrors[field]}
      </p>
    ) : null;

  const handleUpdate = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (!editingEvent) {
      return;
    }

    const nextErrors = validate(editValues);
    if (Object.values(nextErrors).some(Boolean)) {
      setEditErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${EVENTS_API_URL}/${editingEvent._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editValues.title.trim(),
            description: editValues.description.trim(),
            category: editValues.category,
            location: editValues.location.trim(),
            date: editValues.date,
            volunteersNeeded: Number(editValues.volunteersNeeded),
            imageUrl: editValues.imageUrl,
            organizerEmail: editingEvent.organizerEmail,
          }),
        },
      );

      if (!response.ok) {
        const rawError = await response.text().catch(() => "");
        let serverError: unknown = rawError;
        try {
          serverError = JSON.parse(rawError);
        } catch {
          // Not JSON — log the raw text as-is.
        }
        console.error(
          `PUT ${EVENTS_API_URL}/${editingEvent._id} failed with status ${response.status}:`,
          serverError,
        );
        throw new Error(
          response.status === 404
            ? "This event no longer exists."
            : `The server responded with status ${response.status}.`,
        );
      }

      const data = await response.json();
      const updated: ManageEvent = data.event ?? {
        ...editingEvent,
        title: editValues.title.trim(),
        description: editValues.description.trim(),
        category: editValues.category,
        location: editValues.location.trim(),
        date: new Date(editValues.date).toISOString(),
        volunteersNeeded: Number(editValues.volunteersNeeded),
        imageUrl: editValues.imageUrl,
      };

      setEvents((prev) =>
        prev.map((event) =>
          event._id === updated._id ? updated : event,
        ),
      );
      toast.add({
        title: "Event updated",
        description: `“${updated.title}” was saved successfully.`,
        type: "success",
      });
      setEditingEvent(null);
    } catch (error) {
      toast.add({
        title: "Could not update event",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong — please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${EVENTS_API_URL}/${deletingEvent._id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "This event no longer exists."
            : `The server responded with status ${response.status}.`,
        );
      }

      setEvents((prev) =>
        prev.filter((event) => event._id !== deletingEvent._id),
      );
      toast.add({
        title: "Event deleted",
        description: `“${deletingEvent.title}” was removed successfully.`,
        type: "success",
      });
      setDeletingEvent(null);
    } catch (error) {
      toast.add({
        title: "Could not delete event",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong — please try again.",
        type: "error",
      });
      setDeletingEvent(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const anyBusy = isSaving || isDeleting;

  return (
    <div className="grid w-full gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Manage Events
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Edit, update, and remove the volunteering events you host.
          </p>
        </div>
        <Link
          href="/create-event"
          className={cn(buttonVariants({ variant: "outline" }), "hidden sm:flex")}
        >
          <CalendarPlus data-icon="inline-start" aria-hidden="true" />
          Create Event
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-muted"
            />
          ))}
          <span className="sr-only">Loading your events…</span>
        </div>
      ) : loadError ? (
        <Card>
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg">Could not load events</CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              {loadError} Make sure the API server is running, then try again.
            </CardDescription>
            <Button
              variant="outline"
              className="mt-4 w-fit"
              onClick={() => void loadEvents(new AbortController().signal)}
            >
              Try again
            </Button>
          </CardHeader>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardHeader className="items-center py-10 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-lg">No events yet</CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              You haven’t created any events with this email yet. Publish your
              first volunteering opportunity to see it here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-4xl text-left text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="px-4 py-3 font-medium">Title</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Location</th>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Target Volunteers
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className="border-t transition-colors hover:bg-muted/30"
                >
                  <td className="max-w-64 truncate px-4 py-3 font-medium">
                    {event.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.category}
                  </td>
                  <td className="max-w-56 truncate px-4 py-3 text-muted-foreground">
                    {event.location}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {DISPLAY_DATE_FORMAT.format(new Date(event.date))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {event.volunteersNeeded}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={anyBusy}
                        aria-label={`Edit ${event.title}`}
                        title="Edit"
                        onClick={() => startEdit(event)}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        disabled={anyBusy}
                        aria-label={`Delete ${event.title}`}
                        title="Delete"
                        onClick={() => setDeletingEvent(event)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit dialog — the form is pre-filled from the row being edited. */}
      <Dialog
        open={editingEvent !== null}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setEditingEvent(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the details of “{editingEvent?.title}”.
            </DialogDescription>
          </DialogHeader>
          <form
            id="edit-event-form"
            noValidate
            onSubmit={handleUpdate}
            className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1"
          >
            <div className="grid gap-2">
              <Label htmlFor="edit-event-title">Event Title</Label>
              <Input
                id="edit-event-title"
                required
                value={editValues.title}
                aria-invalid={editErrors.title ? true : undefined}
                onChange={(e) => handleEditChange("title", e.target.value)}
              />
              {handleEditFieldErrors("title")}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-event-category">Category</Label>
                <Select
                  value={editValues.category || null}
                  onValueChange={(value) =>
                    handleEditChange("category", value ? String(value) : "")
                  }
                >
                  <SelectTrigger
                    id="edit-event-category"
                    className="w-full"
                    aria-invalid={editErrors.category ? true : undefined}
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
                {handleEditFieldErrors("category")}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-event-location">Location</Label>
                <Input
                  id="edit-event-location"
                  required
                  value={editValues.location}
                  aria-invalid={editErrors.location ? true : undefined}
                  onChange={(e) =>
                    handleEditChange("location", e.target.value)
                  }
                />
                {handleEditFieldErrors("location")}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-event-date">Date</Label>
                <Input
                  id="edit-event-date"
                  type="date"
                  required
                  value={editValues.date}
                  aria-invalid={editErrors.date ? true : undefined}
                  onChange={(e) => handleEditChange("date", e.target.value)}
                />
                {handleEditFieldErrors("date")}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-event-volunteers">
                  Target Volunteers
                </Label>
                <Input
                  id="edit-event-volunteers"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={editValues.volunteersNeeded}
                  aria-invalid={editErrors.volunteersNeeded ? true : undefined}
                  onChange={(e) =>
                    handleEditChange("volunteersNeeded", e.target.value)
                  }
                />
                {handleEditFieldErrors("volunteersNeeded")}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-event-image-url">Image URL</Label>
              <Input
                id="edit-event-image-url"
                type="url"
                required
                value={editValues.imageUrl}
                aria-invalid={editErrors.imageUrl ? true : undefined}
                onChange={(e) =>
                  handleEditChange("imageUrl", e.target.value)
                }
              />
              {handleEditFieldErrors("imageUrl")}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-event-description">Description</Label>
              <Textarea
                id="edit-event-description"
                rows={4}
                required
                value={editValues.description}
                aria-invalid={editErrors.description ? true : undefined}
                onChange={(e) =>
                  handleEditChange("description", e.target.value)
                }
              />
              {handleEditFieldErrors("description")}
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setEditingEvent(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-event-form"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog. */}
      <Dialog
        open={deletingEvent !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingEvent(null);
          }
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              “{deletingEvent?.title}” will be permanently deleted. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingEvent(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
