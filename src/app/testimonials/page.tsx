"use client";

import { useState, useMemo } from "react";
import SiteHero from "@/components/SiteHero";
import Dropdown from "@/components/ui/Dropdown";
import TestimonialCard from "@/components/testimonials/TestimonialCard";

const LOCATION_OPTIONS = [
  { label: "Porwal Road",     value: "Porwal Road" },
  { label: "Viman Nagar",     value: "Viman Nagar" },
  { label: "Dhanori",         value: "Dhanori" },
  { label: "Lohegaon",        value: "Lohegaon" },
  { label: "Dahisar, Mumbai", value: "Dahisar, Mumbai" },
];

// TODO: Replace with backend data
const TESTIMONIALS = [
  { id: 1, quote: "Lorem ipsum dolor sit amet consectetur. Ullamcorper et vel porta natoque ornare. Facilisi nisi nisl cursus gravida potenti.", name: "FName LName", location: "Viman Nagar",     rating: 4 },
  { id: 2, quote: "Lorem ipsum dolor sit amet consectetur. Ullamcorper et vel porta natoque ornare. Facilisi nisi nisl cursus gravida potenti.", name: "FName Lname",  location: "Porwal Road",     rating: 5 },
  { id: 3, quote: "Lorem ipsum dolor sit amet consectetur. Ullamcorper et vel porta natoque ornare. Facilisi nisi nisl cursus gravida potenti.", name: "FName Lname",  location: "Dhanori",         rating: 5 },
  { id: 4, quote: "Lorem ipsum dolor sit amet consectetur. Ullamcorper et vel porta natoque ornare. Facilisi nisi nisl cursus gravida potenti.", name: "Anonymus",     location: "Lohegaon",        rating: 4 },
];

export default function TestimonialsPage() {
  const [location, setLocation] = useState("");

  const filtered = useMemo(() =>
    location ? TESTIMONIALS.filter((t) => t.location === location) : TESTIMONIALS,
    [location]
  );

  const [featured, ...rest] = filtered;

  return (
    <main>
      <SiteHero title="Testimonials" />

      <div className="max-w-[1229px] mx-auto px-8 py-10">

        {/* Location filter */}
        <div className="w-[219px] mb-8">
          <Dropdown
            value={location}
            onChange={setLocation}
            options={LOCATION_OPTIONS}
            placeholder="Choose Location"
            variant="light"
          />
        </div>

        {/* Featured testimonial */}
        {featured && (
          <div className="mb-8">
            <TestimonialCard {...featured} featured />
          </div>
        )}

        {/* Row of remaining testimonials */}
        {rest.length > 0 && (
          <div className="flex gap-6">
            {rest.map((t) => (
              <TestimonialCard key={t.id} {...t} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
