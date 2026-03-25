import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

const ABOUT_PHOTO = "/images/portrait.jpg";

export default function AboutHero() {
  return (
    <section className="max-w-[1440px] mx-auto px-16 py-16 flex gap-16 items-start">

      {/* Left: text content */}
      <div className="flex-1 pt-4">
        <h1 className="text-6xl font-bold text-black mb-8">About Us</h1>
        <p className="text-xl text-black leading-relaxed mb-10">
          Lorem ipsum dolor sit amet consectetur. Ut donec lacus lorem facilisis.
          Tortor diam sed bibendum viverra egestas convallis amet placerat.
          Non lectus lacus egestas.
        </p>
        <div className="flex gap-6">
          <Link href="/appointments">
            <Button variant="dark">Book an Appointment</Button>
          </Link>
          <Button variant="outline">Contact Me</Button>
        </div>
      </div>

      {/* Right: portrait photo */}
      <div className="relative w-[487px] h-[666px] shrink-0">
        <Image src={ABOUT_PHOTO} alt="KotiKutz" fill className="object-cover rounded-[10px]" />
      </div>

    </section>
  );
}
