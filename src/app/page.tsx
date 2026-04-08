"use client";

import { useEffect, useState } from "react";
import SiteHero            from "@/components/SiteHero";
import OffersSection       from "@/components/home/OffersSection";
import LocationsSection    from "@/components/home/LocationsSection";
import PopularServicesSection from "@/components/home/PopularServicesSection";
import { supabase }        from "@/lib/supabase";

const KEYS = ["hero_image_home", "home_locations_description"];

export default function HomePage() {
  const [heroImage,    setHeroImage]    = useState<string | null>(null);
  const [locationsDesc, setLocationsDesc] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("key, value")
      .in("key", KEYS)
      .then(({ data }) => {
        data?.forEach((r) => {
          if (r.key === "hero_image_home")            setHeroImage(r.value);
          if (r.key === "home_locations_description") setLocationsDesc(r.value);
        });
      });
  }, []);

  return (
    <main>
      <SiteHero heroImage={heroImage} />
      <OffersSection />
      <LocationsSection description={locationsDesc} />
      <PopularServicesSection />
    </main>
  );
}
