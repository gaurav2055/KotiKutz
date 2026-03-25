"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TeamMemberCard from "@/components/about/TeamMemberCard";

// TODO: Replace with real team data from backend
const PLACEHOLDER_IMAGE = "/images/Team/Default-Team-member.jpg";

const TEAM_MEMBERS = [
  { id: 1, name: "FName LName", location: "Viman Nagar",     specialization: "Haircuts & Styling", image: PLACEHOLDER_IMAGE },
  { id: 2, name: "FName LName", location: "Porwal Road",     specialization: "Beard & Shaving",    image: PLACEHOLDER_IMAGE },
  { id: 3, name: "FName LName", location: "Dhanori",         specialization: "Hair Coloring",       image: PLACEHOLDER_IMAGE },
  { id: 4, name: "FName LName", location: "Lohegaon",        specialization: "Skincare",            image: PLACEHOLDER_IMAGE },
  { id: 5, name: "FName LName", location: "Dahisar, Mumbai", specialization: "Massage",             image: PLACEHOLDER_IMAGE },
];

const CARDS_VISIBLE = 3;

export default function TeamSlider() {
  const [startIndex, setStartIndex] = useState(0);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + CARDS_VISIBLE < TEAM_MEMBERS.length;

  const visible = TEAM_MEMBERS.slice(startIndex, startIndex + CARDS_VISIBLE);

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
            <TeamMemberCard key={member.id} {...member} />
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
