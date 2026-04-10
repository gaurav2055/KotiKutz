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

      {/* Gradient for text readability — always on mobile/tablet, fades on desktop hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 transition-opacity duration-300 lg:group-hover:opacity-0" />

      {/* Dark overlay — desktop hover only */}
      <div className="absolute inset-0 bg-black/85 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300" />

      {/* Book button — always visible on mobile/tablet, hover-only on desktop */}
      <Link
        href="/appointments"
        className="absolute top-4 right-4 bg-brand-green text-brand-dark text-xs font-bold px-3 py-1.5 rounded z-10 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100"
      >
        Book
      </Link>

      {/* Text block */}
      <div className="absolute left-4 right-4 bottom-4 text-white z-10">
        <p className="text-sm md:text-xl font-semibold">{name}</p>
        <p className="text-sm md:text-xl">{price}/-</p>
        <p className="text-sm mt-0.5">Location: {location}</p>
        {/* Description — always visible on mobile/tablet, hover-only on desktop */}
        <p className="text-sm mt-1 lg:hidden lg:group-hover:block">{description}</p>
      </div>
    </div>
  );
}
