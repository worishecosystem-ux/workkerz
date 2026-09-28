"use client";

import Image from "next/image";
import { Heart, MapPin, ArrowRight } from "lucide-react";

const properties = [
  {
    image: "/buildixads /house.jpg.jpeg",
    title: "3 BHK House",
    location: "Kolar, Bhopal",
    price: "₹85 Lakh",
  },
  {
    image: "/buildixads /flat.jpg.jpeg",
    title: "2 BHK Flat",
    location: "Arera Colony, Bhopal",
    price: "₹18,000 / month",
  },
  {
    image: "/buildixads /plot.jpg.jpeg",
    title: "Residential Plot",
    location: "Hoshangabad Road",
    price: "₹45 Lakh",
  },
];

export default function PropertyComingSoon() {
  return (
    <section className="w-full px-1">
      {/* HEADER */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[17px] font-extrabold tracking-tight text-gray-950 sm:text-[20px]">
          COMING SOON
        </h2>

        <button
          type="button"
          disabled
          className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-600 sm:text-[12px]"
        >
          View All
          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>

      {/* PROPERTY CARDS */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {properties.map((property) => (
          <div
            key={property.title}
            className="group overflow-hidden rounded-[11px] border border-gray-100 bg-white shadow-sm sm:rounded-[14px]"
          >
            {/* IMAGE */}
            <div className="relative aspect-[1.38/1] w-full overflow-hidden bg-gray-100">
              <Image
                src={property.image}
                alt={property.title}
                fill
                sizes="(max-width: 640px) 33vw, 300px"
                className="object-cover"
              />

              {/* HEART */}
              <button
                type="button"
                disabled
                aria-label="Favorite property"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-sm sm:right-2 sm:top-2 sm:h-7 sm:w-7"
              >
                <Heart className="h-3 w-3 text-gray-900 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="px-1.5 py-1.5 sm:px-2.5 sm:py-2">
              {/* TITLE */}
              <h3 className="truncate text-[10px] font-bold leading-tight text-gray-900 sm:text-[13px]">
                {property.title}
              </h3>

              {/* LOCATION */}
              <div className="mt-1 flex min-w-0 items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5 shrink-0 text-gray-500 sm:h-3 sm:w-3" />

                <span className="truncate text-[7.5px] font-medium leading-tight text-gray-500 sm:text-[10px]">
                  {property.location}
                </span>
              </div>

              {/* PRICE */}
              <p className="mt-1 text-[10px] font-extrabold leading-tight text-gray-950 sm:text-[13px]">
                {property.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}