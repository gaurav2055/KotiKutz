// LocationCard molecule — used on the Home page Locations section.

import Image from "next/image";
import { MapPin } from "lucide-react";

type LocationCardProps = {
  name: string;
  address: string;
  image: string;
};

export default function LocationCard({ name, address, image }: LocationCardProps) {
  return (
    <div className="group relative h-[377px] border border-black overflow-hidden cursor-pointer">

      {/* ── DEFAULT STATE ── */}
      <Image src={image} alt={name} fill className="object-cover" />

      {/* Bottom banner strip */}
      <div
        className="absolute transition-opacity duration-300 group-hover:opacity-0 bg-brand-dark/80"
        style={{ left: "23.9%", top: "87.4%", width: "75.9%", height: "12.9%" }}
      />

      {/* Green pin */}
      <div
        className="absolute transition-opacity duration-300 group-hover:opacity-0 flex items-center justify-center"
        style={{ top: "88%", left: "37%", width: "10%", height: "10%" }}
      >
        <MapPin className="w-5 h-5 text-brand-green" fill="currentColor" />
      </div>

      {/* Green location name */}
      <p
        className="absolute text-brand-green text-xl whitespace-nowrap transition-opacity duration-300 group-hover:opacity-0"
        style={{ left: "46.2%", top: "92.3%" }}
      >
        {name}
      </p>

      {/* ── HOVER STATE ── */}

      {/* Grey overlay */}
      <div className="absolute inset-0 border border-black bg-[rgba(217,217,217,0.82)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Black pin */}
      <div
        className="absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center"
        style={{ top: "33%", left: "14%", width: "10%", height: "10%" }}
      >
        <MapPin className="w-8 h-8 text-black" fill="currentColor" />
      </div>

      {/* Location name in black */}
      <p
        className="absolute text-black text-2xl whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ left: "30.8%", top: "35.8%" }}
      >
        {name}
      </p>

      {/* Address */}
      <p
        className="absolute text-black text-xl leading-snug opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ left: "14.7%", top: "49.6%", width: "72.9%" }}
      >
        {address}
      </p>

    </div>
  );
}
