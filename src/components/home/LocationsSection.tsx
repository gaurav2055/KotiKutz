import LocationCard from "@/components/LocationCard";

const LOCATIONS = [
  { name: "Porwal Road",     address: "Address: Lorem ipsum dolor sit amet consectetur. Urna ac nunc blandit integer eget.", image: "/images/Locations/porwal-road.jpg"   },
  { name: "Viman Nagar",     address: "Address: Lorem ipsum dolor sit amet consectetur. Urna ac nunc blandit integer eget.", image: "/images/Locations/Viman-Nagar.jpg"    },
  { name: "Dhanori",         address: "Address: Lorem ipsum dolor sit amet consectetur. Urna ac nunc blandit integer eget.", image: "/images/Locations/Dhanori.jpg"        },
  { name: "Lohegaon",        address: "Address: Lorem ipsum dolor sit amet consectetur. Urna ac nunc blandit integer eget.", image: "/images/Locations/Lohegaon.jpg"       },
  { name: "Dahisar, Mumbai", address: "Address: Lorem ipsum dolor sit amet consectetur. Urna ac nunc blandit integer eget.", image: "/images/Locations/Dahisar-Mumbai.jpg" },
];

export default function LocationsSection() {
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
        {LOCATIONS.slice(0, 3).map((location) => (
          <LocationCard key={location.name} {...location} />
        ))}

        {/* Bottom row — last 2 location photos (remaining 2 cells stay empty) */}
        {LOCATIONS.slice(3).map((location) => (
          <LocationCard key={location.name} {...location} />
        ))}

      </div>
    </section>
  );
}
