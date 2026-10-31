'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

interface EventItem {
  _id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  imageUrl?: string;
  description: string;
}

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then((res) => res.json())
      .then((data) => {
        // রিয়েল ডাটাবেজ থেকে লেটেস্ট ৬টি ইভেন্ট নেওয়া হচ্ছে
        const eventList = Array.isArray(data) ? data : [];
        setEvents(eventList.slice(0, 6));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Home page fetch error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section & Stats Section - আগের মতোই থাকবে */}

      {/* Upcoming Community Drives Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="mb-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                Get Involved
              </span>
              <h2 className="text-3xl font-bold tracking-tight">Upcoming Community Drives</h2>
              <p className="text-muted-foreground mt-1">Explore urgent volunteering opportunities around Bangladesh.</p>
            </div>
            <Link href="/upcoming-events">
              <Button variant="outline" className="gap-2">
                View All Upcoming Events <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading latest drives...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No upcoming drives available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card
                  key={event._id}
                  className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {event.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="p-4 pb-2">
                    <span className="mb-1 inline-flex w-fit items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {event.category}
                    </span>
                    <CardTitle className="line-clamp-1 text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span>{event.volunteersNeeded} Needed</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/events/${event._id}`} className="w-full">
                      <Button variant="default" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hero / CTA Banner section at bottom - Join as Volunteer button */}
      {/* Ensure link points to /upcoming-events */}
    </main>
  );
}
