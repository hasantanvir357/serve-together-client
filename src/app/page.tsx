import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import EventCategories from "@/components/EventCategories";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <StatsSection />
      <EventCategories />
    </main>
  );
}
