import SiteHero from "@/components/SiteHero";
import OffersSection from "@/components/home/OffersSection";
import LocationsSection from "@/components/home/LocationsSection";
import PopularServicesSection from "@/components/home/PopularServicesSection";

export default function HomePage() {
  return (
    <main>
      <SiteHero />
      <OffersSection />
      <LocationsSection />
      <PopularServicesSection />
    </main>
  );
}
