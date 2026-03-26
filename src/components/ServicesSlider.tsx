"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { supabase } from "@/lib/supabase";

type Service = {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
};

const CARDS_VISIBLE = 3;

export default function ServicesSlider() {
  const [services, setServices] = useState<Service[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, price, description, image_url")
      .limit(10)
      .then(({ data }) => { if (data) setServices(data); });
  }, []);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + CARDS_VISIBLE < services.length;
  const visible = services.slice(startIndex, startIndex + CARDS_VISIBLE);

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
        {visible.map((service) => (
          <ServiceCard
            key={service.id}
            image={service.image_url}
            name={service.name}
            price={`₹${service.price}/-`}
            location="All"
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
