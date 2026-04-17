"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TeamMemberCard from "@/components/about/TeamMemberCard";
import { supabase } from "@/lib/supabase";

type StaffMember = {
  id: string;
  specialization: string | null;
  profiles: { name: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null } | null;
  locations: { name: string }[] | null;
};

export default function TeamSlider() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("staff")
      .select("id, specialization, profiles!staff_id_fkey(name, first_name, last_name, avatar_url), locations(name)")
      .then(({ data }) => { if (data) setMembers(data as unknown as StaffMember[]); });
  }, []);

  function scrollBy(dir: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const gap = window.innerWidth >= 768 ? 56 : 24;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" });
  }

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 mb-8 md:mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-black">Meet Our Team</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-black" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 md:gap-14 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 md:px-20 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {members.filter((m) => m.profiles?.avatar_url).map((member) => (
            <div
              key={member.id}
              data-card
              className="w-[80vw] sm:w-[45vw] lg:w-[410px] h-[449px] shrink-0 snap-center"
            >
              <TeamMemberCard
                name={member.profiles?.first_name ? `${member.profiles.first_name} ${member.profiles.last_name ?? ""}`.trim() : member.profiles?.name ?? ""}
                specialization={member.specialization ?? ""}
                image={member.profiles!.avatar_url!}
                location={member.locations?.[0]?.name ?? ""}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollBy(1)}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </section>
  );
}
