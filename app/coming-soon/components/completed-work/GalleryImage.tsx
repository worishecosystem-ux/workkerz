
"use client";

import { useEffect, useState } from "react";
import { ImageOff, LoaderCircle } from "lucide-react";

interface GalleryImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fit?: "cover" | "contain";
}

export default function GalleryImage({
  src,
  alt,
  className = "",
  fallbackClassName = "bg-slate-100",
  fit = "cover",
}: GalleryImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  if (!src || error) {
    return (
      <div
        className={`flex h-full min-h-24 w-full items-center justify-center ${fallbackClassName}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6 text-slate-400" />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full min-h-24 w-full overflow-hidden ${fallbackClassName}`}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.error("Completed work image failed:", src);
          setError(true);
          setLoaded(false);
        }}
        className={`absolute inset-0 h-full w-full ${
          fit === "cover" ? "object-cover" : "object-contain"
        } ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </div>
  );
}
