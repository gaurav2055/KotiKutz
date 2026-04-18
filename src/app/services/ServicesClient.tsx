"use client";

import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import SiteHero from "@/components/SiteHero";
import ServicesSidebar from "@/components/services/ServicesSidebar";
import ServiceGridCard from "@/components/ServiceGridCard";
import type { FiltersState } from "./page";

type Service = {
  id: string;
  name: string;
  price: number;
  category: string;
  gender: string;
  description: string;
  image_url: string | null;
};

type Props = {
  initialServices: Service[];
  heroImage: string | null;
  locationOptions: { label: string; value: string }[];
};

const PAGE_SIZE = 20;

export default function ServicesClient({ initialServices, heroImage, locationOptions }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [page,        setPage]        = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    locationId: "",
    gender: "",
    categories: [],
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [filters]);

  const categories = useMemo(
    () => [...new Set(initialServices.map((s) => s.category))].sort(),
    [initialServices]
  );

  const filtered = useMemo(() => {
    return initialServices.filter((s) => {
      if (filters.search && !s.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.gender && s.gender !== "Unisex" && s.gender !== filters.gender) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(s.category)) return false;
      return true;
    });
  }, [filters, initialServices]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);

  return (
    <main>
      <SiteHero title="Services" heroImage={heroImage} showServicesBtn={false} showBookingBtn />

      {/* Mobile filter toggle */}
      <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => setShowFilters((f) => !f)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg text-sm"
        >
          <SlidersHorizontal size={16} />
          {showFilters ? "Hide Filters" : "Filters"}
        </button>
        <span className="text-sm text-gray-500">{filtered.length} services</span>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className={`${showFilters ? "block" : "hidden"} md:flex md:flex-col md:w-[30%] md:max-w-[344px] shrink-0`}>
          <ServicesSidebar filters={filters} categories={categories} locationOptions={locationOptions} onChange={setFilters} />
        </div>

        <div className="flex-1 py-8 md:py-12 px-4 md:px-8">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-center mt-20 text-lg">
              No services match your filters.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {paginated.map((service) => (
                  <ServiceGridCard
                    key={service.id}
                    name={service.name}
                    price={`₹${service.price}`}
                    description={service.description}
                    image={service.image_url}
                  />
                ))}
              </div>

              {paginated.length < filtered.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-2 bg-brand-dark text-white rounded-lg text-sm hover:opacity-80 transition-opacity"
                  >
                    Load more ({filtered.length - paginated.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
