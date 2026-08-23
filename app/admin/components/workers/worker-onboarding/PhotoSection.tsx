"use client";

import { Camera, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  photo: File | null;
  setPhoto: (file: File | null) => void;
  photoUrl?: string;
  device: "desktop" | "tablet" | "mobile";
};

export default function PhotoSection({
  photo,
  setPhoto,
  photoUrl,
  device,
}: Props) {
  const [preview, setPreview] = useState(photoUrl || "");

  useEffect(() => {
    if (!photo) {
      setPreview(photoUrl || "");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo, photoUrl]);

  const handlePhoto = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setPhoto(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview(photoUrl || "");
  };

  const isMobile = device === "mobile";
  const isTablet = device === "tablet";

  return (
    <section
      className={[
        "rounded-2xl border border-[#E5E7EB]",
        "bg-white shadow-sm",
        isMobile
          ? "p-3"
          : isTablet
            ? "p-5"
            : "p-5",
      ].join(" ")}
    >
      {/* HEADER */}

      <div className="mb-4">
        <h2
          className={[
            "font-bold text-[#111827]",
            isMobile ? "text-base" : "text-lg",
          ].join(" ")}
        >
          Worker Photo
        </h2>

        <p className="mt-1 text-xs text-[#6B7280]">
          Add a clear face photo of the worker
        </p>
      </div>

      {/* PHOTO ADDED */}

      {preview ? (
        <div
          className={[
            "relative overflow-hidden rounded-2xl",
            "border border-[#E5E7EB]",
            "bg-[#F9FAFB]",
            isMobile
              ? "h-56"
              : isTablet
                ? "h-72"
                : "h-64",
          ].join(" ")}
        >
          <Image
            src={preview}
            alt="Worker photo"
            fill
            unoptimized
            className="object-cover"
          />

          {/* TOP BADGE */}

          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#16A34A] shadow-sm">
              Photo Added
            </span>
          </div>

          {/* REMOVE */}

          <button
            type="button"
            onClick={removePhoto}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#374151] shadow-sm"
          >
            <X size={17} />
          </button>

          {/* BOTTOM ACTION */}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#111827] shadow-sm active:scale-[0.98]">
              <Camera size={17} />

              Retake Photo

              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>
          </div>
        </div>
      ) : (
        /* EMPTY STATE */

        <div
          className={[
            "rounded-2xl border-2 border-dashed",
            "border-[#D1D5DB]",
            "bg-[#FAFAFA]",
            isMobile
              ? "p-4"
              : isTablet
                ? "p-7"
                : "p-6",
          ].join(" ")}
        >
          {/* CAMERA ICON */}

          <div className="flex justify-center">
            <div
              className={[
                "flex items-center justify-center",
                "rounded-full bg-[#FFF1ED]",
                isMobile
                  ? "h-16 w-16"
                  : "h-20 w-20",
              ].join(" ")}
            >
              <Camera
                size={isMobile ? 28 : 34}
                strokeWidth={1.8}
                className="text-[#FF5C39]"
              />
            </div>
          </div>

          {/* TEXT */}

          <div className="mt-4 text-center">
            <h3 className="text-sm font-bold text-[#111827]">
              Add worker photo
            </h3>

            <p className="mt-1 text-xs text-[#6B7280]">
              Take a photo or choose one from gallery
            </p>
          </div>

          {/* ACTIONS */}

          <div
            className={[
              "mt-5 grid gap-2",
              isMobile
                ? "grid-cols-2"
                : "grid-cols-2 max-w-md mx-auto",
            ].join(" ")}
          >
            {/* CAMERA */}

            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5C39] text-sm font-semibold text-white shadow-sm active:scale-[0.98]">
              <Camera size={17} />

              Camera

              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>

            {/* GALLERY */}

            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#374151] active:scale-[0.98]">
              <ImagePlus size={17} />

              Gallery

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>
          </div>

          {/* HINT */}

          <p className="mt-3 text-center text-[10px] text-[#9CA3AF]">
            Use a clear front-facing photo
          </p>
        </div>
      )}
    </section>
  );
}