"use client";

import { useEffect, useState } from "react";
import LocationCard from "@/components/LocationCard";
import Skeleton from "@/components/ui/Skeleton";
import { supabase } from "@/lib/supabase";

type Location = {
  id: string;
  name: string;
  address: string;
  image_url: string;
};

type Props = { description?: string | null };

function LocationsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Text cell */}
      <div className="flex flex-col justify-center pr-4 gap-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      {/* Card skeletons — top row */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[377px] rounded-none" />
      ))}
      {/* Bottom row */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i + 3} className="h-[377px] rounded-none" />
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
    <section className="py-16 max-w-[1331px] mx-auto px-8">
      {loading ? (
        <LocationsSkeleton />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {/* Top-left cell: heading + description */}
          <div className="flex flex-col justify-center pr-4">
            <h2 className="font-serif font-bold text-3xl text-black mb-4">Locations</h2>
            {description && <p className="text-base text-gray-700">{description}</p>}
          </div>

          {locations.slice(0, 3).map((location) => (
            <LocationCard key={location.id} name={location.name} address={location.address} image={location.image_url} />
          ))}

          {locations.slice(3).map((location) => (
            <LocationCard key={location.id} name={location.name} address={location.address} image={location.image_url} />
          ))}
        </div>
      )}
    </section>
  );
}
