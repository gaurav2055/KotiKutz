"use client";

import { useEffect, useRef, useState } from "react";
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

function SliderSkeleton() {
  return (
    <div className="flex gap-6 md:gap-14 px-4 md:px-20 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="w-[80vw] sm:w-[45vw] lg:w-[410px] h-[449px] shrink-0 rounded-[15px] bg-gray-300 animate-pulse" />
      ))}
    </div>
  );
}

export default function ServicesSlider() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, price, description, image_url")
      .limit(10)
      .then(({ data }) => {
        if (data) setServices(data);
        setLoading(false);
      });
  }, []);

  function scrollBy(dir: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const gap = window.innerWidth >= 768 ? 56 : 24; // gap-14 on md, gap-6 on mobile
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" });
  }

  if (loading) return <SliderSkeleton />;

  return (
    <div className="relative">
      <button
        onClick={() => scrollBy(-1)}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 md:gap-14 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 md:px-20 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((service) => (
          <div
            key={service.id}
            data-card
            className="w-[80vw] sm:w-[45vw] lg:w-[410px] h-[449px] shrink-0 snap-center"
          >
            <ServiceCard
              image={service.image_url}
              name={service.name}
              price={`₹${service.price}/-`}
              location="All"
              description={service.description}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollBy(1)}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
