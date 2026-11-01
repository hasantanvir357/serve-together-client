import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import EventCategories from '@/components/EventCategories';
import UpcomingEvents from '@/components/UpcomingEvents';
import Testimonials from '@/components/Testimonials';
import VolunteerCTA from '@/components/VolunteerCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <Hero />
        <StatsSection />
        <EventCategories />
        <UpcomingEvents />
        <Testimonials />
        <VolunteerCTA />
      </main>
      <Footer />
    </>
  );
}
