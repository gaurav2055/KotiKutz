import Image from "next/image";
import ServicesSlider from "@/components/ServicesSlider";
import type { SliderService } from "@/components/ServicesSlider";

const DECORATIVE = "/images/services-decorative.png";

type Props = { services: SliderService[] };

export default function PopularServicesSection({ services }: Props) {
  return (
    <section className="bg-services-bg py-12">

      {/* Section title with decorative swirl images on each side.
          mix-blend-multiply removes the white background from the image,
          making it look transparent against the grey background. */}
      <div className="flex items-center justify-center gap-6 mb-10">
        <Image src={DECORATIVE} alt="" width={80} height={80} className="rotate-180 mix-blend-multiply" />
        <h2 className="font-serif font-bold text-3xl text-black">Popular Services</h2>
        <Image src={DECORATIVE} alt="" width={80} height={80} className="-scale-y-100 mix-blend-multiply" />
      </div>

      <ServicesSlider services={services} />

    </section>
  );
}
