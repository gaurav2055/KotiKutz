import Image from "next/image";

type TeamMemberCardProps = {
  name: string;
  location: string;
  specialization: string;
  image: string;
};

export default function TeamMemberCard({ name, location, specialization, image }: TeamMemberCardProps) {
  return (
    <div className="w-full h-full rounded-[20px] overflow-hidden shadow-lg flex flex-col">
      <div className="relative flex-1">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
      <div className="bg-white px-5 py-4 shrink-0">
        <p className="text-xl font-semibold text-black">{name}</p>
        <p className="text-sm text-black mt-0.5">Location: {location}</p>
        <p className="text-sm text-black">Specialization: {specialization}</p>
      </div>
    </div>
  );
}
