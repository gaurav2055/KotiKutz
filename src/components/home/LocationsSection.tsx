import LocationCard from "@/components/LocationCard";

type Location = {
  id: string;
  name: string;
  address: string;
  image_url: string | null;
};

type Props = {
  locations: Location[];
  description?: string | null;
};

export default function LocationsSection({ locations, description }: Props) {
  return (
    <section className="py-10 lg:py-16">

      {/* Mobile + Tablet layout (up to lg) — horizontal scroll slider */}
      <div className="lg:hidden px-4">
        <h2 className="font-serif font-bold text-3xl text-black mb-2">Locations</h2>
        {description && <p className="text-base text-gray-700 mb-4">{description}</p>}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {locations.map((location) => (
            <div key={location.id} className="w-[72vw] md:w-[45vw] shrink-0 snap-center">
              <LocationCard name={location.name} address={location.address} image={location.image_url} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop layout (lg+) — 4-column grid */}
      <div className="hidden lg:block max-w-[1331px] mx-auto px-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col justify-center pr-4">
            <h2 className="font-serif font-bold text-3xl text-black mb-4">Locations</h2>
            {description && <p className="text-base text-gray-700">{description}</p>}
          </div>
          {locations.map((location) => (
            <LocationCard key={location.id} name={location.name} address={location.address} image={location.image_url} />
          ))}
        </div>
      </div>

    </section>
  );
}
