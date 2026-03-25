// ServiceCard molecule — used on the Home page (Popular Services)
// and will be reused on the Services page.

import Image from "next/image";

type ServiceCardProps = {
  name: string;
  price: string;
  location: string;
  description: string;
  image: string;
};

export default function ServiceCard({
  name,
  price,
  location,
  description,
  image,
}: ServiceCardProps) {
  return (
    <div className="relative w-[410px] h-[449px] shadow-[20px_16px_4px_0px_rgba(0,0,0,0.45)] shrink-0">
      {/* Background image */}
      <Image src={image} alt={name} fill className="object-cover rounded-[15px]" />
      {/* Dark overlay so text is readable */}
      <div className="absolute inset-0 bg-black/70 rounded-[15px]" />

      {/* Text content */}
      <div className="absolute bottom-8 left-7 text-white">
        <p className="text-3xl font-normal mb-1">{name}</p>
        <p className="text-3xl font-normal mb-1">{price}</p>
        <p className="text-xl font-normal mb-1">Location: {location}</p>
        <p className="text-xl font-normal w-[341px]">{description}</p>
      </div>
    </div>
  );
}
