"use client";

interface ProductImageProps {
  image?: string | null;
  name: string;
}

export default function ProductImage({
  image,
  name,
}: ProductImageProps) {
  if (!image) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 px-3 text-center">
        <span className="line-clamp-3 text-sm font-bold text-slate-700 md:text-lg">
          {name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      className="h-full w-full object-cover rounded-[10px]"
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";

        const parent = target.parentElement;
        if (parent && !parent.querySelector(".image-fallback")) {
          const fallback = document.createElement("div");
          fallback.className =
            "image-fallback flex h-full w-full items-center justify-center bg-slate-100 px-3 text-center";
          fallback.innerHTML = `
            <span class="line-clamp-3 text-sm font-bold text-slate-700 md:text-lg">
              ${name}
            </span>
          `;
          parent.appendChild(fallback);
        }
      }}
    />
  );
}