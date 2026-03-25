"use client";

import { useState, useMemo } from "react";
import SiteHero from "@/components/SiteHero";
import ServicesSidebar from "@/components/services/ServicesSidebar";
import ServiceGridCard from "@/components/ServiceGridCard";

// TODO: Replace with backend API data
const SERVICE_IMAGE = "/images/Services/default-service-image.jpg";

const ALL_SERVICES = [
  { id: 1,  name: "Haircut",            price: "₹299",  category: "Hair",  gender: "Men",   description: "Classic haircut tailored to your style.",            image: SERVICE_IMAGE },
  { id: 2,  name: "Beard Trim",         price: "₹149",  category: "Beard", gender: "Men",   description: "Sharp beard shaping and trimming.",                   image: SERVICE_IMAGE },
  { id: 3,  name: "Hair Color",         price: "₹599",  category: "Hair",  gender: "All",   description: "Professional hair coloring service.",                 image: SERVICE_IMAGE },
  { id: 4,  name: "Hot Shave",          price: "₹199",  category: "Beard", gender: "Men",   description: "Traditional hot towel straight razor shave.",         image: SERVICE_IMAGE },
  { id: 5,  name: "Facial",            price: "₹399",  category: "Skin",  gender: "All",   description: "Refreshing facial treatment.",                        image: SERVICE_IMAGE },
  { id: 6,  name: "Hair Wash",          price: "₹99",   category: "Hair",  gender: "All",   description: "Thorough hair wash with conditioning.",               image: SERVICE_IMAGE },
  { id: 7,  name: "Kids Haircut",       price: "₹199",  category: "Hair",  gender: "Kids",  description: "Fun and gentle haircut for kids.",                    image: SERVICE_IMAGE },
  { id: 8,  name: "Eyebrow Threading", price: "₹49",   category: "Skin",  gender: "All",   description: "Clean and precise eyebrow shaping.",                  image: SERVICE_IMAGE },
  { id: 9,  name: "Head Massage",       price: "₹249",  category: "Hair",  gender: "All",   description: "Relaxing oil head massage.",                          image: SERVICE_IMAGE },
  { id: 10, name: "De-tan",            price: "₹349",  category: "Skin",  gender: "All",   description: "Skin de-tanning treatment.",                          image: SERVICE_IMAGE },
  { id: 11, name: "Shampoo + Blow Dry",price: "₹199",  category: "Hair",  gender: "All",   description: "Professional shampoo and styling.",                   image: SERVICE_IMAGE },
  { id: 12, name: "Pedicure",          price: "₹499",  category: "Skin",  gender: "All",   description: "Relaxing foot care treatment.",                       image: SERVICE_IMAGE },
];

export type FiltersState = {
  search: string;
  location: string;
  gender: string;
  categories: string[];
};

export default function ServicesPage() {
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    location: "",
    gender: "",
    categories: [],
  });

  const filtered = useMemo(() => {
    return ALL_SERVICES.filter((s) => {
      if (filters.search && !s.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.gender && s.gender !== "All" && s.gender !== filters.gender) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(s.category)) return false;
      return true;
    });
  }, [filters]);

  return (
    <main>
      <SiteHero title="Services" showServicesBtn={false} showBookingBtn />
      <div className="flex">
        <ServicesSidebar filters={filters} onChange={setFilters} />
        <div className="flex-1 py-12 px-8">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-center mt-20 text-lg">
              No services match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filtered.map((service) => (
                <ServiceGridCard key={service.id} {...service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
