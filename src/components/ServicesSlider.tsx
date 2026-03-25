"use client";

// "use client" means this component runs in the browser, not just on the server.
// We need this here because we use useState to track which slide is showing.
// Server components (like page.tsx) can't use React state.

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
const SERVICE_CARD_IMAGE = "/images/Services/default-service-image.jpg";

// Placeholder service data — replace with real data from your backend later
const SERVICES = [
  { id: 1, name: "Haircut",    price: "₹299/-", location: "All", description: "Classic haircut tailored to your style." },
  { id: 2, name: "Beard Trim", price: "₹149/-", location: "All", description: "Sharp beard shaping and trimming." },
  { id: 3, name: "Hair Color", price: "₹599/-", location: "All", description: "Professional hair coloring service." },
  { id: 4, name: "Hot Shave",  price: "₹199/-", location: "All", description: "Traditional hot towel straight razor shave." },
  { id: 5, name: "Facial",     price: "₹399/-", location: "All", description: "Refreshing facial treatment." },
];

const CARDS_VISIBLE = 3;

export default function ServicesSlider() {
  const [startIndex, setStartIndex] = useState(0);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + CARDS_VISIBLE < SERVICES.length;

  const visibleServices = SERVICES.slice(startIndex, startIndex + CARDS_VISIBLE);

  return (
    <div className="flex items-center justify-center gap-8 px-16">
      <button
        onClick={() => setStartIndex((i) => i - 1)}
        disabled={!canGoPrev}
        className="shrink-0 cursor-pointer disabled:opacity-30"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <div className="flex gap-14">
        {visibleServices.map((service) => (
          <ServiceCard
            key={service.id}
            image={SERVICE_CARD_IMAGE}
            name={service.name}
            price={service.price}
            location={service.location}
            description={service.description}
          />
        ))}
      </div>

      <button
        onClick={() => setStartIndex((i) => i + 1)}
        disabled={!canGoNext}
        className="shrink-0 cursor-pointer disabled:opacity-30"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
