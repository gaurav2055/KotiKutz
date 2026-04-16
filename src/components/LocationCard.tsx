"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

type LocationCardProps = {
  name: string;
  address: string;
  image: string | null;
};

// `relative` is required — next/image with fill needs a positioned parent,
// and all overlays use absolute positioning anchored to this card.
// Client component so tap-to-reveal works on touch devices.
export default function LocationCard({ name, address, image }: LocationCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className="group relative h-[260px] md:h-[377px] border border-black overflow-hidden cursor-pointer"
      onClick={() => setShowInfo((s) => !s)}
    >
      {/* Background photo */}
      {image
        ? <Image src={image} alt={name} fill className="object-cover" />
        : <div className="absolute inset-0 bg-gray-800" />
      }

      {/* ── DEFAULT STATE — dark strip at bottom ── */}
      {/* h-[17%] on mobile, h-[15%] on md+. Fades out on hover (desktop) or tap (touch). */}
      <div
        className={`absolute bottom-0 right-0 w-[80%] h-[17%] md:h-[15%] transition-opacity duration-300 group-hover:opacity-0 ${showInfo ? "opacity-0" : ""}`}
      >
        {/* Trapezoid background */}
        <div
          className="absolute inset-0 bg-brand-dark"
          style={{ clipPath: "polygon(24% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
        />
        {/* Icon + name — siblings of the clipped div so they aren't clipped */}
        <div className="absolute inset-0 flex items-center gap-2 pl-[23%] pr-4">
          <MapPin className="w-5 h-5 text-brand-green shrink-0" fill="currentColor" />
          <span className="text-brand-green text-base md:text-lg truncate">{name}</span>
        </div>
      </div>

      {/* ── HOVER / TAP STATE — grey overlay with centered info ── */}
      {/* Shows on CSS hover (desktop) OR when tapped (mobile/tablet). */}
      <div
        className={`absolute inset-0 bg-[rgba(217,217,217,0.82)] transition-opacity duration-300 flex flex-col items-center justify-center gap-4 px-6 group-hover:opacity-100 ${showInfo ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-7 h-7 text-black shrink-0" fill="currentColor" />
          <span className="text-xl md:text-2xl text-black">{name}</span>
        </div>
        <p className="text-base md:text-xl text-black text-center leading-snug">
          Address: {address}
        </p>
      </div>
    </div>
  );
}
