"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TeamMemberCard from "@/components/about/TeamMemberCard";
import { supabase } from "@/lib/supabase";

type StaffMember = {
  id: string;
  name: string;
  specialization: string;
  image_url: string;
  locations: { name: string }[] | null;
};

const CARDS_VISIBLE = 3;

export default function TeamSlider() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    supabase
      .from("staff")
      .select("id, name, specialization, image_url, locations(name)")
      .then(({ data }) => { if (data) setMembers(data as StaffMember[]); });
  }, []);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + CARDS_VISIBLE < members.length;
  const visible = members.slice(startIndex, startIndex + CARDS_VISIBLE);

  return (
    <section className="py-16">
      <div className="max-w-[1440px] mx-auto px-8">
        <h2 className="text-5xl font-bold text-black mb-10">Meet Our Team</h2>
      </div>

      <div className="flex items-center justify-center gap-8 px-16">
        <button
          onClick={() => setStartIndex((i) => i - 1)}
          disabled={!canGoPrev}
          className="shrink-0 cursor-pointer disabled:opacity-30"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>

        <div className="flex gap-14">
          {visible.map((member) => (
            <TeamMemberCard
              key={member.id}
              name={member.name}
              specialization={member.specialization}
              image={member.image_url}
              location={member.locations?.[0]?.name ?? ""}
            />
          ))}
        </div>

        <button
          onClick={() => setStartIndex((i) => i + 1)}
          disabled={!canGoNext}
          className="shrink-0 cursor-pointer disabled:opacity-30"
        >
          <ChevronRight className="w-6 h-6 text-black" />
        </button>
      </div>
    </section>
  );
}
