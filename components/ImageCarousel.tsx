"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ImageCarousel({
  images,
  intervalMs = 4000,
}: {
  images: { src: string; alt: string; caption?: string }[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[10px]" style={{ aspectRatio: "16 / 7" }}>
      {images.map((img, i) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image src={img.src} alt={img.alt} fill className="object-cover" priority={i === 0} />

          {img.caption && (
            <div
              className="absolute bottom-4 right-4 rounded-full px-4 py-2 font-display text-sm font-medium sm:text-base"
              style={{
                backgroundColor: "rgba(10,37,64,0.72)",
                color: "#F4F8FF",
                backdropFilter: "blur(4px)",
              }}
            >
              {img.caption}
            </div>
          )}
        </div>
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === index ? 20 : 8,
                backgroundColor: i === index ? "#F4F8FF" : "rgba(244,248,255,0.5)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
