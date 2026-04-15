"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  size?: number;
};

export default function TableImage({ src, alt, size = 36 }: Props) {
  const [preview, setPreview] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setPreview(true)}
        className="shrink-0 focus:outline-none"
        aria-label={`Preview ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="rounded-md object-cover cursor-zoom-in hover:opacity-75 transition-opacity"
          unoptimized
          style={{ width: size, height: size }}
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
            src={src}
            alt={alt}
            width={900}
            height={900}
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
