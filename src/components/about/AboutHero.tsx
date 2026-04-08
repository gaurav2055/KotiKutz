import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

const DEFAULT_PORTRAIT = "/images/portrait.jpg";

type Props = {
  tagline?: string | null;
  image?:   string | null;
};

export default function AboutHero({ tagline, image }: Props) {
  return (
    <section className="max-w-[1440px] mx-auto px-16 py-16 flex gap-16 items-start">

      {/* Left: text content */}
      <div className="flex-1 pt-4">
        <h1 className="text-6xl font-bold text-black mb-8">About Us</h1>
        {tagline && (
          <p className="text-xl text-black leading-relaxed mb-10">{tagline}</p>
        )}
        <div className="flex gap-6">
          <Link href="/appointments">
            <Button variant="dark">Book an Appointment</Button>
          </Link>
          <Button variant="outline">Contact Me</Button>
        </div>
      </div>

      {/* Right: portrait photo */}
      <div className="relative w-[487px] h-[666px] shrink-0">
        <Image
          src={image || DEFAULT_PORTRAIT}
          alt="KotiKutz"
          fill
          className="object-cover rounded-[10px]"
        />
      </div>

    </section>
  );
}
