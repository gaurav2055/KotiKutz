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
    <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-10 md:py-16 flex flex-col md:flex-row gap-10 md:gap-16 items-start">

      {/* Left: text content */}
      <div className="flex-1 pt-0 md:pt-4">
        <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 md:mb-8">About Us</h1>
        {tagline && (
          <p className="text-lg md:text-xl text-black leading-relaxed mb-8 md:mb-10">{tagline}</p>
        )}
        <div className="flex flex-wrap gap-4 md:gap-6">
          <Link href="/appointments">
            <Button variant="dark">Book an Appointment</Button>
          </Link>
          <Button variant="outline">Contact Me</Button>
        </div>
      </div>

      {/* Right: portrait photo */}
      <div className="relative w-full md:w-[487px] h-[320px] md:h-[666px] shrink-0">
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
