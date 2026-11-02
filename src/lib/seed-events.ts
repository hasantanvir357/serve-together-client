/**
 * The 5 Bangladesh community drives seeded on the home page,
 * the /upcoming-events feed, and the /seed endpoint of the Express API.
 *
 * Seed IDs (`seed-1` … `seed-5`) are stable strings, so cards can link to
 * `/events/seed-N` and the Express API resolves them from its matching
 * local fallback array (see serve-together-server/routes/eventRoutes.js).
 */
export type SeedEvent = {
  _id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  volunteersNeeded: number;
  organizerEmail: string;
  description: string;
  imageUrl: string;
  joinedUsers: string[];
};

export const SEED_EVENTS: SeedEvent[] = [
  {
    _id: 'seed-1',
    title: 'Surma River Tree Plantation Drive',
    category: 'Tree Plantation',
    location: 'Jaflong Road, Sylhet',
    date: '2026-11-15',
    volunteersNeeded: 45,
    organizerEmail: 'green.sylhet@servetogether.com',
    description:
      "Join us in planting indigenous saplings and fruit trees along the riverbank to restore Sylhet's natural canopy.",
    imageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
    joinedUsers: [],
  },
  {
    _id: 'seed-2',
    title: 'Moheshkhali Coastal Winter Relief',
    category: 'Winter Clothes',
    location: 'Gorakghata, Moheshkhali',
    date: '2026-11-20',
    volunteersNeeded: 30,
    organizerEmail: 'relief.moheshkhali@servetogether.com',
    description:
      'Distributing warm blankets and winter essential clothes to underprivileged coastal fishermen families.',
    imageUrl:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
    joinedUsers: [],
  },
  {
    _id: 'seed-3',
    title: 'DU Campus Emergency Blood Donation Camp',
    category: 'Blood Drive',
    location: 'TSC, University of Dhaka',
    date: '2026-11-25',
    volunteersNeeded: 60,
    organizerEmail: 'blood.du@servetogether.com',
    description:
      'A day-long voluntary blood donation drive to restock emergency blood banks across Dhaka city.',
    imageUrl:
      'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=800&auto=format&fit=crop',
    joinedUsers: [],
  },
  {
    _id: 'seed-4',
    title: "Cox's Bazar Beach Plastic Clean-up Drive",
    category: 'Cleanup',
    location: "Laboni Beach, Cox's Bazar",
    date: '2026-12-02',
    volunteersNeeded: 50,
    organizerEmail: 'ocean.cleanup@servetogether.com',
    description:
      "Removing plastic debris and ocean waste from the world's longest natural sea beach.",
    imageUrl:
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=800&auto=format&fit=crop',
    joinedUsers: [],
  },
  {
    _id: 'seed-5',
    title: 'Free Rural Learning & Book Distribution Support',
    category: 'Education',
    location: "Kutubdia, Cox's Bazar",
    date: '2026-12-10',
    volunteersNeeded: 25,
    organizerEmail: 'education.rural@servetogether.com',
    description:
      'Conducting basic literacy sessions, distributing textbooks, and providing stationery to school children.',
    imageUrl:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
    joinedUsers: [],
  },
];

export function findSeedEvent(eventId: string): SeedEvent | null {
  return SEED_EVENTS.find((event) => event._id === eventId) ?? null;
}

/**
 * Merge API events with the seeds: the seed cards always render first, and
 * real backend events are appended without ever overwriting the seeds.
 * Duplicates are removed by title (a seeded backend copy of the same event is
 * redundant because the seed fallback serves the same content).
 *
 * Pass `seedEvents` to limit the seeds to a subset — e.g. only the `seed-N`
 * events the current user has joined on the Joined Events page.
 */
export function mergeEventsWithSeeds<
  T extends { _id: string; title: string },
>(apiEvents: readonly T[], seedEvents: readonly (T | SeedEvent)[] = SEED_EVENTS): T[] {
  const merged: T[] = [...seedEvents, ...apiEvents] as T[];
  const unique = new Map<string, T>();
  for (const event of merged) {
    const key = event.title.trim().toLowerCase();
    if (key && !unique.has(key)) {
      unique.set(key, event);
    }
  }
  return Array.from(unique.values());
}
