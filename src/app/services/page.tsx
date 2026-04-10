"use client";

import { useEffect, useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import SiteHero from "@/components/SiteHero";
import ServicesSidebar from "@/components/services/ServicesSidebar";
import ServiceGridCard from "@/components/ServiceGridCard";
import Skeleton from "@/components/ui/Skeleton";
import { supabase } from "@/lib/supabase";

type Service = {
  id: string;
  name: string;
  price: number;
  category: string;
  gender: string;
  description: string;
  image_url: string;
};

export type FiltersState = {
  search: string;
  locationId: string;
  gender: string;
  categories: string[];
};

const PAGE_SIZE = 20;

export default function ServicesPage() {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [heroImage,   setHeroImage]   = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page,        setPage]        = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    locationId: "",
    gender: "",
    categories: [],
  });

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, price, category, gender, description, image_url")
      .then(({ data }) => {
        if (data) setAllServices(data);
        setLoading(false);
      });
    supabase
      .from("site_content")
      .select("value")
      .eq("key", "hero_image_services")
      .single()
      .then(({ data }) => { if (data?.value) setHeroImage(data.value); });
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [filters]);

  const categories = useMemo(
    () => [...new Set(allServices.map((s) => s.category))].sort(),
    [allServices]
  );

  const filtered = useMemo(() => {
    return allServices.filter((s) => {
      if (filters.search && !s.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.gender && s.gender !== "Unisex" && s.gender !== filters.gender) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(s.category)) return false;
      return true;
    });
  }, [filters, allServices]);

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
          <ServicesSidebar filters={filters} categories={categories} onChange={setFilters} />
        </div>

        <div className="flex-1 py-8 md:py-12 px-4 md:px-8">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <Skeleton className="h-48 rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
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
