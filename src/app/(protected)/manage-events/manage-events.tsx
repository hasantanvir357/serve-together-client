'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

interface EventItem {
  _id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: number;
}

export default function ManageEvents() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const email = session?.user?.email ?? '';

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/my-events?email=${encodeURIComponent(email)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as EventItem[];
          setEvents(data);
        }
      } catch {
        console.error('Failed to load user events');
      } finally {
        // Only finalize loading state if the request was not cancelled.
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [email]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev._id !== id));
      }
    } catch {
      alert('Failed to delete event');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading your events...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Events</h1>
          <p className="text-slate-500 text-sm">Edit, update, and remove the volunteering events you host.</p>
        </div>
        <Link
          href="/create-event"
          className="flex items-center gap-2 bg-[#0284c7] hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-600 mb-4">You haven&apos;t created any events yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-800">{event.title}</td>
                    <td className="p-4">
                      <span className="bg-sky-100 text-[#0284c7] text-xs font-semibold px-2 py-0.5 rounded-full">
                        {event.category}
                      </span>
                    </td>
                    <td className="p-4">{event.location}</td>
                    <td className="p-4">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
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
    </div>
  );
}
