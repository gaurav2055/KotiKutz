// ServiceCard molecule — used on the Home page (Popular Services).

import Image from "next/image";

type ServiceCardProps = {
  name: string;
  price: string;
  location: string;
  description: string;
  image: string;
};

export default function ServiceCard({ name, price, location, description, image }: ServiceCardProps) {
  return (
    <div className="relative w-full h-full shadow-[20px_16px_4px_0px_rgba(0,0,0,0.45)]">
      <Image src={image} alt={name} fill className="object-cover rounded-[15px]" />
      <div className="absolute inset-0 bg-black/70 rounded-[15px]" />
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <p className="text-2xl lg:text-3xl font-normal mb-1 truncate">{name}</p>
        <p className="text-2xl lg:text-3xl font-normal mb-1">{price}</p>
        <p className="text-lg lg:text-xl font-normal mb-1">Location: {location}</p>
        <p className="text-lg lg:text-xl font-normal line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
