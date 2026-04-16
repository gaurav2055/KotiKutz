"use client";

import { useEffect, useState } from "react";
import LocationCard from "@/components/LocationCard";
import Skeleton from "@/components/ui/Skeleton";
import { supabase } from "@/lib/supabase";

type Location = {
  id: string;
  name: string;
  address: string;
  image_url: string | null;
};

type Props = { description?: string | null };

function LocationsSkeletonDesktop() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col justify-center pr-4 gap-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-[377px] rounded-none" />
      ))}
    </div>
  );
}

function LocationsSkeletonMobile() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="w-[72vw] h-[260px] shrink-0 bg-gray-200 animate-pulse" />
      ))}
    </div>
  );
}

export default function LocationsSection({ description }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    supabase
      .from("locations")
      .select("id, name, address, image_url")
      .then(({ data }) => {
        if (data) setLocations(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-10 lg:py-16">

      {/* Mobile + Tablet layout (up to lg) — horizontal scroll slider */}
      <div className="lg:hidden px-4">
        <h2 className="font-serif font-bold text-3xl text-black mb-2">Locations</h2>
        {description && <p className="text-base text-gray-700 mb-4">{description}</p>}
        {loading ? (
          <LocationsSkeletonMobile />
        ) : (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {locations.map((location) => (
              <div key={location.id} className="w-[72vw] md:w-[45vw] shrink-0 snap-center">
                <LocationCard name={location.name} address={location.address} image={location.image_url} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop layout (lg+) — 4-column grid */}
      <div className="hidden lg:block max-w-[1331px] mx-auto px-8">
        {loading ? (
          <LocationsSkeletonDesktop />
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col justify-center pr-4">
              <h2 className="font-serif font-bold text-3xl text-black mb-4">Locations</h2>
              {description && <p className="text-base text-gray-700">{description}</p>}
            </div>
            {locations.map((location) => (
              <LocationCard key={location.id} name={location.name} address={location.address} image={location.image_url} />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
