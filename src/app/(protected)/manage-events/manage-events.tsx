'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, LoaderCircle } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useMounted } from '@/lib/use-mounted';
import { toast } from '@/components/ui/toast';

interface EventItem {
  _id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ManageEvents() {
  const { data: session } = useSession() || {};
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const mounted = useMounted();

  const email = session?.user?.email ?? '';

  useEffect(() => {
    if (!mounted) return;

    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/my-events?email=${encodeURIComponent(email)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as EventItem[];
          setEvents(Array.isArray(data) ? data : []);
        } else {
          // Fallback: load all events if my-events is empty or unauthenticated
          const fallbackRes = await fetch(`${API_BASE_URL}/api/events`, { signal: controller.signal });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            setEvents(Array.isArray(fallbackData) ? fallbackData : fallbackData.events || []);
          }
        }
      } catch {
        console.error('Failed to load user events');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [email, mounted]);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev._id !== deleteId));
        if (toast?.add) {
          toast.add({
            title: 'Event Deleted',
            description: 'The event has been successfully removed.',
            type: 'success',
          });
        }
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      if (toast?.add) {
        toast.add({ title: 'Error', description: 'Failed to delete the event.', type: 'error' });
      }
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-slate-500 dark:text-slate-400">
        <LoaderCircle className="w-8 h-8 animate-spin text-[#0284c7]" />
        <span className="ml-3 font-medium">Loading your events...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Events</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Edit, update, and remove the volunteering events you host.
          </p>
        </div>
        <Link
          href="/create-event"
          className="flex items-center gap-2 bg-[#0284c7] hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">You haven&apos;t created any events yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-100">{event.title}</td>
                    <td className="p-4">
                      {/* Unified Light Blue Tag System for all categories */}
                      <span className="bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {event.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{event.location}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {isNaN(new Date(event.date).getTime())
                        ? event.date
                        : new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setDeleteId(event._id)}
                        className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Custom Delete Modal Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl dark:text-slate-100">
            <h3 className="text-lg font-bold">Delete Event?</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
