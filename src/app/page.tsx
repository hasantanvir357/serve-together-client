import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import EventCategories from "@/components/EventCategories";
import UpcomingEvents from "@/components/UpcomingEvents";
import VolunteerCTA from "@/components/VolunteerCTA";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <StatsSection />
      <EventCategories />
      <UpcomingEvents />
      <VolunteerCTA />
    </main>
  );
}
