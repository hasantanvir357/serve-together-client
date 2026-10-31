import Hero from "@/components/Hero";
import EventCategories from "@/components/EventCategories";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <EventCategories />
    </main>
  );
}
