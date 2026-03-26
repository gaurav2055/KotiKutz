"use client";

import { useEffect, useState } from "react";
import LocationCard from "@/components/LocationCard";
import { supabase } from "@/lib/supabase";

type Location = {
  id: string;
  name: string;
  address: string;
  image_url: string;
};

export default function LocationsSection() {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    supabase
      .from("locations")
      .select("id, name, address, image_url")
      .then(({ data }) => { if (data) setLocations(data); });
  }, []);

  return (
    <section className="py-16 max-w-[1331px] mx-auto px-8">
      <div className="grid grid-cols-4 gap-4">

        {/* Top-left cell: Locations heading + description */}
        <div className="flex flex-col justify-center pr-4">
          <h2 className="font-serif font-bold text-3xl text-black mb-4">Locations</h2>
          <p className="text-base text-gray-700">
            Lorem ipsum dolor sit amet consectetur. Integer id dolor in ipsum ullamcorper.
          </p>
        </div>

        {/* Top row — first 3 location photos */}
        {locations.slice(0, 3).map((location) => (
          <LocationCard key={location.id} name={location.name} address={location.address} image={location.image_url} />
        ))}

        {/* Bottom row — last 2 location photos */}
        {locations.slice(3).map((location) => (
          <LocationCard key={location.id} name={location.name} address={location.address} image={location.image_url} />
        ))}

      </div>
    </section>
  );
}
