"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function ServicesPage() {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [heroImage,   setHeroImage]   = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);
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

  const categories = useMemo(
    () => [...new Set(allServices.map((s) => s.category))].sort(),
    [allServices]
  );

  const filtered = useMemo(() => {
    return allServices.filter((s) => {
      if (filters.search && !s.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.gender && s.gender !== "All" && s.gender !== filters.gender) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(s.category)) return false;
      return true;
    });
  }, [filters, allServices]);

  return (
    <main>
      <SiteHero title="Services" heroImage={heroImage} showServicesBtn={false} showBookingBtn />
      <div className="flex">
        <ServicesSidebar filters={filters} categories={categories} onChange={setFilters} />
        <div className="flex-1 py-12 px-8">
          {loading ? (
            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <Skeleton className="h-48 rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-center mt-20 text-lg">
              No services match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filtered.map((service) => (
                <ServiceGridCard
                  key={service.id}
                  name={service.name}
                  price={`₹${service.price}`}
                  description={service.description}
                  image={service.image_url}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
