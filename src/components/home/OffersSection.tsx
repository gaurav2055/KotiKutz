import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const OFFER_IMAGE = "/images/offer.jpg";

export default function OffersSection() {
  return (
    <section className="bg-offers-bg py-12 relative">
      {/* Left arrow */}
      <button className="absolute left-12 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-60 transition-opacity">
        <ChevronLeft className="w-6 h-6 text-black" />
      </button>

      {/* Offer card */}
      <div className="max-w-[1236px] mx-auto bg-white rounded-[30px] flex items-center gap-12 px-10 py-8 shadow-md">
        {/* Left: Offer image */}
        <Image
          src={OFFER_IMAGE}
          alt="Current Offer"
          width={378}
          height={513}
          className="object-cover shadow-[13px_11px_4px_0px_rgba(0,0,0,0.52)] border border-black shrink-0"
        />

        {/* Right: Offer details */}
        <div className="flex-1">
          <h2 className="font-serif font-bold text-3xl text-black text-center mb-6">
            Offer Title
          </h2>
          <div className="text-base text-black">
            <p className="mb-4">Offer description</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
              <li>Aliquam tincidunt mauris eu risus.</li>
              <li>Vestibulum auctor dapibus neque.</li>
              <li>Nunc dignissim risus id metus.</li>
              <li>Cras ornare tristique elit.</li>
              <li>Vivamus vestibulum nulla nec ante.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right arrow */}
      <button className="absolute right-12 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-60 transition-opacity">
        <ChevronRight className="w-6 h-6 text-black" />
      </button>
    </section>
  );
}
