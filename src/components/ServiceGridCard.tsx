import Image from "next/image";
import Link from "next/link";

type ServiceGridCardProps = {
  name: string;
  price: string;
  description: string;
  image: string;
  location?: string;
};

export default function ServiceGridCard({ name, price, description, image, location = "All" }: ServiceGridCardProps) {
  return (
    <div className="relative h-[289px] rounded-[12px] overflow-hidden shadow-md group cursor-pointer">
      <Image src={image} alt={name} fill className="object-cover" />

      {/* Default overlay — darker bottom-heavy panel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 group-hover:opacity-0 transition-opacity duration-300" />

      {/* Hover overlay — near-black full cover */}
      <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Book button — top-right, hover only */}
      <Link
        href="/appointments"
        className="absolute top-4 right-4 bg-brand-green text-brand-dark text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
      >
        Book
      </Link>

      {/* Text block — sits near bottom, slides up on hover to reveal description */}
      <div className="absolute left-4 right-4 bottom-1 text-white z-10 transition-transform duration-300 group-hover:-translate-y-7">
        <p className="text-xl font-semibold">{name}</p>
        <p className="text-xl">{price}/-</p>
        <p className="text-sm mt-0.5">Location: {location}</p>
        <p className="text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Service Description: {description}
        </p>
      </div>
    </div>
  );
}
