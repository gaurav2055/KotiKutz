"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

export type Offer = {
  id: string;
  title: string;
  description: string | null;
  bullet_points: string[] | null;
  image_url: string | null;
};

type Props = { offers: Offer[] };

export default function OffersSection({ offers }: Props) {
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState(false);

  if (offers.length === 0) return null;

  const offer = offers[index];

  function prev() { setIndex((i) => (i - 1 + offers.length) % offers.length); }
  function next() { setIndex((i) => (i + 1) % offers.length); }

  return (
    <section className="bg-offers-bg py-8 md:py-12 relative">
      {offers.length > 1 && (
        <button onClick={prev} className="absolute left-2 md:left-12 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-60 transition-opacity z-10">
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
      )}

      <div className="max-w-[1236px] mx-auto bg-white rounded-[20px] md:rounded-[30px] flex flex-col md:flex-row items-center gap-6 md:gap-12 px-6 md:px-10 py-8 shadow-md">
        {offer.image_url && (
          <>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="shrink-0 mx-auto md:mx-0 focus:outline-none"
              aria-label={`Preview ${offer.title}`}
            >
              <Image
                src={offer.image_url}
                alt={offer.title}
                width={378}
                height={513}
                className="w-[220px] h-auto md:w-[378px] object-contain shadow-[13px_11px_4px_0px_rgba(0,0,0,0.52)] border border-black cursor-zoom-in hover:opacity-90 transition-opacity"
              />
            </button>

            {preview && (
              <div
                className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-6"
                onClick={() => setPreview(false)}
              >
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <Image
                  src={offer.image_url}
                  alt={offer.title}
                  width={900}
                  height={900}
                  className="max-w-full max-h-[85vh] object-contain rounded-xl"
                  unoptimized
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </>
        )}
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-black text-center mb-4 md:mb-6">{offer.title}</h2>
          <div className="text-base text-black">
            {offer.description && <p className="mb-4">{offer.description}</p>}
            {offer.bullet_points && offer.bullet_points.length > 0 && (
              <ul className="list-disc pl-6 space-y-3 text-left">
                {offer.bullet_points.map((point, i) => <li key={i}>{point}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>

      {offers.length > 1 && (
        <button onClick={next} className="absolute right-2 md:right-12 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-60 transition-opacity z-10">
          <ChevronRight className="w-6 h-6 text-black" />
        </button>
      )}

      {offers.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-black" : "bg-gray-400"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
