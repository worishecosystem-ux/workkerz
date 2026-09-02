"use client";

import {
  Check,
  Wrench,
} from "lucide-react";

type Props = {
  services: string[];
  setServices: (
    values: string[],
  ) => void;
  availableServices: string[];
};

export default function ServiceTypeSection({
  services,
  setServices,
  availableServices,
}: Props) {
  /* =========================================
     CLEAN SERVICES
  ========================================= */

  const cleanServices = (
    values: unknown,
  ): string[] => {
    if (!Array.isArray(values)) {
      return [];
    }

    return Array.from(
      new Set(
        values
          .filter(
            (
              item,
            ): item is string =>
              typeof item === "string",
          )
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean),
      ),
    );
  };

  /* =========================================
     SAVED SERVICES
  ========================================= */

  const savedServices =
    cleanServices(services);

  /* =========================================
     AVAILABLE SERVICES
  ========================================= */

  const databaseServices =
    cleanServices(
      availableServices,
    );

  /* =========================================
     ALL SERVICES

     Saved services are kept first so that
     existing DB services remain visible.
  ========================================= */

  const allServices =
    Array.from(
      new Set([
        ...savedServices,
        ...databaseServices,
      ]),
    );

  /* =========================================
     TOGGLE SERVICE
  ========================================= */

  const toggleService = (
    service: string,
  ) => {
    const normalizedService =
      service.trim();

    if (!normalizedService) {
      return;
    }

    const exists =
      savedServices.some(
        (item) =>
          item.toLowerCase() ===
          normalizedService.toLowerCase(),
      );

    if (exists) {
      setServices(
        savedServices.filter(
          (item) =>
            item.toLowerCase() !==
            normalizedService.toLowerCase(),
        ),
      );

      return;
    }

    setServices(
      cleanServices([
        ...savedServices,
        normalizedService,
      ]),
    );
  };

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm sm:p-5">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
            Service Type
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Select all services this worker provides
          </p>
        </div>

        {savedServices.length > 0 && (
          <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#059669]">
            {savedServices.length} selected
          </span>
        )}
      </div>

      {/* =========================================
          SERVICES
      ========================================= */}

      {allServices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center">
          <Wrench
            size={22}
            className="mx-auto mb-2 text-[#94A3B8]"
          />

          <p className="text-xs text-[#64748B]">
            No service types available
          </p>

          <p className="mt-1 text-[10px] text-[#94A3B8]">
            Service types will appear here
            when available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allServices.map(
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
                    toggleService(service)
                  }
                  className={[
                    "flex min-h-[52px] w-full items-center rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98]",
                    selected
                      ? "border-[#10B981] bg-[#ECFDF5]"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]",
                  ].join(" ")}
                >
                  {/* ICON */}

                  <div
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      selected
                        ? "bg-[#10B981] text-white"
                        : "bg-[#F1F5F9] text-[#64748B]",
                    ].join(" ")}
                  >
                    <Wrench size={15} />
                  </div>

                  {/* SERVICE */}

                  <span
                    className={[
                      "ml-3 min-w-0 flex-1 truncate text-xs",
                      selected
                        ? "font-bold text-[#047857]"
                        : "font-medium text-[#334155]",
                    ].join(" ")}
                  >
                    {service}
                  </span>

                  {/* CHECK */}

                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-[#10B981] bg-[#10B981] text-white"
                        : "border-[#CBD5E1] bg-white text-transparent",
                    ].join(" ")}
                  >
                    <Check
                      size={12}
                      strokeWidth={3}
                    />
                  </span>
                </button>
              );
            },
          )}
        </div>
      )}

      {/* =========================================
          IMPORTANT INFORMATION
      ========================================= */}

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
        <p className="text-[10px] leading-4 text-[#64748B]">
          <span className="font-bold text-[#334155]">
            Note:
          </span>{" "}
          Services and Display Charge are
          separate. Display Charge is selected
          independently from the Pricing section.
        </p>
      </div>
    </section>
  );
}