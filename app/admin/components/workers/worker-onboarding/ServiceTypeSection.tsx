"use client";

import {
  Check,
  Wrench,
} from "lucide-react";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

type Categories = Record<
  string,
  {
    readonly subcategories: Record<
      string,
      readonly string[]
    >;
  }
>;

type Props = {
  category: string;
  subcategory: string;

  serviceTypes: string[];

  setServiceTypes: (
    values: string[],
  ) => void;

  categories: Categories;

  device: Device;
};

export default function ServiceTypeSection({
  category,
  subcategory,
  serviceTypes,
  setServiceTypes,
  categories,
  device,
}: Props) {
  /* =====================================================
     CATEGORY SERVICES
  ===================================================== */

  const categoryServices =
    category &&
    subcategory &&
    categories[category]
      ?.subcategories[
        subcategory
      ]
      ? [
          ...categories[
            category
          ].subcategories[
            subcategory
          ],
        ]
      : [];

  /* =====================================================
     NORMALIZE SERVICES
  ===================================================== */

  const savedServices =
    Array.isArray(serviceTypes)
      ? serviceTypes
          .filter(
            (
              service,
            ): service is string =>
              typeof service ===
              "string",
          )
          .map((service) =>
            service.trim(),
          )
          .filter(Boolean)
      : [];

  /* =====================================================
     AVAILABLE SERVICES

     Selected services are kept even if they are no longer
     present in the current category list.
  ===================================================== */

  const availableServices =
    Array.from(
      new Map(
        [
          ...savedServices,
          ...categoryServices,
        ].map((service) => [
          service
            .trim()
            .toLowerCase(),
          service.trim(),
        ]),
      ).values(),
    );

  /* =====================================================
     UPDATE SERVICES

     Always send a NEW string[] to parent.
  ===================================================== */

  const updateServices = (
    services: string[],
  ) => {
    const cleanServices =
      Array.from(
        new Map(
          services
            .filter(
              (
                service,
              ): service is string =>
                typeof service ===
                "string",
            )
            .map((service) =>
              service.trim(),
            )
            .filter(Boolean)
            .map((service) => [
              service
                .toLowerCase(),
              service,
            ]),
        ).values(),
      );

    console.log(
      "ONBOARD SERVICES UPDATED:",
      cleanServices,
    );

    setServiceTypes(
      cleanServices,
    );
  };

  /* =====================================================
     TOGGLE SERVICE
  ===================================================== */

  const toggleService = (
    service: string,
  ) => {
    const cleanService =
      service.trim();

    if (!cleanService) {
      return;
    }

    const exists =
      savedServices.some(
        (item) =>
          item.toLowerCase() ===
          cleanService.toLowerCase(),
      );

    if (exists) {
      updateServices(
        savedServices.filter(
          (item) =>
            item.toLowerCase() !==
            cleanService.toLowerCase(),
        ),
      );

      return;
    }

    updateServices([
      ...savedServices,
      cleanService,
    ]);
  };

  /* =====================================================
     DEVICE
  ===================================================== */

  const isMobile =
    device === "mobile";

  /* =====================================================
     NO CATEGORY
  ===================================================== */

  if (
    !category ||
    !subcategory
  ) {
    return (
      <section
        className={[
          "rounded-2xl border border-[#E2E8F0]",
          "bg-white shadow-sm",
          isMobile
            ? "p-3"
            : "p-5",
        ].join(" ")}
      >
        <h2 className="text-base font-bold text-[#0F172A]">
          Service Type
        </h2>

        <p className="mt-1 text-xs text-[#64748B]">
          Select category and
          subcategory first
        </p>

        {savedServices.length >
        0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {savedServices.map(
              (service) => (
                <span
                  key={service}
                  className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1.5 text-[11px] font-semibold text-[#047857]"
                >
                  {service}
                </span>
              ),
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center">
            <Wrench
              size={22}
              className="mx-auto mb-2 text-[#94A3B8]"
            />

            <p className="text-xs text-[#64748B]">
              Service types will
              appear here
            </p>
          </div>
        )}
      </section>
    );
  }

  /* =====================================================
     NO SERVICES
  ===================================================== */

  if (
    availableServices.length ===
    0
  ) {
    return (
      <section
        className={[
          "rounded-2xl border border-[#E2E8F0]",
          "bg-white shadow-sm",
          isMobile
            ? "p-3"
            : "p-5",
        ].join(" ")}
      >
        <h2 className="text-base font-bold text-[#0F172A]">
          Service Type
        </h2>

        <p className="mt-1 text-xs text-[#64748B]">
          No service types available
        </p>
      </section>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <section
      className={[
        "rounded-2xl border border-[#E2E8F0]",
        "bg-white shadow-sm",
        isMobile
          ? "p-3"
          : "p-5",
      ].join(" ")}
    >
      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            className={[
              "font-bold text-[#0F172A]",
              isMobile
                ? "text-base"
                : "text-lg",
            ].join(" ")}
          >
            Service Type
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Select one or more
            services
          </p>
        </div>

        {savedServices.length >
          0 && (
          <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#059669]">
            {savedServices.length}{" "}
            selected
          </span>
        )}
      </div>

      {/* SERVICE BOXES */}

      <div
        className={[
          "grid",
          device === "mobile"
            ? "grid-cols-1 gap-2"
            : device === "tablet"
              ? "grid-cols-2 gap-3"
              : "grid-cols-3 gap-3",
        ].join(" ")}
      >
        {availableServices.map(
          (service) => {
            const selected =
              savedServices.some(
                (item) =>
                  item.toLowerCase() ===
                  service.toLowerCase(),
              );

            return (
              <button
                key={service}
                type="button"
                onClick={() =>
                  toggleService(
                    service,
                  )
                }
                className={[
                  "relative flex items-center rounded-xl border",
                  "text-left transition",
                  "active:scale-[0.98]",

                  isMobile
                    ? "min-h-[48px] px-3 py-2.5"
                    : "min-h-[56px] px-3",

                  selected
                    ? "border-[#10B981] bg-[#ECFDF5] ring-1 ring-[#10B981]"
                    : "border-[#E2E8F0] bg-white hover:border-[#86EFAC] hover:bg-[#F8FFFC]",
                ].join(" ")}
              >
                {/* ICON */}

                <div
                  className={[
                    "flex shrink-0 items-center justify-center rounded-lg",

                    isMobile
                      ? "h-8 w-8"
                      : "h-9 w-9",

                    selected
                      ? "bg-[#10B981] text-white"
                      : "bg-[#F1F5F9] text-[#64748B]",
                  ].join(" ")}
                >
                  <Wrench
                    size={
                      isMobile
                        ? 15
                        : 17
                    }
                  />
                </div>

                {/* NAME */}

                <span
                  className={[
                    "ml-3 flex-1",

                    isMobile
                      ? "text-xs"
                      : "text-sm",

                    selected
                      ? "font-bold text-[#047857]"
                      : "font-medium text-[#334155]",
                  ].join(" ")}
                >
                  {service}
                </span>

                {/* CHECK */}

                <div
                  className={[
                    "ml-2 flex shrink-0 items-center justify-center rounded-full border",

                    isMobile
                      ? "h-5 w-5"
                      : "h-6 w-6",

                    selected
                      ? "border-[#10B981] bg-[#10B981] text-white"
                      : "border-[#CBD5E1] bg-white text-transparent",
                  ].join(" ")}
                >
                  <Check
                    size={
                      isMobile
                        ? 12
                        : 14
                    }
                    strokeWidth={3}
                  />
                </div>
              </button>
            );
          },
        )}
      </div>

      {/* SELECTED SERVICES */}

      {savedServices.length >
        0 && (
        <div className="mt-4 border-t border-[#F1F5F9] pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#64748B]">
              Selected Services
            </p>

            <span className="text-[11px] font-bold text-[#059669]">
              {savedServices.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {savedServices.map(
              (service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() =>
                    toggleService(
                      service,
                    )
                  }
                  className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1.5 text-[11px] font-semibold text-[#047857] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Remove service"
                >
                  {service}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}